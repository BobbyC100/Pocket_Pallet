"""
Wine name normalization utilities for fuzzy matching.

This module provides functions to normalize wine names by removing diacritics,
special characters, and extra whitespace to enable consistent fuzzy matching.
"""
import re
import unicodedata


def normalize_name(name: str | None) -> str:
    """
    Normalize a wine name for consistent fuzzy matching.
    
    Steps:
    1. Handle None/empty strings
    2. Lowercase
    3. Remove diacritics (é → e, ñ → n)
    4. Remove special characters (quotes, punctuation except spaces)
    5. Collapse multiple spaces
    6. Strip leading/trailing whitespace
    
    Args:
        name: Wine name to normalize (can be None)
        
    Returns:
        Normalized lowercase string suitable for matching
        
    Examples:
        >>> normalize_name("Gatinois \"Grand Cru\" Brut Réserve")
        'gatinois grand cru brut reserve'
        >>> normalize_name("  Raventós   i   Blanc  ")
        'raventos i blanc'
        >>> normalize_name(None)
        ''
    """
    if not name:
        return ""
    
    # Lowercase
    normalized = name.lower()
    
    # Remove diacritics (decompose unicode, strip combining marks)
    normalized = unicodedata.normalize('NFD', normalized)
    normalized = ''.join(
        char for char in normalized
        if unicodedata.category(char) != 'Mn'  # Mn = Mark, Nonspacing
    )
    
    # Remove special characters (keep only alphanumeric and spaces)
    normalized = re.sub(r'[^a-z0-9\s]', ' ', normalized)
    
    # Collapse multiple spaces and strip
    normalized = re.sub(r'\s+', ' ', normalized).strip()
    
    return normalized

