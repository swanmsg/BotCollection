from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from uuid import UUID
from datetime import datetime, timedelta

from ..database import get_db
from ..models import SensorData, Sensor
from ..schemas import SensorDataCreate, SensorDataBatchCreate, SensorDataResponse
from ..agents.quality_agent import DataQualityAgent

router = APIRouter(prefix="/api/data", tags=["sensor_data"])
quality_agent = DataQualityAgent()


@router.post("", response_model=list[SensorDataResponse], status_code=201)
async def ingest_sensor_data(data: SensorDataBatchCreate, db: AsyncSession = Depends(get_db)):
    """批量写入传感器数据，自动进行质量评估"""
    records = [r.model_dump() for r in data.records]

    # Agent: 质量评估
    records = quality_agent.evaluate_batch(records)

    # 写入数据库
    objects = []
    for r in records:
        meta = r.pop("metadata", {})
        obj = SensorData(
            sensor_id=r["sensor_id"],
            robot_id=r["robot_id"],
            timestamp=r["timestamp"],
            sequence_id=r.get("sequence_id"),
            data_value=r["data_value"],
            quality_score=r["quality_score"],
            metadata_=meta,
        )
        objects.append(obj)

    db.add_all(objects)
    await db.commit()

    return objects


@router.get("", response_model=list[SensorDataResponse])
async def query_sensor_data(
    sensor_id: UUID | None = None,
    robot_id: UUID | None = None,
    start_time: datetime | None = None,
    end_time: datetime | None = None,
    min_quality: float = Query(0.0, ge=0, le=1),
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    q = select(SensorData).order_by(SensorData.timestamp.desc())
    if sensor_id:
        q = q.where(SensorData.sensor_id == sensor_id)
    if robot_id:
        q = q.where(SensorData.robot_id == robot_id)
    if start_time:
        q = q.where(SensorData.timestamp >= start_time)
    if end_time:
        q = q.where(SensorData.timestamp <= end_time)
    if min_quality > 0:
        q = q.where(SensorData.quality_score >= min_quality)
    q = q.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/stats")
async def data_stats(
    sensor_id: UUID | None = None,
    robot_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
):
    q = select(
        func.count(SensorData.id).label("total"),
        func.avg(SensorData.quality_score).label("avg_quality"),
        func.min(SensorData.timestamp).label("first_record"),
        func.max(SensorData.timestamp).label("last_record"),
    )
    if sensor_id:
        q = q.where(SensorData.sensor_id == sensor_id)
    if robot_id:
        q = q.where(SensorData.robot_id == robot_id)
    result = await db.execute(q)
    row = result.one()
    return {
        "total_records": row.total,
        "avg_quality": float(row.avg_quality or 0),
        "first_record": row.first_record,
        "last_record": row.last_record,
    }


@router.get("/quality-report")
async def quality_report(
    sensor_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
):
    q = select(SensorData.quality_score, SensorData.metadata_)
    if sensor_id:
        q = q.where(SensorData.sensor_id == sensor_id)
    q = q.limit(1000)
    result = await db.execute(q)
    rows = result.all()
    scores = [r[0] for r in rows]
    flags = {}
    for r in rows:
        meta = r[1] or {}
        for f in meta.get("quality_flags", []):
            flags[f] = flags.get(f, 0) + 1
    return {
        "sample_size": len(scores),
        "avg_quality": sum(scores) / len(scores) if scores else 0,
        "min_quality": min(scores) if scores else 0,
        "max_quality": max(scores) if scores else 0,
        "low_quality_count": sum(1 for s in scores if s < 0.7),
        "quality_flags": flags,
    }
