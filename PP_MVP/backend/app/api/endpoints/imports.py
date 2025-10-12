import io
import pandas as pd
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.wine import Wine
from app.schemas.wine import ImportResponse

router = APIRouter()


@router.post("/csv", response_model=ImportResponse)
async def import_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a CSV file with wine data and import it into the database.
    Expected columns: name, price_usd, url, region, grapes, vintage, notes
    """
    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .csv files are allowed"
        )
    
    # Read file contents
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error reading CSV file: {str(e)}"
        )
    
    # Validate required columns
    required_columns = ['name']
    missing = [col for col in required_columns if col not in df.columns]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing required columns: {', '.join(missing)}"
        )
    
    # Import rows
    imported_count = 0
    errors = []
    
    for idx, row in df.iterrows():
        try:
            # Skip rows without a name
            if pd.isna(row.get('name')) or not str(row.get('name')).strip():
                continue
            
            wine = Wine(
                name=str(row['name']).strip(),
                price_usd=float(row['price_usd']) if pd.notna(row.get('price_usd')) else None,
                url=str(row['url']).strip() if pd.notna(row.get('url')) else None,
                region=str(row['region']).strip() if pd.notna(row.get('region')) else None,
                grapes=str(row['grapes']).strip() if pd.notna(row.get('grapes')) else None,
                vintage=str(row['vintage']).strip() if pd.notna(row.get('vintage')) else None,
                notes=str(row['notes']).strip() if pd.notna(row.get('notes')) else None,
            )
            db.add(wine)
            imported_count += 1
        except Exception as e:
            errors.append(f"Row {idx + 2}: {str(e)}")
    
    # Commit all changes
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    
    message = f"Successfully imported {imported_count} wines"
    if errors:
        message += f". {len(errors)} rows had errors."
    
    return ImportResponse(
        ok=True,
        rows=imported_count,
        message=message
    )

