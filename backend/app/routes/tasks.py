from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from ..database import get_db
from ..models import CollectionTask, Sensor, Robot, SensorData
from ..schemas import TaskCreate, TaskResponse
from ..agents.annotation_agent import AutoAnnotationAgent
from ..agents.preprocessing_agent import DataPreprocessingAgent

router = APIRouter(prefix="/api/tasks", tags=["collection_tasks"])
annotation_agent = AutoAnnotationAgent()
preprocessing_agent = DataPreprocessingAgent()


@router.get("", response_model=list[TaskResponse])
async def list_tasks(
    robot_id: UUID | None = None,
    status: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    q = select(CollectionTask).order_by(CollectionTask.created_at.desc())
    if robot_id:
        q = q.where(CollectionTask.robot_id == robot_id)
    if status:
        q = q.where(CollectionTask.status == status)
    q = q.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CollectionTask).where(CollectionTask.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")
    return task


@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(data: TaskCreate, db: AsyncSession = Depends(get_db)):
    task = CollectionTask(**data.model_dump())
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@router.post("/{task_id}/start", response_model=TaskResponse)
async def start_task(task_id: UUID, db: AsyncSession = Depends(get_db)):
    from datetime import datetime, timezone
    result = await db.execute(select(CollectionTask).where(CollectionTask.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")
    task.status = "running"
    task.started_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(task)
    return task


@router.post("/{task_id}/stop", response_model=TaskResponse)
async def stop_task(task_id: UUID, db: AsyncSession = Depends(get_db)):
    from datetime import datetime, timezone
    result = await db.execute(select(CollectionTask).where(CollectionTask.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")
    task.status = "completed"
    task.completed_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(task)
    return task


@router.post("/{task_id}/annotate")
async def annotate_task_data(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """使用 AgentScope Agent 为任务采集的数据生成自动标注"""
    result = await db.execute(select(CollectionTask).where(CollectionTask.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")

    # 获取该机器人对应传感器类型
    sensor_result = await db.execute(
        select(Sensor).where(Sensor.robot_id == task.robot_id)
    )
    sensors = {s.id: s.sensor_type for s in sensor_result.scalars().all()}

    # 获取相关数据
    data_result = await db.execute(
        select(SensorData)
        .where(SensorData.robot_id == task.robot_id)
        .order_by(SensorData.timestamp.asc())
        .limit(1000)
    )
    records = data_result.scalars().all()

    # 按传感器类型分组标注
    annotated_count = 0
    for rec in records:
        sensor_type = sensors.get(rec.sensor_id, "generic")
        record_dict = {
            "sensor_id": str(rec.sensor_id),
            "data_value": rec.data_value,
            "timestamp": rec.timestamp.isoformat(),
        }
        annotated = annotation_agent.annotate([record_dict], sensor_type)
        if annotated and "annotation" in annotated[0]:
            ann = annotated[0]["annotation"]
            annotation = Annotation(
                dataset_id=task_id,  # 临时关联
                sensor_id=rec.sensor_id,
                annotation_type=ann["annotation_type"],
                label=ann.get("label"),
                value=ann["value"],
                confidence=ann.get("confidence", 0.8),
                annotator="AutoAnnotationAgent",
            )
            db.add(annotation)
            annotated_count += 1

    await db.commit()
    return {"task_id": str(task_id), "annotated_records": annotated_count}


@router.post("/{task_id}/preprocess")
async def preprocess_task_data(
    task_id: UUID,
    steps: list[dict] = [],
    db: AsyncSession = Depends(get_db),
):
    """使用 AgentScope Agent 预处理任务数据"""
    result = await db.execute(select(CollectionTask).where(CollectionTask.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")

    data_result = await db.execute(
        select(SensorData)
        .where(SensorData.robot_id == task.robot_id)
        .order_by(SensorData.timestamp.asc())
        .limit(5000)
    )
    records = data_result.scalars().all()

    record_dicts = [
        {
            "sensor_id": str(r.sensor_id),
            "data_value": r.data_value,
            "timestamp": r.timestamp.isoformat(),
            "quality_score": r.quality_score,
        }
        for r in records
    ]

    if not steps:
        steps = [
            {"operation": "fill_missing", "params": {}},
            {"operation": "remove_outliers", "params": {"threshold": 3.0}},
            {"operation": "smooth", "params": {"window": 5}},
        ]

    processed = preprocessing_agent.process(record_dicts, steps)
    return {
        "task_id": str(task_id),
        "input_count": len(record_dicts),
        "output_count": len(processed),
        "steps_applied": [s["operation"] for s in steps],
        "sample_output": processed[:5] if processed else [],
    }
