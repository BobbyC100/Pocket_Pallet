"""Text normalization functions."""
import re
from unidecode import unidecode


def normalize_text(text: str) -> str:
    """
    Normalize text for matching:
    - Remove diacritics
    - Lowercase
    - Remove extra whitespace
    - Remove punctuation
    """
    if not text:
        return ""
    
    # Remove diacritics
    text = unidecode(text)
    
    # Lowercase
    text = text.lower()
    
    # Remove punctuation except spaces
    text = re.sub(r'[^\w\s]', '', text)
    
    # Normalize whitespace
    text = ' '.join(text.split())
    
    return text


def normalize_producer(name: str) -> str:
    """
    Normalize producer name for matching.
    Removes common suffixes and legal entities.
    """
    if not name:
        return ""
    
    normalized = normalize_text(name)
    
    # Remove common suffixes
    suffixes = [
        r'\b(winery|wines|vineyards?|estate|cellars?|domaine|chateau|bodega|cantina)\b',
        r'\b(llc|inc|ltd|corp|corporation|sa|srl|gmbh)\b',
        r'\b(et fils|e figli|y hijos)\b'
    ]
    
    for suffix in suffixes:
        normalized = re.sub(suffix, '', normalized)
    
    # Clean up any double spaces
    normalized = ' '.join(normalized.split())
    
    return normalized.strip()


def normalize_grape(grape_name: str) -> str:
    """
    Normalize grape variety name.
    Maps common abbreviations to full names.
    """
    if not grape_name:
        return ""
    
    normalized = normalize_text(grape_name)
    
    # Common grape name mappings
    mappings = {
        'cab sauv': 'cabernet sauvignon',
        'cab': 'cabernet sauvignon',
        'merlot': 'merlot',
        'pinot noir': 'pinot noir',
        'pinot': 'pinot noir',
        'chard': 'chardonnay',
        'sauv blanc': 'sauvignon blanc',
        'sauv bl': 'sauvignon blanc',
        'tempranillo': 'tempranillo',
        'temp': 'tempranillo',
        'syrah': 'syrah',
        'shiraz': 'syrah',
        'malbec': 'malbec',
        'grenache': 'grenache',
        'garnacha': 'grenache',
        'sangiovese': 'sangiovese',
        'nebbiolo': 'nebbiolo',
        'zinfandel': 'zinfandel',
        'zin': 'zinfandel',
        'pinot grigio': 'pinot gris',
        'pinot gris': 'pinot gris',
    }
    
    # Try exact match first
    if normalized in mappings:
        return mappings[normalized]
    
    # Try partial matches
    for abbr, full_name in mappings.items():
        if abbr in normalized or normalized in abbr:
            return full_name
    
    return normalized


def normalize_cuvee(cuvee: str) -> str:
    """Normalize cuvée/wine name."""
    if not cuvee:
        return ""
    
    normalized = normalize_text(cuvee)
    
    # Remove common wine descriptors that might vary
    descriptors = [
        r'\b(red|white|rose|rosé|reserve|reserva|riserva|gran|grande)\b'
    ]
    
    for desc in descriptors:
        # Don't remove if it's the only word
        if len(normalized.split()) > 1:
            normalized = re.sub(desc, '', normalized)
    
    normalized = ' '.join(normalized.split())
    return normalized.strip()

