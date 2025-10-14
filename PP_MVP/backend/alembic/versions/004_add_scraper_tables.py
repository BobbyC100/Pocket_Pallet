"""add scraper tables

Revision ID: d0c0babe0001
Revises: c3d4e5f6g7h8
Create Date: 2025-10-14

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "d0c0babe0001"
down_revision = "c3d4e5f6g7h8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Sources table - wine retailer/distributor websites
    op.create_table(
        "sources",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("base_url", sa.String(), nullable=False, unique=True),
        sa.Column("product_link_selector", sa.String(), nullable=True),
        sa.Column("pagination_next_selector", sa.String(), nullable=True),
        sa.Column("use_playwright", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("enabled", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("last_run_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index("ix_sources_id", "sources", ["id"])

    # Scraped wines catalog - master wine database from scraper
    op.create_table(
        "scraped_wines",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("producer", sa.String(), index=True),
        sa.Column("cuvee", sa.String(), index=True),
        sa.Column("vintage", sa.String(), index=True),
        sa.Column("country", sa.String(), index=True),
        sa.Column("region", sa.String(), index=True),
        sa.Column("appellation", sa.String(), index=True),
        sa.Column("style", sa.String(), index=True),
        sa.Column("grapes", sa.String()),
        sa.Column("volume_ml", sa.Integer()),
        sa.Column("block_key", sa.String(), index=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), onupdate=sa.func.now()),
    )
    op.create_index("ix_scraped_wines_id", "scraped_wines", ["id"])
    op.create_unique_constraint("uq_scraped_wine_natural", "scraped_wines", [
        "producer", "cuvee", "vintage", "volume_ml"
    ])

    # Products - specific product listings from sources
    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("wine_id", sa.Integer(), sa.ForeignKey("scraped_wines.id", ondelete="SET NULL")),
        sa.Column("source_id", sa.Integer(), sa.ForeignKey("sources.id", ondelete="CASCADE"), nullable=False),
        sa.Column("product_url", sa.String(), nullable=False, unique=True),
        sa.Column("external_sku", sa.String()),
        sa.Column("title_raw", sa.String()),
        sa.Column("data_raw", sa.JSON()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index("ix_products_id", "products", ["id"])
    op.create_index("ix_products_wine_id", "products", ["wine_id"])
    op.create_index("ix_products_source_id", "products", ["source_id"])

    # Product snapshots - price/availability history
    op.create_table(
        "product_snapshots",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id", ondelete="CASCADE"), nullable=False),
        sa.Column("fetched_at", sa.DateTime(), server_default=sa.func.now(), index=True),
        sa.Column("price_cents", sa.Integer()),
        sa.Column("currency", sa.String(), server_default="USD"),
        sa.Column("in_stock", sa.Boolean()),
        sa.Column("title_raw", sa.String()),
        sa.Column("availability_raw", sa.String()),
        sa.Column("normalized", sa.JSON()),
    )
    op.create_index("ix_product_snapshots_id", "product_snapshots", ["id"])
    op.create_index("ix_product_snapshots_product_id", "product_snapshots", ["product_id"])

    # Product images
    op.create_table(
        "product_images",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id", ondelete="CASCADE"), nullable=False),
        sa.Column("src_url", sa.String()),
        sa.Column("stored_url", sa.String()),
        sa.Column("sha1", sa.String(), index=True),
        sa.Column("width", sa.Integer()),
        sa.Column("height", sa.Integer()),
    )
    op.create_index("ix_product_images_id", "product_images", ["id"])
    op.create_index("ix_product_images_product_id", "product_images", ["product_id"])


def downgrade() -> None:
    op.drop_index("ix_product_images_product_id", table_name="product_images")
    op.drop_index("ix_product_images_id", table_name="product_images")
    op.drop_table("product_images")
    
    op.drop_index("ix_product_snapshots_product_id", table_name="product_snapshots")
    op.drop_index("ix_product_snapshots_id", table_name="product_snapshots")
    op.drop_table("product_snapshots")
    
    op.drop_index("ix_products_source_id", table_name="products")
    op.drop_index("ix_products_wine_id", table_name="products")
    op.drop_index("ix_products_id", table_name="products")
    op.drop_table("products")
    
    op.drop_constraint("uq_scraped_wine_natural", "scraped_wines", type_="unique")
    op.drop_index("ix_scraped_wines_id", table_name="scraped_wines")
    op.drop_table("scraped_wines")
    
    op.drop_index("ix_sources_id", table_name="sources")
    op.drop_table("sources")

