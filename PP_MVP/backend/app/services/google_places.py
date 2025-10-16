"""
Google Places API service for enriching merchant data.

This service handles:
- Fetching Place Details from Google Places API
- Normalizing Google data to Pocket Pallet schema
- Smart merging (only fill empty fields, don't overwrite)
- Sync status tracking
"""

import os
import logging
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime
import googlemaps
from sqlalchemy.orm import Session

from app.models.merchant import Merchant

logger = logging.getLogger(__name__)


class GooglePlacesService:
    """Service for syncing merchant data with Google Places API."""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Google Places client.
        
        Args:
            api_key: Google Places API key (defaults to env var)
        """
        self.api_key = api_key or os.getenv('GOOGLE_PLACES_API_KEY')
        if not self.api_key:
            raise ValueError("Google Places API key not configured")
        
        self.client = googlemaps.Client(key=self.api_key)
    
    def fetch_place_details(self, place_id: str) -> Dict[str, Any]:
        """
        Fetch complete place details from Google Places API.
        
        Args:
            place_id: Google Place ID (e.g., "ChIJ8T1Z9XuxwoARah7YaygWXpA")
            
        Returns:
            Raw Place Details API response
            
        Raises:
            googlemaps.exceptions.ApiError: If API call fails
        """
        try:
            result = self.client.place(
                place_id=place_id,
                fields=[
                    'place_id',
                    'name',
                    'formatted_address',
                    'formatted_phone_number',
                    'international_phone_number',
                    'website',
                    'business_status',
                    'opening_hours',
                    'price_level',
                    'rating',
                    'user_ratings_total',
                    'types',
                    'geometry',
                    'photos',
                    'url',
                    'utc_offset',
                ]
            )
            
            if result['status'] != 'OK':
                raise Exception(f"Google Places API returned status: {result['status']}")
            
            return result['result']
            
        except Exception as e:
            logger.error(f"Failed to fetch place details for {place_id}: {str(e)}")
            raise
    
    def map_place_to_google_meta(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Map Place Details result to google_meta format as specified.
        
        Args:
            result: Raw Place Details API response
            
        Returns:
            Structured google_meta dict with all enrichment fields
        """
        permanently_closed = (
            result.get("business_status") == "CLOSED_PERMANENTLY" or
            bool(result.get("permanently_closed"))
        )
        
        photos = [
            {
                "photo_reference": p.get("photo_reference"),
                "width": p.get("width"),
                "height": p.get("height"),
            }
            for p in (result.get("photos") or [])
        ]
        
        return {
            "place_id": result.get("place_id"),
            "formatted_address": result.get("formatted_address"),
            "opening_hours": result.get("opening_hours"),
            "photos": photos,
            "types": result.get("types", []),
            "price_level": result.get("price_level"),
            "business_status": result.get("business_status"),
            "website": result.get("website"),
            "formatted_phone_number": result.get("formatted_phone_number"),
            "international_phone_number": result.get("international_phone_number"),
            "current_popularity": result.get("current_popularity"),
            "live_wait_time": result.get("live_wait_time"),
            "permanently_closed": permanently_closed,
            "rating": result.get("rating"),
            "user_ratings_total": result.get("user_ratings_total"),
            "url": result.get("url"),
        }
    
    def normalize_google_data(self, place_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize Google Place data to Pocket Pallet schema.
        
        Args:
            place_data: Raw Place Details API response
            
        Returns:
            Normalized data matching Merchant model fields
        """
        normalized = {}
        
        # Basic info
        if 'name' in place_data:
            normalized['name'] = place_data['name']
        
        if 'formatted_address' in place_data:
            normalized['address'] = place_data['formatted_address']
        
        # Coordinates
        if 'geometry' in place_data and 'location' in place_data['geometry']:
            location = place_data['geometry']['location']
            normalized['geo'] = {
                'lat': location['lat'],
                'lng': location['lng']
            }
        
        # Contact info
        contact = {}
        if 'formatted_phone_number' in place_data:
            contact['phone'] = place_data['formatted_phone_number']
        if 'website' in place_data:
            contact['website'] = place_data['website']
        if contact:
            normalized['contact'] = contact
        
        # Hours
        if 'opening_hours' in place_data and 'weekday_text' in place_data['opening_hours']:
            # Convert Google's weekday_text to a structured format
            hours = {}
            weekday_map = {
                'Monday': 'mon',
                'Tuesday': 'tue',
                'Wednesday': 'wed',
                'Thursday': 'thu',
                'Friday': 'fri',
                'Saturday': 'sat',
                'Sunday': 'sun'
            }
            
            for day_text in place_data['opening_hours']['weekday_text']:
                # Format: "Monday: 9:00 AM – 5:00 PM"
                parts = day_text.split(': ', 1)
                if len(parts) == 2:
                    day_name, hours_text = parts
                    if day_name in weekday_map:
                        hours[weekday_map[day_name]] = hours_text
            
            if hours:
                normalized['hours'] = hours
        
        # Photos (take first 5)
        if 'photos' in place_data and place_data['photos']:
            photo_refs = [
                photo.get('photo_reference') 
                for photo in place_data['photos'][:5]
                if 'photo_reference' in photo
            ]
            if photo_refs:
                normalized['gallery_images'] = [
                    f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference={ref}&key={self.api_key}"
                    for ref in photo_refs
                ]
                # Set first photo as hero
                if not normalized.get('hero_image'):
                    normalized['hero_image'] = normalized['gallery_images'][0]
        
        # Tags from types
        if 'types' in place_data:
            # Convert Google types to readable tags
            type_mapping = {
                'bar': 'Bar',
                'restaurant': 'Restaurant',
                'cafe': 'Cafe',
                'liquor_store': 'Wine Shop',
                'store': 'Shop',
                'food': 'Food',
                'night_club': 'Night Club',
                'wine_bar': 'Wine Bar',
            }
            tags = [
                type_mapping.get(t, t.replace('_', ' ').title())
                for t in place_data['types']
                if t in type_mapping or not t.startswith('point_of_interest')
            ]
            if tags:
                normalized['tags'] = tags
        
        # Google Maps URL
        if 'url' in place_data:
            normalized['source_url'] = place_data['url']
        
        return normalized
    
    def merge_data(
        self, 
        merchant: Merchant, 
        google_data: Dict[str, Any]
    ) -> Tuple[Merchant, List[str]]:
        """
        Smart merge: only update empty/missing fields in merchant.
        
        Args:
            merchant: Existing Merchant instance
            google_data: Normalized Google Place data
            
        Returns:
            Tuple of (updated merchant, list of fields updated)
        """
        updated_fields = []
        
        # Only update if field is empty in current merchant
        for field, value in google_data.items():
            current_value = getattr(merchant, field, None)
            
            # Skip if current field has data
            if current_value:
                continue
            
            # Handle special cases
            if field == 'tags':
                # Merge tags if some exist
                if merchant.tags:
                    existing_tags = set(merchant.tags)
                    new_tags = set(value)
                    merged = list(existing_tags | new_tags)
                    if merged != merchant.tags:
                        merchant.tags = merged
                        updated_fields.append('tags')
                else:
                    merchant.tags = value
                    updated_fields.append('tags')
            
            elif field == 'contact':
                # Merge contact fields
                if merchant.contact:
                    merged_contact = {**merchant.contact, **value}
                    if merged_contact != merchant.contact:
                        merchant.contact = merged_contact
                        updated_fields.append('contact')
                else:
                    merchant.contact = value
                    updated_fields.append('contact')
            
            elif field == 'gallery_images':
                # Merge gallery images
                if merchant.gallery_images:
                    existing_imgs = set(merchant.gallery_images)
                    new_imgs = set(value)
                    merged = list(existing_imgs | new_imgs)
                    if merged != merchant.gallery_images:
                        merchant.gallery_images = merged
                        updated_fields.append('gallery_images')
                else:
                    merchant.gallery_images = value
                    updated_fields.append('gallery_images')
            
            else:
                # Simple field update
                setattr(merchant, field, value)
                updated_fields.append(field)
        
        return merchant, updated_fields
    
    def sync_merchant(
        self, 
        db: Session, 
        merchant_id: str, 
        place_id: str,
        force_overwrite: bool = False
    ) -> Tuple[str, Optional[Dict[str, Any]], Optional[str], List[str]]:
        """
        Sync a merchant with Google Places data.
        
        Args:
            db: Database session
            merchant_id: Merchant ID to sync
            place_id: Google Place ID
            force_overwrite: If True, overwrite existing data
            
        Returns:
            Tuple of (status, google_meta, error_message, updated_fields)
            Status can be: 'success', 'failed', 'no_changes'
        """
        try:
            # Fetch merchant
            merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
            if not merchant:
                return 'failed', None, 'Merchant not found', []
            
            # Fetch Google data
            logger.info(f"Fetching Place Details for {place_id}")
            place_data = self.fetch_place_details(place_id)
            
            # Normalize data
            normalized = self.normalize_google_data(place_data)
            
            # Merge data (only fill blanks unless force_overwrite)
            if force_overwrite:
                # Direct update all fields
                updated_fields = []
                for field, value in normalized.items():
                    setattr(merchant, field, value)
                    updated_fields.append(field)
            else:
                merchant, updated_fields = self.merge_data(merchant, normalized)
            
            # Store structured google_meta using the spec format
            merchant.google_place_id = place_id
            merchant.google_meta = self.map_place_to_google_meta(place_data)
            merchant.google_last_synced = datetime.utcnow()
            merchant.google_sync_status = 'success'
            merchant.last_synced_at = datetime.utcnow()
            
            db.commit()
            db.refresh(merchant)
            
            status = 'success' if updated_fields else 'no_changes'
            logger.info(f"✅ Synced merchant {merchant.name} - {len(updated_fields)} fields updated")
            
            return status, place_data, None, updated_fields
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"❌ Google sync failed for merchant {merchant_id}: {error_msg}")
            
            # Update status to failed
            if merchant:
                merchant.google_sync_status = 'failed'
                db.commit()
            
            return 'failed', None, error_msg, []
    
    def search_place(self, query: str, location: Optional[Tuple[float, float]] = None) -> List[Dict[str, Any]]:
        """
        Search for places by text query.
        
        Args:
            query: Search query (e.g., "Buvons Long Beach")
            location: Optional (lat, lng) tuple to bias results
            
        Returns:
            List of place results with place_id, name, address
        """
        try:
            if location:
                results = self.client.places(
                    query=query,
                    location=location,
                    radius=5000
                )
            else:
                results = self.client.places(query=query)
            
            if results['status'] != 'OK':
                return []
            
            return [
                {
                    'place_id': place['place_id'],
                    'name': place.get('name'),
                    'address': place.get('formatted_address'),
                    'types': place.get('types', [])
                }
                for place in results.get('results', [])
            ]
            
        except Exception as e:
            logger.error(f"Place search failed: {str(e)}")
            return []
    
    def resolve_cid_to_coordinates(self, cid: str) -> Optional[Tuple[float, float, str]]:
        """
        Resolve Google Maps CID (Customer ID) to coordinates using Place ID conversion.
        
        Args:
            cid: Google Maps CID (e.g., "5816261256227932988")
            
        Returns:
            Tuple of (lat, lng, place_id) if found, None otherwise
        """
        try:
            # Convert CID to Place ID format
            # Google uses a format where CID can be looked up via the Place Details API
            # The trick is to use the Maps URL and let Google's API resolve it
            
            # Try using Find Place From Text with the CID URL
            import requests
            
            # Use the Place ID Lookup endpoint with the CID
            # Format: We need to make a direct API call since googlemaps library doesn't support CID directly
            url = "https://maps.googleapis.com/maps/api/place/details/json"
            params = {
                'cid': cid,
                'key': self.api_key,
                'fields': 'place_id,geometry,name'
            }
            
            response = requests.get(url, params=params)
            data = response.json()
            
            if data.get('status') == 'OK' and 'result' in data:
                result = data['result']
                place_id = result.get('place_id')
                geometry = result.get('geometry', {})
                location = geometry.get('location', {})
                
                if place_id and 'lat' in location and 'lng' in location:
                    logger.info(f"✅ Resolved CID {cid} to coordinates: {location['lat']}, {location['lng']}")
                    return location['lat'], location['lng'], place_id
            
            logger.warning(f"⚠️  Could not resolve CID {cid}: {data.get('status', 'UNKNOWN')}")
            return None
            
        except Exception as e:
            logger.error(f"❌ Error resolving CID {cid}: {str(e)}")
            return None
    
    def resolve_google_maps_url(self, url: str) -> Optional[Tuple[float, float, Optional[str]]]:
        """
        Extract coordinates from a Google Maps URL, including CID-based URLs.
        
        Args:
            url: Google Maps URL (various formats supported)
            
        Returns:
            Tuple of (lat, lng, place_id) if found, None otherwise
        """
        import re
        from urllib.parse import urlparse, parse_qs
        
        if not url:
            return None
        
        try:
            # Format 1: !3d<lat>!4d<lng> (coordinates in URL)
            match = re.search(r'!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)', url)
            if match:
                lat = float(match.group(1))
                lng = float(match.group(2))
                logger.info(f"Extracted coordinates from URL format !3d/!4d: {lat}, {lng}")
                return lat, lng, None
            
            # Format 2: @<lat>,<lng> (coordinates in URL)
            match = re.search(r'@(-?\d+\.\d+),(-?\d+\.\d+)', url)
            if match:
                lat = float(match.group(1))
                lng = float(match.group(2))
                logger.info(f"Extracted coordinates from URL format @lat,lng: {lat}, {lng}")
                return lat, lng, None
            
            # Format 3: ?q=<lat>,<lng> (query parameter)
            parsed = urlparse(url)
            if 'q=' in url:
                q_param = parse_qs(parsed.query).get('q', [''])[0]
                coords = re.search(r'(-?\d+\.\d+),(-?\d+\.\d+)', q_param)
                if coords:
                    lat = float(coords.group(1))
                    lng = float(coords.group(2))
                    logger.info(f"Extracted coordinates from URL query param: {lat}, {lng}")
                    return lat, lng, None
            
            # Format 4: ?cid=<number> (Customer ID - requires API call)
            if 'cid=' in url:
                cid = parse_qs(parsed.query).get('cid', [None])[0]
                if cid:
                    logger.info(f"Found CID in URL: {cid}, resolving via API...")
                    result = self.resolve_cid_to_coordinates(cid)
                    if result:
                        return result
            
            # Format 5: Place ID in URL (various formats)
            # /place/.../@...data=!4m...!1s<place_id>
            match = re.search(r'!1s([A-Za-z0-9_-]+)', url)
            if match:
                place_id = match.group(1)
                if place_id.startswith('ChIJ') or place_id.startswith('0x'):
                    logger.info(f"Found Place ID in URL: {place_id}, fetching details...")
                    try:
                        place_data = self.fetch_place_details(place_id)
                        if 'geometry' in place_data and 'location' in place_data['geometry']:
                            location = place_data['geometry']['location']
                            return location['lat'], location['lng'], place_id
                    except Exception as e:
                        logger.warning(f"Could not fetch details for Place ID {place_id}: {e}")
            
            logger.warning(f"⚠️  Could not extract coordinates from URL: {url}")
            return None
            
        except Exception as e:
            logger.error(f"❌ Error parsing Google Maps URL: {str(e)}")
            return None


def get_google_places_service() -> GooglePlacesService:
    """Dependency injection helper for FastAPI."""
    return GooglePlacesService()

