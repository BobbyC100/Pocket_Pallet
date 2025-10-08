"""Producer-based scoring boost for recommendations."""
from typing import Optional, Set


def producer_boost(
    producer_class: Optional[str] = None,
    flags: Optional[list[str]] = None
) -> float:
    """
    Calculate scoring boost based on producer ethos.
    
    Returns a float between -0.1 and +0.1 to add to base score.
    
    Philosophy:
    - Prefer small/independent makers (Grower-Producer > Independent)
    - Reward sustainable farming practices
    - Keep impact bounded so it doesn't overpower taste/value/availability
    
    Args:
        producer_class: Producer classification
        flags: Farming practice flags
    
    Returns:
        Boost value capped between -0.1 and +0.1
    """
    if not producer_class:
        return 0.0
    
    boost = 0.0
    
    # Ethos bias: prefer small/independent makers
    class_boosts = {
        'Grower-Producer': 0.06,
        'Independent': 0.04,
        'Cooperative': 0.00,
        'Negociant': -0.02,
        'Industrial': -0.08,
    }
    boost += class_boosts.get(producer_class, 0.0)
    
    # Farming flags (stack but cap)
    if flags:
        flag_set: Set[str] = set(flags)
        if 'Organic' in flag_set:
            boost += 0.01
        if 'Biodynamic' in flag_set:
            boost += 0.01
        if 'Low-Intervention' in flag_set:
            boost += 0.02
        if 'Sustainable' in flag_set:
            boost += 0.005
    
    # Bound total contribution so we don't overpower taste/value
    return max(-0.1, min(0.1, boost))


def score_candidate(
    base_score: float,
    producer_class: Optional[str] = None,
    producer_flags: Optional[list[str]] = None
) -> float:
    """
    Apply producer boost to a base recommendation score.
    
    Args:
        base_score: Base score from taste/value/availability/context (0-1)
        producer_class: Producer classification
        producer_flags: Farming practice flags
    
    Returns:
        Final score capped between 0 and 1
    """
    boosted = base_score + producer_boost(producer_class, producer_flags)
    return max(0.0, min(1.0, boosted))


def producer_rationale_line(
    producer_name: Optional[str] = None,
    producer_class: Optional[str] = None,
    flags: Optional[list[str]] = None
) -> str:
    """
    Generate a one-line producer context for recommendation rationale.
    
    Args:
        producer_name: Producer name
        producer_class: Producer classification
        flags: Farming practice flags
    
    Returns:
        Brief producer context line, or empty string if no data
    """
    if not producer_name or not producer_class:
        return ''
    
    # Filter to recognized farming flags
    recognized_flags = ['Organic', 'Biodynamic', 'Low-Intervention', 'Sustainable']
    filtered_flags = [f for f in (flags or []) if f in recognized_flags]
    
    # Build the line
    class_lower = producer_class.lower()
    flag_str = f" ({', '.join(filtered_flags)})" if filtered_flags else ''
    
    return f" From {class_lower} {producer_name}{flag_str}."

