from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime
from uuid import UUID


# ---- Robot ----
class RobotCreate(BaseModel):
    name: str
    robot_type: str
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    description: Optional[str] = None
    config: dict = {}

class RobotResponse(BaseModel):
    id: UUID
    name: str
    robot_type: str
    manufacturer: Optional[str]
    model: Optional[str]
    description: Optional[str]
    config: dict
    status: str
    created_at: datetime
    class Config:
        from_attributes = True


# ---- Sensor ----
class SensorCreate(BaseModel):
    robot_id: UUID
    name: str
    sensor_type: str
    data_format: str
    sampling_rate_hz: Optional[float] = None
    dimensions: Optional[dict] = None
    calibration_params: dict = {}
    unit: Optional[str] = None

class SensorResponse(BaseModel):
    id: UUID
    robot_id: UUID
    name: str
    sensor_type: str
    data_format: str
    sampling_rate_hz: Optional[float]
    dimensions: Optional[dict]
    calibration_params: dict
    unit: Optional[str]
    status: str
    created_at: datetime
    class Config:
        from_attributes = True


# ---- Sensor Data ----
class SensorDataCreate(BaseModel):
    sensor_id: UUID
    robot_id: UUID
    timestamp: datetime
    sequence_id: Optional[int] = None
    data_value: Any
    quality_score: float = 1.0
    metadata: dict = {}

class SensorDataBatchCreate(BaseModel):
    records: list[SensorDataCreate]

class SensorDataResponse(BaseModel):
    id: int
    sensor_id: UUID
    robot_id: UUID
    timestamp: datetime
    sequence_id: Optional[int]
    data_value: Any
    quality_score: float
    class Config:
        from_attributes = True


# ---- Collection Task ----
class TaskCreate(BaseModel):
    name: str
    description: Optional[str] = None
    robot_id: UUID
    task_type: str
    config: dict = {}
    sensor_ids: list[UUID] = []

class TaskResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    robot_id: UUID
    task_type: str
    config: dict
    sensor_ids: list[UUID]
    status: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    total_samples: int
    created_at: datetime
    class Config:
        from_attributes = True


# ---- Dataset ----
class DatasetCreate(BaseModel):
    name: str
    description: Optional[str] = None
    version: str = "1.0.0"
    robot_types: list[str] = []
    sensor_types: list[str] = []
    tags: list[str] = []
    license: str = "CC-BY-4.0"
    format: str = "jsonl"
    task_ids: list[UUID] = []

class DatasetResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    version: str
    robot_types: list[str]
    sensor_types: list[str]
    tags: list[str]
    license: str
    format: str
    total_samples: int
    size_bytes: int
    file_path: Optional[str]
    task_ids: list[UUID]
    metadata_: Optional[dict]
    status: str
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


# ---- Annotation ----
class AnnotationCreate(BaseModel):
    dataset_id: UUID
    sensor_id: Optional[UUID] = None
    annotation_type: str
    label: Optional[str] = None
    value: Any
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    annotator: Optional[str] = None
    confidence: float = 1.0

class AnnotationResponse(BaseModel):
    id: UUID
    dataset_id: UUID
    sensor_id: Optional[UUID]
    annotation_type: str
    label: Optional[str]
    value: Any
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    annotator: Optional[str]
    confidence: float
    created_at: datetime
    class Config:
        from_attributes = True


# ---- Pipeline ----
class PipelineCreate(BaseModel):
    name: str
    description: Optional[str] = None
    steps: list[dict] = []
    input_dataset_id: Optional[UUID] = None

class PipelineResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    steps: list[dict]
    input_dataset_id: Optional[UUID]
    output_dataset_id: Optional[UUID]
    status: str
    progress: float
    logs: list[dict]
    created_at: datetime
    class Config:
        from_attributes = True


# ---- Pagination ----
class PaginatedResponse(BaseModel):
    items: list[Any]
    total: int
    page: int
    page_size: int
