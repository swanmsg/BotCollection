from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID

from ..database import get_db
from ..models import Sensor
from ..schemas import SensorCreate, SensorResponse

router = APIRouter(prefix="/api/sensors", tags=["sensors"])


@router.get("", response_model=list[SensorResponse])
async def list_sensors(
    robot_id: UUID | None = None,
    sensor_type: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    q = select(Sensor).order_by(Sensor.created_at.desc())
    if robot_id:
        q = q.where(Sensor.robot_id == robot_id)
    if sensor_type:
        q = q.where(Sensor.sensor_type == sensor_type)
    q = q.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{sensor_id}", response_model=SensorResponse)
async def get_sensor(sensor_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Sensor).where(Sensor.id == sensor_id))
    sensor = result.scalar_one_or_none()
    if not sensor:
        raise HTTPException(404, "Sensor not found")
    return sensor


@router.post("", response_model=SensorResponse, status_code=201)
async def create_sensor(data: SensorCreate, db: AsyncSession = Depends(get_db)):
    sensor = Sensor(**data.model_dump())
    db.add(sensor)
    await db.commit()
    await db.refresh(sensor)
    return sensor


@router.put("/{sensor_id}", response_model=SensorResponse)
async def update_sensor(sensor_id: UUID, data: SensorCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Sensor).where(Sensor.id == sensor_id))
    sensor = result.scalar_one_or_none()
    if not sensor:
        raise HTTPException(404, "Sensor not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(sensor, k, v)
    await db.commit()
    await db.refresh(sensor)
    return sensor


@router.delete("/{sensor_id}", status_code=204)
async def delete_sensor(sensor_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Sensor).where(Sensor.id == sensor_id))
    sensor = result.scalar_one_or_none()
    if not sensor:
        raise HTTPException(404, "Sensor not found")
    await db.delete(sensor)
    await db.commit()
