from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from uuid import UUID

from ..database import get_db
from ..models import Robot, Sensor
from ..schemas import RobotCreate, RobotResponse, SensorCreate, SensorResponse

router = APIRouter(prefix="/api/robots", tags=["robots"])


@router.get("", response_model=list[RobotResponse])
async def list_robots(
    robot_type: str | None = None,
    status: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    q = select(Robot).order_by(Robot.created_at.desc())
    if robot_type:
        q = q.where(Robot.robot_type == robot_type)
    if status:
        q = q.where(Robot.status == status)
    q = q.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{robot_id}", response_model=RobotResponse)
async def get_robot(robot_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Robot).where(Robot.id == robot_id))
    robot = result.scalar_one_or_none()
    if not robot:
        raise HTTPException(404, "Robot not found")
    return robot


@router.post("", response_model=RobotResponse, status_code=201)
async def create_robot(data: RobotCreate, db: AsyncSession = Depends(get_db)):
    robot = Robot(**data.model_dump())
    db.add(robot)
    await db.commit()
    await db.refresh(robot)
    return robot


@router.put("/{robot_id}", response_model=RobotResponse)
async def update_robot(robot_id: UUID, data: RobotCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Robot).where(Robot.id == robot_id))
    robot = result.scalar_one_or_none()
    if not robot:
        raise HTTPException(404, "Robot not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(robot, k, v)
    await db.commit()
    await db.refresh(robot)
    return robot


@router.delete("/{robot_id}", status_code=204)
async def delete_robot(robot_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Robot).where(Robot.id == robot_id))
    robot = result.scalar_one_or_none()
    if not robot:
        raise HTTPException(404, "Robot not found")
    await db.delete(robot)
    await db.commit()


@router.get("/{robot_id}/sensors", response_model=list[SensorResponse])
async def list_robot_sensors(robot_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Sensor).where(Sensor.robot_id == robot_id).order_by(Sensor.created_at.desc())
    )
    return result.scalars().all()


@router.get("/stats/summary")
async def robot_stats(db: AsyncSession = Depends(get_db)):
    total = await db.execute(select(func.count(Robot.id)))
    by_type = await db.execute(
        select(Robot.robot_type, func.count(Robot.id)).group_by(Robot.robot_type)
    )
    return {
        "total_robots": total.scalar(),
        "by_type": {row[0]: row[1] for row in by_type.all()},
    }
