from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text

from ..database import get_db
from ..models import Robot, Sensor, SensorData, CollectionTask, Dataset

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("")
async def dashboard_stats(db: AsyncSession = Depends(get_db)):
    try:
        robots = await db.execute(select(func.count(Robot.id)))
        total_robots = robots.scalar() or 0
    except Exception:
        total_robots = 0

    try:
        sensors = await db.execute(select(func.count(Sensor.id)))
        total_sensors = sensors.scalar() or 0
    except Exception:
        total_sensors = 0

    try:
        data_count = await db.execute(select(func.count(SensorData.id)))
        total_data = data_count.scalar() or 0
    except Exception:
        total_data = 0

    try:
        tasks = await db.execute(select(func.count(CollectionTask.id)))
        total_tasks = tasks.scalar() or 0
    except Exception:
        total_tasks = 0

    try:
        datasets = await db.execute(select(func.count(Dataset.id)))
        total_datasets = datasets.scalar() or 0
    except Exception:
        total_datasets = 0

    task_by_status = {}
    try:
        result = await db.execute(
            select(CollectionTask.status, func.count(CollectionTask.id)).group_by(CollectionTask.status)
        )
        task_by_status = {row[0]: row[1] for row in result.all()}
    except Exception:
        pass

    robot_by_type = {}
    try:
        result = await db.execute(
            select(Robot.robot_type, func.count(Robot.id)).group_by(Robot.robot_type)
        )
        robot_by_type = {row[0]: row[1] for row in result.all()}
    except Exception:
        pass

    recent_24h = 0
    try:
        result = await db.execute(
            select(func.count(SensorData.id)).where(
                SensorData.timestamp >= text("NOW() - INTERVAL '24 hours'")
            )
        )
        recent_24h = result.scalar() or 0
    except Exception:
        pass

    return {
        "total_robots": total_robots,
        "total_sensors": total_sensors,
        "total_data_records": total_data,
        "total_tasks": total_tasks,
        "total_datasets": total_datasets,
        "recent_24h_records": recent_24h,
        "tasks_by_status": task_by_status,
        "robots_by_type": robot_by_type,
    }
