from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
import json
import os

from ..database import get_db
from ..models import Dataset, SensorData, Annotation
from ..schemas import DatasetCreate, DatasetResponse, AnnotationCreate, AnnotationResponse

router = APIRouter(prefix="/api/datasets", tags=["datasets"])


@router.get("", response_model=list[DatasetResponse])
async def list_datasets(
    status: str | None = None,
    tag: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    q = select(Dataset).order_by(Dataset.created_at.desc())
    if status:
        q = q.where(Dataset.status == status)
    if tag:
        q = q.where(Dataset.tags.any(tag))
    q = q.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{dataset_id}", response_model=DatasetResponse)
async def get_dataset(dataset_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    ds = result.scalar_one_or_none()
    if not ds:
        raise HTTPException(404, "Dataset not found")
    return ds


@router.post("", response_model=DatasetResponse, status_code=201)
async def create_dataset(data: DatasetCreate, db: AsyncSession = Depends(get_db)):
    ds = Dataset(**data.model_dump())
    db.add(ds)
    await db.commit()
    await db.refresh(ds)
    return ds


@router.put("/{dataset_id}", response_model=DatasetResponse)
async def update_dataset(dataset_id: UUID, data: DatasetCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    ds = result.scalar_one_or_none()
    if not ds:
        raise HTTPException(404, "Dataset not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(ds, k, v)
    await db.commit()
    await db.refresh(ds)
    return ds


@router.post("/{dataset_id}/export")
async def export_dataset(
    dataset_id: UUID,
    format: str = Query("jsonl"),
    db: AsyncSession = Depends(get_db),
):
    """导出数据集为指定格式"""
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    ds = result.scalar_one_or_none()
    if not ds:
        raise HTTPException(404, "Dataset not found")

    # 收集关联任务的传感器数据
    query = select(SensorData).order_by(SensorData.timestamp.asc()).limit(50000)
    data_result = await db.execute(query)
    records = data_result.scalars().all()

    file_path = f"/app/data/datasets/{ds.id}.{format}"
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    with open(file_path, "w") as f:
        for rec in records:
            row = {
                "sensor_id": str(rec.sensor_id),
                "robot_id": str(rec.robot_id),
                "timestamp": rec.timestamp.isoformat(),
                "data_value": rec.data_value,
                "quality_score": rec.quality_score,
            }
            f.write(json.dumps(row) + "\n")

    ds.file_path = file_path
    ds.total_samples = len(records)
    ds.size_bytes = os.path.getsize(file_path)
    ds.status = "ready"
    await db.commit()

    return {
        "file_path": file_path,
        "total_samples": ds.total_samples,
        "size_bytes": ds.size_bytes,
        "format": format,
    }


# ---- Annotations ----
@router.get("/{dataset_id}/annotations", response_model=list[AnnotationResponse])
async def list_annotations(
    dataset_id: UUID,
    annotation_type: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    q = select(Annotation).where(Annotation.dataset_id == dataset_id)
    if annotation_type:
        q = q.where(Annotation.annotation_type == annotation_type)
    q = q.order_by(Annotation.created_at.desc())
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/{dataset_id}/annotations", response_model=AnnotationResponse, status_code=201)
async def create_annotation(
    dataset_id: UUID,
    data: AnnotationCreate,
    db: AsyncSession = Depends(get_db),
):
    data.dataset_id = dataset_id
    ann = Annotation(**data.model_dump())
    db.add(ann)
    await db.commit()
    await db.refresh(ann)
    return ann
