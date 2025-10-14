"""
AI-powered CSS selector detection for wine retailer websites.

Uses OpenAI GPT-4 to analyze HTML and suggest optimal CSS selectors.
"""

import httpx
from bs4 import BeautifulSoup
from openai import AsyncOpenAI
from typing import Dict, Any
import os
import re

from app.schemas.scraper import DetectSelectorsResponse


class SelectorDetectorService:
    """Detect CSS selectors using AI analysis of HTML structure."""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    async def detect_selectors(self, url: str) -> DetectSelectorsResponse:
        """
        Analyze a wine retailer page and suggest CSS selectors.
        
        Steps:
        1. Fetch the HTML
        2. Extract relevant structure
        3. Send to GPT-4 for analysis
        4. Parse and validate suggestions
        """
        
        try:
            # Fetch page HTML
            html = await self._fetch_html(url)
        except Exception as e:
            raise Exception(f"Failed to fetch URL: {str(e)}")
        
        # Extract key HTML snippets
        snippets = self._extract_key_snippets(html)
        
        # Ask GPT-4 to analyze and suggest selectors
        suggestions = await self._analyze_with_gpt(url, snippets)
        
        # Build response
        return DetectSelectorsResponse(
            url=url,
            suggested_name=suggestions.get("name"),
            product_link_selector=suggestions.get("product_selector"),
            pagination_next_selector=suggestions.get("pagination_selector"),
            requires_playwright=suggestions.get("requires_playwright", False),
            confidence=suggestions.get("confidence", "medium"),
            notes=suggestions.get("notes")
        )
    
    async def _fetch_html(self, url: str) -> str:
        """Fetch HTML from URL."""
        async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.text
    
    def _extract_key_snippets(self, html: str) -> Dict[str, str]:
        """Extract relevant HTML snippets for analysis."""
        soup = BeautifulSoup(html, 'html.parser')
        
        snippets = {}
        
        # Get page title
        title_tag = soup.find('title')
        snippets['title'] = title_tag.get_text() if title_tag else ""
        
        # Find product-like elements (links with prices nearby)
        product_candidates = []
        for link in soup.find_all('a', href=True, limit=20):
            # Look for links that might be products
            if '/product' in link.get('href', '') or '/wine' in link.get('href', ''):
                snippet = str(link)[:500]  # First 500 chars
                product_candidates.append(snippet)
        
        snippets['product_examples'] = product_candidates[:5]  # Top 5
        
        # Find pagination elements
        pagination_candidates = []
        for elem in soup.find_all(['a', 'button', 'li'], limit=30):
            text = elem.get_text().strip().lower()
            if any(word in text for word in ['next', 'more', '→', '»', 'load more']):
                snippet = str(elem.parent)[:300] if elem.parent else str(elem)[:300]
                pagination_candidates.append(snippet)
        
        snippets['pagination_examples'] = pagination_candidates[:3]
        
        # Detect common frameworks
        html_lower = html.lower()
        snippets['framework'] = (
            'Shopify' if 'shopify' in html_lower else
            'WooCommerce' if 'woocommerce' in html_lower else
            'Magento' if 'magento' in html_lower else
            'Custom'
        )
        
        return snippets
    
    async def _analyze_with_gpt(self, url: str, snippets: Dict[str, str]) -> Dict[str, Any]:
        """Use GPT-4 to analyze HTML and suggest selectors."""
        
        prompt = f"""You are an expert web scraper analyzing a wine retailer website.

URL: {url}
Page Title: {snippets.get('title', 'N/A')}
Framework: {snippets.get('framework', 'Unknown')}

**Product Link Examples:**
{self._format_examples(snippets.get('product_examples', []))}

**Pagination Examples:**
{self._format_examples(snippets.get('pagination_examples', []))}

---

**Task:** Suggest CSS selectors for scraping this wine retailer.

**Required Output (JSON format):**
{{
  "name": "Suggested source name (e.g., 'Wine.com Red Wines')",
  "product_selector": "CSS selector to find product links (e.g., '.product-card a.title')",
  "pagination_selector": "CSS selector for next page button (or null if no pagination)",
  "requires_playwright": false (true if page uses heavy JavaScript),
  "confidence": "high/medium/low",
  "notes": "Any warnings or special instructions"
}}

**Guidelines:**
- Be specific with selectors (e.g., use classes: `.product-item a` not just `a`)
- For pagination, look for "next" button or last page number
- Set requires_playwright=true only if products load via JavaScript
- Confidence: high if clear patterns, low if uncertain
- Notes: mention any potential issues

Respond ONLY with valid JSON, no other text."""

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a web scraping expert. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            content = response.choices[0].message.content.strip()
            
            # Try to extract JSON if wrapped in code blocks
            json_match = re.search(r'```json\s*(.*?)\s*```', content, re.DOTALL)
            if json_match:
                content = json_match.group(1)
            
            # Parse JSON
            import json
            result = json.loads(content)
            
            return result
            
        except Exception as e:
            # Fallback to basic detection
            return {
                "name": snippets.get('title', 'Wine Retailer'),
                "product_selector": "a[href*='/product'], a[href*='/wine']",
                "pagination_selector": "a[rel='next']",
                "requires_playwright": False,
                "confidence": "low",
                "notes": f"AI detection failed: {str(e)}. Using fallback selectors."
            }
    
    def _format_examples(self, examples: list) -> str:
        """Format HTML examples for GPT prompt."""
        if not examples:
            return "(No examples found)"
        
        formatted = []
        for i, ex in enumerate(examples, 1):
            # Clean up HTML for readability
            clean = ex.replace('\n', ' ').strip()
            if len(clean) > 400:
                clean = clean[:400] + "..."
            formatted.append(f"{i}. {clean}")
        
        return "\n".join(formatted)

