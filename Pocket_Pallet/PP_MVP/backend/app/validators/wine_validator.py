"""Wine data validator."""
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import iso4217


class ValidationError:
    """Validation error details."""
    
    def __init__(self, field: str, message: str, severity: str = "error"):
        self.field = field
        self.message = message
        self.severity = severity  # error, warning
    
    def to_dict(self) -> Dict:
        return {
            "field": self.field,
            "message": self.message,
            "severity": self.severity
        }


class WineValidator:
    """Validates wine data against business rules."""
    
    @staticmethod
    def validate_producer(producer_name: Optional[str]) -> List[ValidationError]:
        """Validate producer name."""
        errors = []
        
        if not producer_name:
            errors.append(ValidationError("producer", "Producer is required", "error"))
            return errors
        
        if len(producer_name) < 2:
            errors.append(ValidationError("producer", "Producer name must be at least 2 characters", "error"))
        
        if len(producer_name) > 120:
            errors.append(ValidationError("producer", "Producer name must be less than 120 characters", "error"))
        
        return errors
    
    @staticmethod
    def validate_vintage(vintage: Optional[int], is_nv: bool = False) -> List[ValidationError]:
        """Validate vintage year."""
        errors = []
        current_year = datetime.now().year
        
        if vintage is None and not is_nv:
            errors.append(ValidationError("vintage", "Must specify vintage or mark as non-vintage", "error"))
            return errors
        
        if vintage is not None and is_nv:
            errors.append(ValidationError("vintage", "Cannot have both vintage and non-vintage flag", "error"))
            return errors
        
        if vintage is not None:
            if vintage < 1900:
                errors.append(ValidationError("vintage", f"Vintage must be 1900 or later", "error"))
            elif vintage > current_year + 2:
                errors.append(ValidationError("vintage", f"Vintage cannot be more than 2 years in the future", "error"))
            elif vintage > current_year:
                errors.append(ValidationError("vintage", f"Future vintage {vintage}", "warning"))
        
        return errors
    
    @staticmethod
    def validate_abv(abv: Optional[float]) -> List[ValidationError]:
        """Validate alcohol by volume."""
        errors = []
        
        if abv is not None:
            if abv < 5.0:
                errors.append(ValidationError("abv", "ABV must be at least 5.0%", "error"))
            elif abv > 18.0:
                errors.append(ValidationError("abv", "ABV must be less than 18.0%", "error"))
            elif abv < 8.0 or abv > 16.0:
                errors.append(ValidationError("abv", f"Unusual ABV value: {abv}%", "warning"))
        
        return errors
    
    @staticmethod
    def validate_currency(currency: Optional[str]) -> List[ValidationError]:
        """Validate currency code."""
        errors = []
        
        if currency:
            try:
                iso4217.Currency(currency)
            except ValueError:
                errors.append(ValidationError("currency", f"Invalid ISO-4217 currency code: {currency}", "error"))
        
        return errors
    
    @staticmethod
    def validate_price(price: Optional[float], currency: Optional[str] = None) -> List[ValidationError]:
        """Validate price."""
        errors = []
        
        if price is not None:
            if price < 0:
                errors.append(ValidationError("list_price", "Price cannot be negative", "error"))
            elif price == 0:
                errors.append(ValidationError("list_price", "Price is zero", "warning"))
            elif price > 10000:
                errors.append(ValidationError("list_price", f"Very high price: {currency or ''} {price}", "warning"))
        
        return errors
    
    @classmethod
    def validate_wine_data(cls, data: Dict) -> Tuple[List[ValidationError], List[ValidationError]]:
        """
        Validate complete wine data.
        Returns tuple of (errors, warnings).
        """
        all_errors = []
        
        # Producer
        all_errors.extend(cls.validate_producer(data.get("producer")))
        
        # Vintage
        all_errors.extend(cls.validate_vintage(
            data.get("vintage"),
            data.get("is_nv", False)
        ))
        
        # ABV
        all_errors.extend(cls.validate_abv(data.get("abv")))
        
        # Currency and price
        all_errors.extend(cls.validate_currency(data.get("currency")))
        all_errors.extend(cls.validate_price(
            data.get("list_price"),
            data.get("currency")
        ))
        
        # Separate errors from warnings
        errors = [e for e in all_errors if e.severity == "error"]
        warnings = [e for e in all_errors if e.severity == "warning"]
        
        return errors, warnings

