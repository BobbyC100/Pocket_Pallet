"""Wine matching engine using fuzzy string matching."""
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
import Levenshtein
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.wine import Wine
from app.models.producer import Producer
from app.validators.normalizers import normalize_producer, normalize_cuvee


@dataclass
class MatchResult:
    """Result of wine matching."""
    wine_id: Optional[int]
    score: float
    is_new: bool
    match_details: Dict
    conflicts: List[str]


class WineMatcher:
    """Fuzzy matching engine for wines."""
    
    def __init__(
        self,
        auto_merge_threshold: float = 0.90,
        review_threshold: float = 0.75
    ):
        self.auto_merge_threshold = auto_merge_threshold
        self.review_threshold = review_threshold
    
    async def find_matches(
        self,
        db: AsyncSession,
        candidate: Dict,
        top_n: int = 5
    ) -> List[MatchResult]:
        """
        Find potential matches for a wine candidate.
        
        Uses blocking on normalized producer + vintage,
        then fuzzy matching on producer + cuvée.
        """
        matches = []
        
        # Extract and normalize candidate fields
        producer_name = candidate.get("producer", "")
        cuvee = candidate.get("cuvee", "")
        vintage = candidate.get("vintage")
        is_nv = candidate.get("is_nv", False)
        
        normalized_producer = normalize_producer(producer_name)
        normalized_cuvee = normalize_cuvee(cuvee) if cuvee else ""
        
        # Blocking: Find wines with similar producer
        # In a real system, you'd use a dedicated search index
        query = select(Wine).join(Producer)
        
        # Filter by vintage/NV
        if is_nv:
            query = query.where(Wine.is_nv == True)
        elif vintage:
            query = query.where(Wine.vintage == vintage)
        
        result = await db.execute(query)
        potential_matches = result.scalars().all()
        
        # Fuzzy match each potential candidate
        for wine in potential_matches:
            score, details = self._calculate_match_score(
                candidate,
                wine,
                normalized_producer,
                normalized_cuvee
            )
            
            if score >= self.review_threshold:
                conflicts = self._identify_conflicts(candidate, wine)
                
                matches.append(MatchResult(
                    wine_id=wine.id,
                    score=score,
                    is_new=False,
                    match_details=details,
                    conflicts=conflicts
                ))
        
        # Sort by score descending
        matches.sort(key=lambda m: m.score, reverse=True)
        
        return matches[:top_n]
    
    def _calculate_match_score(
        self,
        candidate: Dict,
        wine: Wine,
        normalized_producer: str,
        normalized_cuvee: str
    ) -> Tuple[float, Dict]:
        """
        Calculate match score between candidate and existing wine.
        
        Returns score (0-1) and details dict.
        """
        details = {}
        scores = []
        weights = []
        
        # Producer name similarity (high weight)
        wine_producer_normalized = normalize_producer(wine.producer.name)
        producer_similarity = self._string_similarity(
            normalized_producer,
            wine_producer_normalized
        )
        details["producer_similarity"] = producer_similarity
        scores.append(producer_similarity)
        weights.append(0.4)
        
        # Cuvée similarity (high weight if both have cuvée)
        if normalized_cuvee and wine.cuvee:
            wine_cuvee_normalized = normalize_cuvee(wine.cuvee)
            cuvee_similarity = self._string_similarity(
                normalized_cuvee,
                wine_cuvee_normalized
            )
            details["cuvee_similarity"] = cuvee_similarity
            scores.append(cuvee_similarity)
            weights.append(0.3)
        
        # Vintage exact match
        candidate_vintage = candidate.get("vintage")
        if candidate_vintage == wine.vintage:
            details["vintage_match"] = True
            scores.append(1.0)
            weights.append(0.15)
        else:
            details["vintage_match"] = False
            scores.append(0.0)
            weights.append(0.15)
        
        # Grape agreement (bonus)
        candidate_grapes = set(candidate.get("grape_ids", []))
        wine_grapes = set(wine.grape_ids or [])
        if candidate_grapes and wine_grapes:
            grape_overlap = len(candidate_grapes & wine_grapes) / len(candidate_grapes | wine_grapes)
            details["grape_overlap"] = grape_overlap
            scores.append(grape_overlap)
            weights.append(0.1)
        
        # Region agreement (bonus)
        if candidate.get("region_id") == wine.region_id and wine.region_id:
            details["region_match"] = True
            scores.append(1.0)
            weights.append(0.05)
        else:
            details["region_match"] = False
        
        # Calculate weighted average
        if sum(weights) > 0:
            final_score = sum(s * w for s, w in zip(scores, weights)) / sum(weights)
        else:
            final_score = 0.0
        
        details["final_score"] = final_score
        
        return final_score, details
    
    def _string_similarity(self, s1: str, s2: str) -> float:
        """
        Calculate string similarity using Levenshtein distance.
        Returns value between 0 and 1.
        """
        if not s1 or not s2:
            return 0.0
        
        # Use Levenshtein ratio
        return Levenshtein.ratio(s1, s2)
    
    def _identify_conflicts(self, candidate: Dict, wine: Wine) -> List[str]:
        """Identify fields that conflict between candidate and existing wine."""
        conflicts = []
        
        # ABV conflict
        if candidate.get("abv") and wine.abv:
            if abs(candidate["abv"] - wine.abv) > 0.5:
                conflicts.append(f"ABV differs: {candidate['abv']} vs {wine.abv}")
        
        # Wine type conflict
        if candidate.get("wine_type") and wine.wine_type:
            if candidate["wine_type"].lower() != wine.wine_type.lower():
                conflicts.append(f"Wine type differs: {candidate['wine_type']} vs {wine.wine_type}")
        
        return conflicts
    
    def should_auto_merge(self, score: float) -> bool:
        """Check if score is high enough for automatic merge."""
        return score >= self.auto_merge_threshold
    
    def should_review(self, score: float) -> bool:
        """Check if match should go to review queue."""
        return self.review_threshold <= score < self.auto_merge_threshold
    
    def is_new_wine(self, matches: List[MatchResult]) -> bool:
        """Determine if this is a new wine (no good matches)."""
        return not matches or matches[0].score < self.review_threshold

