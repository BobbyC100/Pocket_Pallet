"""
AI-powered wine parsing service using OpenAI GPT-4.

Converts raw wine names/titles into structured data.
"""

import json
import re
from typing import Dict, Optional, List
from openai import AsyncOpenAI
import os


class WineParser:
    """Parse wine names using OpenAI GPT-4."""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the wine parser.
        
        Args:
            api_key: OpenAI API key (defaults to OPENAI_API_KEY env var)
        """
        self.client = AsyncOpenAI(api_key=api_key or os.getenv("OPENAI_API_KEY"))
        self.model = "gpt-4o-mini"  # Cost-effective model for structured extraction
    
    async def parse(self, raw_name: str) -> Dict[str, any]:
        """
        Parse a raw wine name into structured fields.
        
        Args:
            raw_name: Raw wine name/title (e.g., "2019 Domaine Leroy Vosne-Romanée Les Beaux Monts 750ml")
            
        Returns:
            Dict with keys: vintage, producer, cuvee, region, appellation, bottle_size_ml, style
        """
        if not raw_name or not raw_name.strip():
            return self._empty_result()
        
        system_prompt = """You are a wine data expert. Extract structured information from wine names/titles.

Return valid JSON with these fields (use null for unknown):
{
  "vintage": integer year or null,
  "producer": string,
  "cuvee": string (wine name, e.g., "Vosne-Romanée Les Beaux Monts"),
  "region": string (e.g., "Burgundy", "Bordeaux", "Napa Valley"),
  "appellation": string (e.g., "Vosne-Romanée", "Pauillac"),
  "bottle_size_ml": integer (750, 1500, etc.) or null,
  "style": string ("Red", "White", "Rosé", "Sparkling", "Dessert", "Fortified") or null
}

Rules:
- Producer is the winery/domaine name
- Cuvee is the specific wine name (vineyard, blend name, etc.)
- If no cuvee, use the appellation or generic description
- Infer region from appellation when possible
- Be conservative - return null if uncertain
- Standardize regions (use common English names)

Examples:

"2019 Domaine Leroy Vosne-Romanée Les Beaux Monts 750ml"
→ {
  "vintage": 2019,
  "producer": "Domaine Leroy",
  "cuvee": "Vosne-Romanée Les Beaux Monts",
  "region": "Burgundy",
  "appellation": "Vosne-Romanée",
  "bottle_size_ml": 750,
  "style": "Red"
}

"Château Lynch-Bages 2015 Pauillac"
→ {
  "vintage": 2015,
  "producer": "Château Lynch-Bages",
  "cuvee": "Pauillac",
  "region": "Bordeaux",
  "appellation": "Pauillac",
  "bottle_size_ml": 750,
  "style": "Red"
}

"NV Dom Pérignon Champagne Brut"
→ {
  "vintage": null,
  "producer": "Dom Pérignon",
  "cuvee": "Brut",
  "region": "Champagne",
  "appellation": "Champagne",
  "bottle_size_ml": 750,
  "style": "Sparkling"
}
"""

        user_prompt = f"Extract wine data from: \"{raw_name}\""
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.1,  # Low temperature for consistent extraction
                max_tokens=300
            )
            
            result = json.loads(response.choices[0].message.content)
            
            # Validate and clean result
            return self._validate_result(result)
            
        except Exception as e:
            print(f"Error parsing wine '{raw_name}': {e}")
            return self._empty_result()
    
    async def parse_batch(self, raw_names: List[str], batch_size: int = 10) -> List[Dict[str, any]]:
        """
        Parse multiple wine names in batches.
        
        Args:
            raw_names: List of raw wine names
            batch_size: Number of wines to parse per API call (default: 10)
            
        Returns:
            List of parsed wine dictionaries
        """
        results = []
        
        for i in range(0, len(raw_names), batch_size):
            batch = raw_names[i:i+batch_size]
            
            # Build batch prompt
            wines_text = "\n".join([f"{idx+1}. {name}" for idx, name in enumerate(batch)])
            
            system_prompt = """You are a wine data expert. Extract structured information from wine names/titles.

For each wine, return valid JSON with these fields (use null for unknown):
{
  "vintage": integer year or null,
  "producer": string,
  "cuvee": string,
  "region": string,
  "appellation": string,
  "bottle_size_ml": integer or null,
  "style": string or null
}

Return a JSON array of objects, one per wine in order."""

            user_prompt = f"Extract wine data from these wines:\n\n{wines_text}"
            
            try:
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.1,
                    max_tokens=2000
                )
                
                content = response.choices[0].message.content
                batch_results = json.loads(content)
                
                # Handle both array and object responses
                if isinstance(batch_results, dict):
                    batch_results = batch_results.get("wines", batch_results.get("results", []))
                
                for result in batch_results:
                    results.append(self._validate_result(result))
                    
            except Exception as e:
                print(f"Error parsing batch: {e}")
                # Append empty results for failed batch
                results.extend([self._empty_result() for _ in batch])
        
        return results
    
    def _validate_result(self, result: Dict) -> Dict[str, any]:
        """Validate and normalize parsed result."""
        validated = {
            "vintage": self._parse_vintage(result.get("vintage")),
            "producer": result.get("producer") or None,
            "cuvee": result.get("cuvee") or None,
            "region": result.get("region") or None,
            "appellation": result.get("appellation") or None,
            "bottle_size_ml": self._parse_bottle_size(result.get("bottle_size_ml")),
            "style": result.get("style") or None
        }
        
        # Clean up strings
        for key in ["producer", "cuvee", "region", "appellation", "style"]:
            if validated[key]:
                validated[key] = validated[key].strip()
        
        return validated
    
    def _parse_vintage(self, vintage) -> Optional[int]:
        """Parse vintage to int."""
        if vintage is None:
            return None
        if isinstance(vintage, int):
            return vintage if 1800 <= vintage <= 2100 else None
        if isinstance(vintage, str):
            # Extract 4-digit year
            match = re.search(r'\b(19|20)\d{2}\b', vintage)
            if match:
                return int(match.group())
        return None
    
    def _parse_bottle_size(self, size) -> Optional[int]:
        """Parse bottle size to ml."""
        if size is None:
            return None
        if isinstance(size, int):
            return size if size > 0 else None
        if isinstance(size, str):
            # Extract number
            match = re.search(r'\d+', size)
            if match:
                return int(match.group())
        return None
    
    def _empty_result(self) -> Dict[str, any]:
        """Return empty/null result structure."""
        return {
            "vintage": None,
            "producer": None,
            "cuvee": None,
            "region": None,
            "appellation": None,
            "bottle_size_ml": None,
            "style": None
        }


# Convenience functions
_parser = None

async def parse_wine_name(raw_name: str) -> Dict[str, any]:
    """
    Parse a single wine name.
    
    Usage:
        result = await parse_wine_name("2019 Domaine Leroy Vosne-Romanée Les Beaux Monts 750ml")
    """
    global _parser
    if _parser is None:
        _parser = WineParser()
    return await _parser.parse(raw_name)


async def parse_wine_names(raw_names: List[str]) -> List[Dict[str, any]]:
    """
    Parse multiple wine names in batch.
    
    Usage:
        results = await parse_wine_names([
            "2019 Château Margaux",
            "NV Dom Pérignon Brut"
        ])
    """
    global _parser
    if _parser is None:
        _parser = WineParser()
    return await _parser.parse_batch(raw_names)

