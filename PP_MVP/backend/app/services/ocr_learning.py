"""
OCR Learning Service

Applies adaptive bias learning to improve OCR parsing accuracy over time
based on user feedback patterns.
"""
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from collections import Counter
import re

from app.models.ocr_feedback import OcrFeedback


class OcrLearningService:
    """
    Service for applying learned biases to OCR parsing.
    
    Uses feedback data to:
    - Boost confidence for commonly accepted patterns
    - Penalize confidence for commonly rejected patterns
    - Apply corrections from edited entries
    """
    
    def __init__(self, db: Session):
        self.db = db
        self._load_feedback_stats()
    
    def _load_feedback_stats(self):
        """Load recent feedback statistics"""
        # Get last 100 feedback entries
        recent_feedback = (
            self.db.query(OcrFeedback)
            .order_by(OcrFeedback.created_at.desc())
            .limit(100)
            .all()
        )
        
        # Build acceptance/rejection patterns
        self.accepted_tokens = Counter()
        self.rejected_tokens = Counter()
        self.correction_patterns = {}
        
        for feedback in recent_feedback:
            if not feedback.raw_text:
                continue
                
            tokens = self._tokenize(feedback.raw_text)
            
            if feedback.action == "accept":
                self.accepted_tokens.update(tokens)
            elif feedback.action == "reject":
                self.rejected_tokens.update(tokens)
            elif feedback.action == "edit":
                # Track what was changed
                if feedback.parsed_name and feedback.corrected_name:
                    self.correction_patterns[feedback.parsed_name] = feedback.corrected_name
    
    def _tokenize(self, text: str) -> List[str]:
        """Extract meaningful tokens from text"""
        # Split on whitespace and punctuation
        tokens = re.findall(r'\b\w+\b', text.lower())
        # Filter out very short tokens
        return [t for t in tokens if len(t) > 2]
    
    def calculate_bias_score(self, text: str) -> float:
        """
        Calculate a bias score based on learned patterns.
        
        Returns:
            float: Bias multiplier (0.5 to 1.5)
                  < 1.0 = penalize (commonly rejected)
                  > 1.0 = boost (commonly accepted)
        """
        tokens = self._tokenize(text)
        
        if not tokens:
            return 1.0
        
        accepted_count = sum(self.accepted_tokens[t] for t in tokens)
        rejected_count = sum(self.rejected_tokens[t] for t in tokens)
        
        total_count = accepted_count + rejected_count
        
        if total_count == 0:
            return 1.0  # No data, neutral bias
        
        # Calculate bias: ranges from 0.5 to 1.5
        acceptance_ratio = accepted_count / total_count
        bias = 0.5 + acceptance_ratio
        
        return bias
    
    def apply_corrections(self, parsed_name: Optional[str]) -> Optional[str]:
        """
        Apply learned corrections to a parsed name.
        
        Returns corrected name if a pattern match is found.
        """
        if not parsed_name:
            return None
        
        # Check for exact match
        if parsed_name in self.correction_patterns:
            return self.correction_patterns[parsed_name]
        
        # Check for partial matches (simple fuzzy matching)
        for wrong, right in self.correction_patterns.items():
            if wrong.lower() in parsed_name.lower():
                return parsed_name.replace(wrong, right)
        
        return parsed_name
    
    def should_filter_out(self, text: str) -> bool:
        """
        Determine if text should be filtered out based on rejection patterns.
        
        Returns True if text strongly matches rejection patterns.
        """
        bias = self.calculate_bias_score(text)
        return bias < 0.6  # Strong rejection signal


def get_learning_service(db: Session) -> OcrLearningService:
    """Factory function to create learning service"""
    return OcrLearningService(db)

