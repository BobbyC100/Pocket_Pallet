import re
import asyncio
import logging
from typing import List, Dict, Any, Optional

from fastapi import APIRouter, UploadFile, File, HTTPException
import httpx

from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

API_VERSION = "2024-07-31"


@router.get("/health")
async def ocr_health_check() -> Dict[str, Any]:
    """
    Check if Azure Document Intelligence is properly configured
    """
    configured = bool(settings.AZURE_DOC_INTEL_ENDPOINT and settings.AZURE_DOC_INTEL_KEY)
    
    return {
        "service": "OCR",
        "configured": configured,
        "endpoint": settings.AZURE_DOC_INTEL_ENDPOINT[:50] + "..." if settings.AZURE_DOC_INTEL_ENDPOINT else "Not set",
        "model": settings.AZURE_DOC_INTEL_MODEL,
        "min_confidence": settings.OCR_MIN_CONFIDENCE,
        "grouping_mode": settings.OCR_GROUPING_MODE,
        "key_length": len(settings.AZURE_DOC_INTEL_KEY) if settings.AZURE_DOC_INTEL_KEY else 0,
    }


def _avg_conf(*vals: Optional[float]) -> float:
    """Calculate average confidence from a list of values."""
    xs = [v for v in vals if isinstance(v, (int, float))]
    return sum(xs) / len(xs) if xs else 0.0


