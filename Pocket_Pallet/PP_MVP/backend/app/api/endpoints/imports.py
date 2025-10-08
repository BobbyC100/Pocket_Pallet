"""Import endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_active_user, require_role
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import Role
from app.schemas.import_job import (
    ImportJob, ImportJobCreate, ImportJobUpdate,
    ImportMapping, ImportMappingCreate,
    FileFormat, ImportStatus, ValidationResult
)

router = APIRouter()


@router.post("", response_model=ImportJob, status_code=201)
async def create_import(
    source_id: int = Form(...),
    file_format: FileFormat = Form(...),
    mapping_id: int = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.IMPORTER))
):
    """
    Start new import job with file upload.
    For large files, this would use resumable upload.
    """
    from app.models.import_job import ImportJob as ImportJobModel
    
    # TODO: Implement actual file upload to storage
    # For now, just create the job
    
    import_job = ImportJobModel(
        source_id=source_id,
        mapping_id=mapping_id,
        created_by=current_user.id,
        filename=file.filename,
        file_format=file_format,
        file_size_bytes=0,  # Would be set during upload
        status=ImportStatus.UPLOADING
    )
    
    db.add(import_job)
    await db.flush()
    await db.refresh(import_job)
    
    # TODO: Queue background task to process import
    
    return import_job


@router.get("", response_model=List[ImportJob])
async def list_imports(
    status: ImportStatus = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.IMPORTER))
):
    """List import jobs."""
    from sqlalchemy import select
    from app.models.import_job import ImportJob as ImportJobModel
    
    query = select(ImportJobModel)
    
    if status:
        query = query.where(ImportJobModel.status == status)
    
    query = query.order_by(ImportJobModel.created_at.desc()).limit(limit).offset(offset)
    
    result = await db.execute(query)
    imports = result.scalars().all()
    
    return imports


@router.get("/{import_id}", response_model=ImportJob)
async def get_import(
    import_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.IMPORTER))
):
    """Get import job details."""
    from sqlalchemy import select
    from app.models.import_job import ImportJob as ImportJobModel
    
    result = await db.execute(
        select(ImportJobModel).where(ImportJobModel.id == import_id)
    )
    import_job = result.scalar_one_or_none()
    
    if not import_job:
        raise HTTPException(status_code=404, detail="Import not found")
    
    return import_job


@router.post("/{import_id}/cancel")
async def cancel_import(
    import_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.IMPORTER))
):
    """Cancel import job."""
    from sqlalchemy import select
    from app.models.import_job import ImportJob as ImportJobModel
    
    result = await db.execute(
        select(ImportJobModel).where(ImportJobModel.id == import_id)
    )
    import_job = result.scalar_one_or_none()
    
    if not import_job:
        raise HTTPException(status_code=404, detail="Import not found")
    
    if import_job.status in [ImportStatus.COMPLETED, ImportStatus.FAILED, ImportStatus.CANCELLED]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel import in {import_job.status} status"
        )
    
    import_job.status = ImportStatus.CANCELLED
    await db.flush()
    
    return {"message": "Import cancelled"}


# Mapping endpoints

@router.post("/mappings", response_model=ImportMapping, status_code=201)
async def create_mapping(
    mapping_data: ImportMappingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.IMPORTER))
):
    """Create import mapping."""
    from app.models.import_job import ImportMapping as ImportMappingModel
    
    mapping = ImportMappingModel(
        **mapping_data.model_dump(),
        created_by=current_user.id
    )
    
    db.add(mapping)
    await db.flush()
    await db.refresh(mapping)
    
    return mapping


@router.get("/mappings", response_model=List[ImportMapping])
async def list_mappings(
    source_id: int = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.IMPORTER))
):
    """List import mappings."""
    from sqlalchemy import select
    from app.models.import_job import ImportMapping as ImportMappingModel
    
    query = select(ImportMappingModel).where(ImportMappingModel.is_active == True)
    
    if source_id:
        query = query.where(ImportMappingModel.source_id == source_id)
    
    result = await db.execute(query)
    mappings = result.scalars().all()
    
    return mappings


@router.get("/mappings/{mapping_id}", response_model=ImportMapping)
async def get_mapping(
    mapping_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.IMPORTER))
):
    """Get import mapping."""
    from sqlalchemy import select
    from app.models.import_job import ImportMapping as ImportMappingModel
    
    result = await db.execute(
        select(ImportMappingModel).where(ImportMappingModel.id == mapping_id)
    )
    mapping = result.scalar_one_or_none()
    
    if not mapping:
        raise HTTPException(status_code=404, detail="Mapping not found")
    
    return mapping

