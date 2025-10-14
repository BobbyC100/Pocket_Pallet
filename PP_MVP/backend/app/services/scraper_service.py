"""
Wine scraper service.

Handles scraping wine products from retailer websites.
"""

import hashlib
import re
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from bs4 import BeautifulSoup
import httpx

from app.models.scraper import Source, ScrapedWine, Product, ProductSnapshot, ProductImage
from app.schemas.scraper import ProductSnapshotCreate


class WineScraperService:
    """Service for scraping wine products from sources."""

    def __init__(self, db: Session):
        self.db = db

    async def scrape_source(
        self, 
        source_id: int, 
        max_pages: int = 5
    ) -> Dict[str, Any]:
        """
        Scrape a source and return statistics.
        
        Args:
            source_id: ID of the source to scrape
            max_pages: Maximum number of pages to scrape
            
        Returns:
            Dict with statistics: products_found, wines_created, snapshots_created
        """
        source = self.db.query(Source).filter(Source.id == source_id).first()
        if not source:
            raise ValueError(f"Source {source_id} not found")

        if not source.enabled:
            raise ValueError(f"Source {source.name} is disabled")

        stats = {
            "products_found": 0,
            "wines_created": 0,
            "snapshots_created": 0,
            "errors": []
        }

        try:
            # Simple scraping logic - can be extended with Playwright
            async with httpx.AsyncClient(timeout=30.0) as client:
                current_url = source.base_url
                pages_scraped = 0

                while current_url and pages_scraped < max_pages:
                    try:
                        response = await client.get(current_url)
                        response.raise_for_status()
                        soup = BeautifulSoup(response.text, 'html.parser')

                        # Find product links
                        if source.product_link_selector:
                            product_links = soup.select(source.product_link_selector)
                            
                            for link in product_links:
                                product_url = link.get('href', '')
                                if not product_url:
                                    continue

                                # Make absolute URL
                                if not product_url.startswith('http'):
                                    from urllib.parse import urljoin
                                    product_url = urljoin(source.base_url, product_url)

                                # Process product
                                try:
                                    await self._process_product(source, product_url, client)
                                    stats["products_found"] += 1
                                except Exception as e:
                                    stats["errors"].append(f"Error processing {product_url}: {str(e)}")

                        # Find next page
                        current_url = None
                        if source.pagination_next_selector:
                            next_link = soup.select_one(source.pagination_next_selector)
                            if next_link:
                                next_url = next_link.get('href', '')
                                if next_url:
                                    from urllib.parse import urljoin
                                    current_url = urljoin(source.base_url, next_url)

                        pages_scraped += 1

                    except Exception as e:
                        stats["errors"].append(f"Error scraping page {current_url}: {str(e)}")
                        break

            # Update source last_run_at
            source.last_run_at = datetime.utcnow()
            self.db.commit()

        except Exception as e:
            stats["errors"].append(f"Fatal error: {str(e)}")

        return stats

    async def _process_product(
        self, 
        source: Source, 
        product_url: str, 
        client: httpx.AsyncClient
    ) -> None:
        """
        Process a single product page.
        
        Args:
            source: Source object
            product_url: URL of the product
            client: HTTP client
        """
        # Check if product already exists
        existing_product = self.db.query(Product).filter(
            Product.product_url == product_url
        ).first()

        if not existing_product:
            # Create new product
            product = Product(
                source_id=source.id,
                product_url=product_url,
                title_raw="",  # Will be filled by detailed scraper
                created_at=datetime.utcnow()
            )
            self.db.add(product)
            self.db.flush()
        else:
            product = existing_product

        # Fetch product details
        try:
            response = await client.get(product_url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            # Extract basic data (this is a simple example - customize per source)
            title = soup.find('h1')
            title_text = title.get_text(strip=True) if title else ""

            # Try to find price (common selectors)
            price_text = None
            for selector in ['.price', '.product-price', '[itemprop="price"]']:
                price_elem = soup.select_one(selector)
                if price_elem:
                    price_text = price_elem.get_text(strip=True)
                    break

            # Parse price
            price_cents = self._parse_price(price_text) if price_text else None

            # Create snapshot
            snapshot = ProductSnapshot(
                product_id=product.id,
                fetched_at=datetime.utcnow(),
                price_cents=price_cents,
                currency="USD",
                in_stock=True,  # Simplified - should check stock status
                title_raw=title_text,
                availability_raw="In Stock"  # Simplified
            )
            self.db.add(snapshot)

            # Update product title if empty
            if not product.title_raw:
                product.title_raw = title_text

            self.db.commit()

        except Exception as e:
            print(f"Error fetching product details from {product_url}: {e}")
            raise

    def _parse_price(self, price_text: str) -> Optional[int]:
        """
        Parse price text to cents.
        
        Args:
            price_text: Price string like "$25.99" or "25,99 €"
            
        Returns:
            Price in cents, or None if parse fails
        """
        if not price_text:
            return None

        # Remove currency symbols and extract numbers
        price_text = re.sub(r'[^\d.,]', '', price_text)
        price_text = price_text.replace(',', '.')

        try:
            price_float = float(price_text)
            return int(price_float * 100)  # Convert to cents
        except (ValueError, TypeError):
            return None

    def create_wine_from_product(self, product: Product) -> Optional[ScrapedWine]:
        """
        Create or match a ScrapedWine from product data.
        
        This is a placeholder - should use NLP/parsing to extract wine details.
        """
        # TODO: Implement wine matching/creation logic
        # For now, just create a basic wine record
        
        if not product.title_raw:
            return None

        # Simple parsing (should be much more sophisticated)
        wine = ScrapedWine(
            producer="Unknown",
            cuvee=product.title_raw[:100],
            vintage="NV",
            volume_ml=750,
            created_at=datetime.utcnow()
        )
        
        self.db.add(wine)
        self.db.flush()
        
        # Link product to wine
        product.wine_id = wine.id
        self.db.commit()
        
        return wine