@router.post("/wine-list")
async def ocr_wine_list(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Upload a wine list (PDF or image) and extract structured wine data using Azure Document Intelligence.
    
    Returns:
        JSON with extracted wine items including name, vintage, price, size, and confidence scores.
    """
    logger.info(f"OCR request received for file: {file.filename}, content_type: {file.content_type}")
    
    # Validate Azure credentials
    if not settings.AZURE_DOC_INTEL_ENDPOINT or not settings.AZURE_DOC_INTEL_KEY:
        logger.error("Azure credentials not configured")
        raise HTTPException(
            status_code=500,
            detail="Azure Document Intelligence not configured. Set AZURE_DOC_INTEL_ENDPOINT and AZURE_DOC_INTEL_KEY."
        )
    
    logger.info(f"Azure endpoint: {settings.AZURE_DOC_INTEL_ENDPOINT}")
    logger.info(f"Azure model: {settings.AZURE_DOC_INTEL_MODEL}")
    
    # 1) Validate file
    ct = file.content_type or ""
    if not any(x in ct for x in ["pdf", "image", "png", "jpeg", "jpg"]):
        if not file.filename or not file.filename.lower().endswith((".pdf", ".png", ".jpg", ".jpeg")):
            raise HTTPException(status_code=400, detail="Upload a PDF or image (PNG/JPG)")
    
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    
    if len(data) > 25 * 1024 * 1024:  # 25MB limit
        raise HTTPException(status_code=400, detail="File too large (max 25MB)")

    # 2) Submit to Azure Document Intelligence
    url = f"{settings.AZURE_DOC_INTEL_ENDPOINT}/formrecognizer/documentModels/{settings.AZURE_DOC_INTEL_MODEL}:analyze?api-version={API_VERSION}"
    headers = {
        "Ocp-Apim-Subscription-Key": settings.AZURE_DOC_INTEL_KEY,
        "Content-Type": ct or "application/octet-stream"
    }

    logger.info(f"Submitting to Azure: {url}")
    
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            r = await client.post(url, headers=headers, content=data)
            logger.info(f"Azure response status: {r.status_code}")
            
            if r.status_code not in (200, 202):
                logger.error(f"Azure analyze failed with status {r.status_code}: {r.text}")
                raise HTTPException(status_code=502, detail=f"Azure analyze failed: {r.text}")

            # 3) Immediate result or poll
            result = r.json() if r.status_code == 200 else None
            if not result:
                op_url = r.headers.get("operation-location")
                if not op_url:
                    logger.error("Missing operation-location header")
                    raise HTTPException(status_code=502, detail="Missing operation-location")
                
                logger.info(f"Polling Azure operation: {op_url}")
                # Poll for result
                for _ in range(30):
                    rr = await client.get(op_url, headers={"Ocp-Apim-Subscription-Key": settings.AZURE_DOC_INTEL_KEY})
                    if rr.status_code == 200:
                        result = rr.json()
                        status_ = result.get("status")
                        logger.info(f"Azure operation status: {status_}")
                        if status_ in ("succeeded", "failed", "partiallySucceeded"):
                            break
                    await asyncio.sleep(1)
                
                if not result or result.get("status") not in ("succeeded", "partiallySucceeded"):
                    logger.error(f"Azure OCR did not complete in time. Status: {result.get('status') if result else 'No result'}")
                    raise HTTPException(status_code=502, detail="Azure OCR did not complete in time")
    except httpx.RequestError as e:
        logger.error(f"HTTP request error: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Failed to connect to Azure: {str(e)}")
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Unexpected error during Azure submission: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"OCR processing error: {str(e)}")

    # 4) Collect lines from pages
    analyze = result.get("analyzeResult") or {}
    pages = analyze.get("pages", [])
    lines: List[Dict[str, Any]] = []
    
    for p in pages:
        for ln in p.get("lines", []):
            # Get confidence from line or fallback to span confidence
            confidence = ln.get("confidence")
            if confidence is None:
                spans = ln.get("spans", [])
                confidence = spans[0].get("confidence", 1.0) if spans else 1.0
            
            lines.append({
                "text": (ln.get("content") or "").strip(),
                "confidence": confidence,
                "page": p.get("pageNumber", 1),
                "polygon": ln.get("polygon"),
            })

    # 5) Group lines into items
    items = []
    buf: List[Dict[str, Any]] = []

    def flush():
        if not buf:
            return
        block = " ".join(x["text"] for x in buf).strip()
        conf = _avg_conf(*[x["confidence"] for x in buf])
        items.append({"raw": block, "conf": conf, "parts": buf.copy()})
        buf.clear()

    VINT = re.compile(r"\b(19\d{2}|20\d{2}|NV)\b", re.I)

    if settings.OCR_GROUPING_MODE == "smarter":
        PRICE_HINT = re.compile(r"[$\u20AC\u00A3]|\b\d{1,3}(?:[.,]\d{2})?\b")
        for ln in lines:
            t = ln["text"]
            if not t:
                continue
            # Check if this looks like a new wine entry
            looks_new = bool(t[0].isupper() and (PRICE_HINT.search(t) or VINT.search(t)))
            if buf and looks_new:
                flush()
            buf.append(ln)
        flush()
    else:
        # Simple mode: flush when we see price or vintage
        for ln in lines:
            t = ln["text"]
            if buf and (("$" in t) or ("\u20AC" in t) or ("\u00A3" in t) or VINT.search(t)):
                flush()
            buf.append(ln)
        flush()

    # 6) Extract fields per item
    PRICE = re.compile(
        r"""(?x)
        (?:[$\u20AC\u00A3]\s*)?           # optional currency: $, €, £
        (?P<num>
          \d{1,3} (?:[,\s]\d{3})*         # 1,234 or 1 234
          (?:[.,]\d{2})?                    # optional .99 / ,99
          |\d+                              # or just 12
        )
        \s*(?:bt|btl|bottle|glass)?
        """, re.I
    )
    SIZE = re.compile(r"\b(375ml|750ml|1\.5L|1500ml|3L|5L)\b", re.I)

    parsed = []
    for it in items:
        raw = it["raw"]

        # Extract price
        price = None
        pm = list(PRICE.finditer(raw))
        if pm:
            num = pm[-1].group("num")
            num_norm = num.replace(" ", "").replace(",", "")
            # Handle multiple dots
            if num_norm.count(".") > 1:
                parts = num_norm.split(".")
                num_norm = "".join(parts[:-1]) + "." + parts[-1]
            try:
                price = float(num_norm)
            except ValueError:
                price = None

        # Extract vintage
        vint = None
        mv = VINT.search(raw)
        if mv:
            vint = mv.group(1).upper()

        # Extract bottle size
        size = None
        ms = SIZE.search(raw)
        if ms:
            size = ms.group(1)

        # Extract name (remove price, vintage, size)
        name = raw
        for pat in (PRICE, VINT, SIZE):
            name = pat.sub("", name)
        name = re.sub(r"\s{2,}", " ", name).strip(" -–—•·")

        parsed.append({
            "name": name or None,
            "vintage": vint,
            "price_usd": price,
            "bottle_size": size,
            "confidence": round(min(1.0, it["conf"]), 3),
            "raw": raw,
            "status": "ok" if (it["conf"] >= settings.OCR_MIN_CONFIDENCE and name) else "review",
        })

    return {
        "ok": True,
        "items": parsed,
        "meta": {
            "pages": len(pages),
            "engine": f"azure-document-intelligence-v4:{settings.AZURE_DOC_INTEL_MODEL}",
            "threshold": settings.OCR_MIN_CONFIDENCE,
            "grouping": settings.OCR_GROUPING_MODE,
        },
    }

