import re
import asyncio
import logging
from typing import List, Dict, Any, Optional

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
import httpx

from app.core.config import settings
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.ocr_feedback import OcrFeedback
from app.schemas.ocr_feedback import OcrFeedbackCreate, OcrFeedbackResponse
from app.services.ocr_learning import get_learning_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/health")
async def ocr_health_check() -> Dict[str, Any]:
    """
    Check if Azure Document Intelligence is properly configured
    """
    configured = bool(settings.AZURE_DOC_INTEL_ENDPOINT and settings.AZURE_DOC_INTEL_KEY)
    
    # Show cleaned endpoint
    endpoint = settings.AZURE_DOC_INTEL_ENDPOINT.rstrip("/") if settings.AZURE_DOC_INTEL_ENDPOINT else ""
    if "/formrecognizer" in endpoint:
        endpoint = endpoint.split("/formrecognizer")[0]
    
    return {
        "service": "OCR",
        "configured": configured,
        "endpoint_raw": settings.AZURE_DOC_INTEL_ENDPOINT[:80] + "..." if len(settings.AZURE_DOC_INTEL_ENDPOINT) > 80 else settings.AZURE_DOC_INTEL_ENDPOINT or "Not set",
        "endpoint_cleaned": endpoint[:80] + "..." if len(endpoint) > 80 else endpoint or "Not set",
        "full_url_sample": f"{endpoint}/formrecognizer/documentModels/{settings.AZURE_DOC_INTEL_MODEL}:analyze?api-version={settings.AZURE_DOC_INTEL_API_VERSION}" if endpoint else "Not available",
        "model": settings.AZURE_DOC_INTEL_MODEL,
        "api_version": settings.AZURE_DOC_INTEL_API_VERSION,
        "min_confidence": settings.OCR_MIN_CONFIDENCE,
        "grouping_mode": settings.OCR_GROUPING_MODE,
        "key_length": len(settings.AZURE_DOC_INTEL_KEY) if settings.AZURE_DOC_INTEL_KEY else 0,
    }


@router.get("/test-azure-connection")
async def test_azure_connection() -> Dict[str, Any]:
    """
    Test Azure Document Intelligence connection by attempting to access the service.
    This doesn't process any documents, just validates credentials and endpoint.
    """
    if not settings.AZURE_DOC_INTEL_ENDPOINT or not settings.AZURE_DOC_INTEL_KEY:
        return {
            "ok": False,
            "error": "Azure credentials not configured",
            "configured": False,
        }
    
    # Clean up endpoint
    endpoint = settings.AZURE_DOC_INTEL_ENDPOINT.rstrip("/")
    if "/formrecognizer" in endpoint:
        endpoint = endpoint.split("/formrecognizer")[0]
    
    # Try to list models (lightweight API call)
    url = f"{endpoint}/formrecognizer/documentModels?api-version={settings.AZURE_DOC_INTEL_API_VERSION}"
    headers = {
        "Ocp-Apim-Subscription-Key": settings.AZURE_DOC_INTEL_KEY,
    }
    
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(url, headers=headers)
            
            if r.status_code == 200:
                return {
                    "ok": True,
                    "message": "Azure connection successful",
                    "endpoint": endpoint,
                    "api_version": settings.AZURE_DOC_INTEL_API_VERSION,
                    "models_available": len(r.json().get("value", [])),
                }
            else:
                return {
                    "ok": False,
                    "error": f"Azure returned status {r.status_code}",
                    "detail": r.text[:500],
                    "endpoint": endpoint,
                    "url_tested": url,
                }
    except httpx.RequestError as e:
        return {
            "ok": False,
            "error": f"Failed to connect to Azure: {str(e)}",
            "endpoint": endpoint,
            "url_tested": url,
        }
    except Exception as e:
        return {
            "ok": False,
            "error": f"Unexpected error: {str(e)}",
            "endpoint": endpoint,
        }


def _avg_conf(*vals: Optional[float]) -> float:
    """Calculate average confidence from a list of values."""
    xs = [v for v in vals if isinstance(v, (int, float))]
    return sum(xs) / len(xs) if xs else 0.0


