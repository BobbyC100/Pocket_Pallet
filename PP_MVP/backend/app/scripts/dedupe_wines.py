#!/usr/bin/env python3
"""
Wine deduplication CLI tool.

Usage:
  # Preview duplicate candidates (no changes)
  python -m app.scripts.dedupe_wines --threshold 88 --out-csv candidates.csv
  
  # Apply merges
  python -m app.scripts.dedupe_wines --threshold 88 --apply --out-csv merged.csv
  
  # Normalize wines first (recommended before first run)
  python -m app.scripts.dedupe_wines --normalize-only
"""

import argparse
import csv
import sys
from typing import List, Dict
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.wine import Wine
from app.models.scraper import ScrapedWine
from app.services.dedupe import (
    normalize_and_block,
    find_duplicate_candidates,
    cluster_duplicates,
    select_master_wine,
    merge_duplicates
)


def get_db_session():
    """Create database session."""
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    return SessionLocal()


def normalize_all_wines(table: str):
    """Normalize and create blocking keys for all wines."""
    db = get_db_session()
    
    model_class = Wine if table == "wines" else ScrapedWine
    
    print(f"🔄 Normalizing {table}...")
    normalize_and_block(db, model_class)
    print(f"✅ Normalization complete!")
    
    db.close()


def find_duplicates(table: str, threshold: float, limit: int = None) -> List[Dict]:
    """
    Find duplicate candidates.
    
    Returns:
        List of candidate dicts with keys: wine1_id, wine2_id, score, wine1_name, wine2_name
    """
    db = get_db_session()
    
    model_class = Wine if table == "wines" else ScrapedWine
    
    print(f"\n🔍 Finding duplicates in {table} (threshold: {threshold})...")
    
    # Get all blocking keys
    blocks = db.query(model_class.dedupe_block).filter(
        model_class.is_active == True,
        model_class.dedupe_block.isnot(None)
    ).distinct().all()
    
    all_candidates = []
    total_blocks = len(blocks)
    
    for idx, (block_key,) in enumerate(blocks, 1):
        if idx % 100 == 0:
            print(f"  Processed {idx}/{total_blocks} blocks...")
        
        # Get wines in this block
        wines = db.query(model_class).filter(
            model_class.dedupe_block == block_key,
            model_class.is_active == True
        ).all()
        
        if len(wines) < 2:
            continue  # Need at least 2 wines to find duplicates
        
        # Convert to dicts for dedupe service
        wine_dicts = []
        for wine in wines:
            wine_dicts.append({
                "id": wine.id,
                "norm_producer": wine.norm_producer,
                "norm_cuvee": wine.norm_cuvee,
                "vintage": wine.vintage,
                "producer": wine.producer,
                "cuvee": wine.cuvee or getattr(wine, 'name', None)
            })
        
        # Find candidates in this block
        block_candidates = find_duplicate_candidates(wine_dicts, threshold)
        
        # Convert to output format
        for wine1_id, wine2_id, score in block_candidates:
            wine1 = next(w for w in wines if w.id == wine1_id)
            wine2 = next(w for w in wines if w.id == wine2_id)
            
            wine1_name = f"{wine1.producer or 'Unknown'} - {wine1.cuvee or getattr(wine1, 'name', 'N/A')} ({wine1.vintage or 'NV'})"
            wine2_name = f"{wine2.producer or 'Unknown'} - {wine2.cuvee or getattr(wine2, 'name', 'N/A')} ({wine2.vintage or 'NV'})"
            
            all_candidates.append({
                "wine1_id": wine1_id,
                "wine2_id": wine2_id,
                "score": round(score, 2),
                "wine1_name": wine1_name,
                "wine2_name": wine2_name,
                "block": block_key
            })
    
    print(f"✅ Found {len(all_candidates)} duplicate pairs")
    
    if limit:
        all_candidates = all_candidates[:limit]
    
    db.close()
    return all_candidates


def apply_merges(table: str, candidates: List[Dict]) -> int:
    """
    Apply duplicate merges.
    
    Returns:
        Number of wines merged
    """
    db = get_db_session()
    
    model_class = Wine if table == "wines" else ScrapedWine
    
    print(f"\n🔀 Merging duplicates in {table}...")
    
    # Convert candidates to list of (id1, id2, score)
    pairs = [(c["wine1_id"], c["wine2_id"], c["score"]) for c in candidates]
    
    # Cluster into groups
    clusters = cluster_duplicates(pairs)
    
    print(f"  Found {len(clusters)} duplicate clusters")
    
    total_merged = 0
    
    for cluster in clusters:
        # Select master wine
        master_id = select_master_wine(cluster, db, model_class)
        
        # Merge duplicates
        merged = merge_duplicates(cluster, master_id, db, model_class)
        total_merged += merged
        
        print(f"  Merged {merged} wines into master {master_id}")
    
    print(f"✅ Total wines merged: {total_merged}")
    
    db.close()
    return total_merged


def save_to_csv(candidates: List[Dict], output_file: str):
    """Save candidates to CSV file."""
    if not candidates:
        print(f"⚠️  No candidates to save")
        return
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=candidates[0].keys())
        writer.writeheader()
        writer.writerows(candidates)
    
    print(f"💾 Saved {len(candidates)} candidates to {output_file}")


def main():
    parser = argparse.ArgumentParser(description='Wine deduplication tool')
    parser.add_argument('--table', choices=['wines', 'scraped_wines'], default='wines',
                        help='Which table to deduplicate (default: wines)')
    parser.add_argument('--threshold', type=float, default=87.5,
                        help='Similarity threshold (0-100, default: 87.5)')
    parser.add_argument('--limit', type=int, default=None,
                        help='Limit number of candidates to process')
    parser.add_argument('--apply', action='store_true',
                        help='Apply merges (default: preview only)')
    parser.add_argument('--out-csv', type=str, default=None,
                        help='Output CSV file for candidates')
    parser.add_argument('--normalize-only', action='store_true',
                        help='Only normalize wines (no deduplication)')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("🍷 WINE DEDUPLICATION TOOL")
    print("=" * 60)
    
    # Normalize-only mode
    if args.normalize_only:
        normalize_all_wines(args.table)
        return
    
    # Find duplicates
    candidates = find_duplicates(args.table, args.threshold, args.limit)
    
    if not candidates:
        print("\n✅ No duplicates found!")
        return
    
    # Save to CSV
    if args.out_csv:
        save_to_csv(candidates, args.out_csv)
    
    # Display sample
    print(f"\n📋 Sample duplicate pairs (showing first 10):")
    print("-" * 60)
    for c in candidates[:10]:
        print(f"  Score: {c['score']}")
        print(f"    1. [{c['wine1_id']}] {c['wine1_name']}")
        print(f"    2. [{c['wine2_id']}] {c['wine2_name']}")
        print()
    
    # Apply merges if requested
    if args.apply:
        confirm = input(f"\n⚠️  Apply {len(candidates)} merges? (yes/no): ").strip().lower()
        if confirm == 'yes':
            merged_count = apply_merges(args.table, candidates)
            print(f"\n✅ Successfully merged {merged_count} wines!")
        else:
            print("❌ Merge cancelled")
    else:
        print("\n💡 To apply these merges, run again with --apply flag")
    
    print("\n" + "=" * 60)
    print("✅ DEDUPLICATION COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

