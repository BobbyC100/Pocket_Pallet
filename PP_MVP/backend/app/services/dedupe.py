"""
Wine deduplication service using blocking + fuzzy matching.

Strategy:
1. Normalize producer/cuvee names
2. Create blocking keys (producer_firstword + vintage)
3. Within each block, compute similarity scores
4. Merge duplicates above threshold
"""

import re
from typing import List, Tuple, Dict, Optional
from rapidfuzz import fuzz
from sqlalchemy.orm import Session


def normalize_text(text: Optional[str]) -> str:
    """
    Normalize text for deduplication matching.
    
    Rules:
    - Lowercase
    - Remove accents/diacritics
    - Remove punctuation except spaces
    - Collapse multiple spaces
    - Trim
    
    Args:
        text: Raw text
        
    Returns:
        Normalized text
    """
    if not text:
        return ""
    
    # Lowercase
    text = text.lower()
    
    # Remove accents (simple ASCII conversion)
    # For production, use unidecode library for better handling
    text = text.encode('ascii', 'ignore').decode('ascii')
    
    # Remove punctuation except spaces
    text = re.sub(r'[^\w\s]', '', text)
    
    # Collapse multiple spaces
    text = re.sub(r'\s+', ' ', text)
    
    # Trim
    text = text.strip()
    
    return text


def create_blocking_key(producer: Optional[str], vintage: Optional[str]) -> str:
    """
    Create a blocking key for deduplication.
    
    Blocking key = first word of producer + vintage
    This groups similar wines together for comparison.
    
    Args:
        producer: Producer name
        vintage: Vintage year
        
    Returns:
        Blocking key (e.g., "chateau_2015", "domaine_2019")
    """
    if not producer:
        return "unknown_" + (vintage or "nv")
    
    norm_producer = normalize_text(producer)
    first_word = norm_producer.split()[0] if norm_producer else "unknown"
    
    # Limit first word length
    first_word = first_word[:20]
    
    vintage_str = vintage or "nv"  # "nv" for non-vintage
    
    return f"{first_word}_{vintage_str}"


def calculate_similarity(
    wine1: Dict[str, str],
    wine2: Dict[str, str]
) -> float:
    """
    Calculate similarity score between two wines.
    
    Uses multiple fuzzy matching algorithms:
    - token_set_ratio (ignores word order, good for multi-word names)
    - partial_ratio (detects substrings)
    - token_sort_ratio (sorts words alphabetically)
    
    Args:
        wine1: Dict with keys: producer, cuvee, norm_producer, norm_cuvee
        wine2: Dict with keys: producer, cuvee, norm_producer, norm_cuvee
        
    Returns:
        Similarity score (0-100)
    """
    scores = []
    
    # Compare normalized producers
    if wine1.get("norm_producer") and wine2.get("norm_producer"):
        scores.append(fuzz.token_set_ratio(
            wine1["norm_producer"],
            wine2["norm_producer"]
        ))
    
    # Compare normalized cuvees
    if wine1.get("norm_cuvee") and wine2.get("norm_cuvee"):
        scores.append(fuzz.token_set_ratio(
            wine1["norm_cuvee"],
            wine2["norm_cuvee"]
        ))
    
    # Compare full normalized name (producer + cuvee)
    full1 = f"{wine1.get('norm_producer', '')} {wine1.get('norm_cuvee', '')}".strip()
    full2 = f"{wine2.get('norm_producer', '')} {wine2.get('norm_cuvee', '')}".strip()
    
    if full1 and full2:
        scores.extend([
            fuzz.partial_ratio(full1, full2),
            fuzz.token_sort_ratio(full1, full2)
        ])
    
    # Return weighted average
    if not scores:
        return 0.0
    
    return sum(scores) / len(scores)


def find_duplicate_candidates(
    wines: List[Dict],
    threshold: float = 87.5
) -> List[Tuple[int, int, float]]:
    """
    Find duplicate wine candidates within a block.
    
    Args:
        wines: List of wine dicts (must have: id, norm_producer, norm_cuvee, vintage)
        threshold: Minimum similarity score to consider duplicates (0-100)
        
    Returns:
        List of tuples: (wine1_id, wine2_id, similarity_score)
    """
    candidates = []
    
    # Compare each pair
    for i in range(len(wines)):
        for j in range(i + 1, len(wines)):
            wine1 = wines[i]
            wine2 = wines[j]
            
            # Must have same vintage (or both non-vintage)
            if wine1.get("vintage") != wine2.get("vintage"):
                continue
            
            # Calculate similarity
            score = calculate_similarity(wine1, wine2)
            
            if score >= threshold:
                candidates.append((wine1["id"], wine2["id"], score))
    
    # Sort by score (highest first)
    candidates.sort(key=lambda x: x[2], reverse=True)
    
    return candidates