@router.post("/wine-list")
async def ocr_wine_list(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
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
    # Clean up endpoint URL (remove trailing slashes and any existing paths)
    endpoint = settings.AZURE_DOC_INTEL_ENDPOINT.rstrip("/")
    # Remove /formrecognizer if it's already in the endpoint
    if "/formrecognizer" in endpoint:
        endpoint = endpoint.split("/formrecognizer")[0]
    
    url = f"{endpoint}/formrecognizer/documentModels/{settings.AZURE_DOC_INTEL_MODEL}:analyze?api-version={settings.AZURE_DOC_INTEL_API_VERSION}"
    headers = {
        "Ocp-Apim-Subscription-Key": settings.AZURE_DOC_INTEL_KEY,
        "Content-Type": ct or "application/octet-stream"
    }

    logger.info(f"Cleaned endpoint: {endpoint}")
    logger.info(f"Full URL: {url}")
    logger.info(f"Model: {settings.AZURE_DOC_INTEL_MODEL}")
    logger.info(f"API Version: {settings.AZURE_DOC_INTEL_API_VERSION}")
    
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

    # Initialize learning service
    learning_service = get_learning_service(db)

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

        # Apply learning bias
        bias_score = learning_service.calculate_bias_score(raw)
        adjusted_conf = min(1.0, it["conf"] * bias_score)
        
        # Apply learned corrections
        name = learning_service.apply_corrections(name) or name
        
        # Filter out items with strong rejection signals
        if learning_service.should_filter_out(raw):
            continue  # Skip this item

        parsed.append({
            "name": name or None,
            "vintage": vint,
            "price_usd": price,
            "bottle_size": size,
            "confidence": round(adjusted_conf, 3),
            "raw": raw,
            "status": "ok" if (adjusted_conf >= settings.OCR_MIN_CONFIDENCE and name) else "review",
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


# OCR Feedback Endpoints

@router.post("/feedback", response_model=OcrFeedbackResponse)
async def submit_ocr_feedback(
    feedback: OcrFeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit feedback on an OCR-parsed wine entry.
    
    Actions:
    - 'accept': User confirms the parsed data is correct
    - 'edit': User corrects one or more fields
    - 'reject': User marks the entry as incorrect/invalid
    """
    # Validate action
    if feedback.action not in ['accept', 'edit', 'reject']:
        raise HTTPException(
            status_code=400,
            detail="Action must be 'accept', 'edit', or 'reject'"
        )
    
    # Create feedback entry
    db_feedback = OcrFeedback(
        raw_text=feedback.raw_text,
        confidence=feedback.confidence,
        parsed_name=feedback.parsed_name,
        parsed_producer=feedback.parsed_producer,
        parsed_region=feedback.parsed_region,
        parsed_vintage=feedback.parsed_vintage,
        parsed_price=feedback.parsed_price,
        action=feedback.action,
        corrected_name=feedback.corrected_name,
        corrected_producer=feedback.corrected_producer,
        corrected_region=feedback.corrected_region,
        corrected_vintage=feedback.corrected_vintage,
        corrected_price=feedback.corrected_price,
        user_id=current_user.id
    )
    
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    
    return db_feedback


@router.get("/feedback/recent", response_model=List[OcrFeedbackResponse])
async def get_recent_feedback(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get recent OCR feedback entries (for debugging/analysis).
    """
    feedback_list = (
        db.query(OcrFeedback)
        .filter(OcrFeedback.user_id == current_user.id)
        .order_by(OcrFeedback.created_at.desc())
        .limit(limit)
        .all()
    )
    
    return feedback_list


@router.get("/feedback/stats")
async def get_feedback_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get OCR feedback statistics for the current user.
    """
    total = db.query(OcrFeedback).filter(OcrFeedback.user_id == current_user.id).count()
    accepted = db.query(OcrFeedback).filter(
        OcrFeedback.user_id == current_user.id,
        OcrFeedback.action == 'accept'
    ).count()
    edited = db.query(OcrFeedback).filter(
        OcrFeedback.user_id == current_user.id,
        OcrFeedback.action == 'edit'
    ).count()
    rejected = db.query(OcrFeedback).filter(
        OcrFeedback.user_id == current_user.id,
        OcrFeedback.action == 'reject'
    ).count()
    
    return {
        "total": total,
        "accepted": accepted,
        "edited": edited,
        "rejected": rejected,
        "accuracy": round(accepted / total * 100, 1) if total > 0 else 0
    }