def merge_duplicates(
    wine_ids: List[int],
    master_id: int,
    db: Session,
    model_class
) -> int:
    """
    Merge duplicate wines by marking them as inactive and pointing to master.
    
    Args:
        wine_ids: List of duplicate wine IDs
        master_id: ID of the master wine to keep
        db: Database session
        model_class: SQLAlchemy model class (Wine or ScrapedWine)
        
    Returns:
        Number of wines merged
    """
    merged_count = 0
    
    for wine_id in wine_ids:
        if wine_id == master_id:
            continue  # Don't merge master with itself
        
        wine = db.query(model_class).filter(model_class.id == wine_id).first()
        if wine:
            wine.is_active = False
            wine.duplicate_of = master_id
            merged_count += 1
    
    db.commit()
    return merged_count


def cluster_duplicates(candidates: List[Tuple[int, int, float]]) -> List[List[int]]:
    """
    Cluster duplicate candidates into groups using greedy merging.
    
    Each cluster represents wines that should be merged together.
    Uses greedy approach: highest similarity pairs are merged first.
    
    Args:
        candidates: List of (wine1_id, wine2_id, similarity_score) tuples
        
    Returns:
        List of clusters (each cluster is a list of wine IDs)
    """
    clusters = {}  # wine_id -> cluster_id
    cluster_members = {}  # cluster_id -> set of wine_ids
    next_cluster_id = 0
    
    for wine1_id, wine2_id, score in candidates:
        cluster1 = clusters.get(wine1_id)
        cluster2 = clusters.get(wine2_id)
        
        if cluster1 is None and cluster2 is None:
            # Create new cluster
            cluster_id = next_cluster_id
            next_cluster_id += 1
            clusters[wine1_id] = cluster_id
            clusters[wine2_id] = cluster_id
            cluster_members[cluster_id] = {wine1_id, wine2_id}
            
        elif cluster1 is not None and cluster2 is None:
            # Add wine2 to cluster1
            clusters[wine2_id] = cluster1
            cluster_members[cluster1].add(wine2_id)
            
        elif cluster1 is None and cluster2 is not None:
            # Add wine1 to cluster2
            clusters[wine1_id] = cluster2
            cluster_members[cluster2].add(wine1_id)
            
        elif cluster1 != cluster2:
            # Merge two clusters
            # Move all members from cluster2 to cluster1
            for member_id in cluster_members[cluster2]:
                clusters[member_id] = cluster1
                cluster_members[cluster1].add(member_id)
            del cluster_members[cluster2]
    
    # Convert to list of lists
    return [list(members) for members in cluster_members.values()]


def select_master_wine(wine_ids: List[int], db: Session, model_class) -> int:
    """
    Select the master wine from a cluster of duplicates.
    
    Criteria (in order):
    1. Wine with most data (non-null fields)
    2. Wine with earliest created_at
    3. Lowest ID (arbitrary tiebreaker)
    
    Args:
        wine_ids: List of duplicate wine IDs
        db: Database session
        model_class: SQLAlchemy model class (Wine or ScrapedWine)
        
    Returns:
        ID of the selected master wine
    """
    wines = db.query(model_class).filter(model_class.id.in_(wine_ids)).all()
    
    if not wines:
        return wine_ids[0]  # Fallback
    
    # Score each wine
    scores = []
    for wine in wines:
        # Count non-null fields
        field_count = sum([
            1 for field in ['producer', 'cuvee', 'vintage', 'region', 'appellation', 'grapes', 'volume_ml']
            if getattr(wine, field, None) is not None
        ])
        
        # Prefer older wines (lower timestamp = earlier)
        timestamp = wine.created_at.timestamp() if wine.created_at else 0
        
        scores.append((
            field_count,  # More fields is better (descending)
            -timestamp,   # Earlier is better (ascending)
            -wine.id,     # Lower ID is better (ascending)
            wine.id
        ))
    
    # Sort by criteria and return best
    scores.sort(reverse=True)
    return scores[0][3]  # Return the wine ID


# Utility function for external use
def normalize_and_block(db: Session, model_class, batch_size: int = 1000):
    """
    Normalize all wines and update their blocking keys.
    
    This should be run once after adding the dedupe columns.
    
    Args:
        db: Database session
        model_class: SQLAlchemy model class (Wine or ScrapedWine)
        batch_size: Number of wines to process per batch
    """
    offset = 0
    total_processed = 0
    
    while True:
        wines = db.query(model_class).filter(
            model_class.is_active == True
        ).offset(offset).limit(batch_size).all()
        
        if not wines:
            break
        
        for wine in wines:
            # Normalize
            wine.norm_producer = normalize_text(wine.producer)
            wine.norm_cuvee = normalize_text(wine.cuvee or wine.name if hasattr(wine, 'name') else wine.cuvee)
            
            # Create blocking key
            wine.dedupe_block = create_blocking_key(wine.producer, wine.vintage)
        
        db.commit()
        total_processed += len(wines)
        offset += batch_size
        
        print(f"Processed {total_processed} wines...")
    
    print(f"Normalization complete! Processed {total_processed} wines.")

