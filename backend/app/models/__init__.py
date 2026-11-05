from sqlalchemy import Column, String, Text, Float, BigInteger, DateTime, ForeignKey, ARRAY, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB, BYTEA
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from ..database import Base


class Robot(Base):
    __tablename__ = "robots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(128), nullable=False)
    robot_type = Column(String(64), nullable=False)
    manufacturer = Column(String(128))
    model = Column(String(128))
    description = Column(Text)
    config = Column(JSONB, default={})
    status = Column(String(32), default="offline")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    sensors = relationship("Sensor", back_populates="robot", cascade="all, delete-orphan")
    tasks = relationship("CollectionTask", back_populates="robot", cascade="all, delete-orphan")


class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    robot_id = Column(UUID(as_uuid=True), ForeignKey("robots.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(128), nullable=False)
    sensor_type = Column(String(64), nullable=False)
    data_format = Column(String(32), nullable=False)
    sampling_rate_hz = Column(Float)
    dimensions = Column(JSONB)
    calibration_params = Column(JSONB, default={})
    unit = Column(String(32))
    status = Column(String(32), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    robot = relationship("Robot", back_populates="sensors")
    data_records = relationship("SensorData", back_populates="sensor", cascade="all, delete-orphan")


class SensorData(Base):
    __tablename__ = "sensor_data"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    sensor_id = Column(UUID(as_uuid=True), ForeignKey("sensors.id", ondelete="CASCADE"), nullable=False)
    robot_id = Column(UUID(as_uuid=True), ForeignKey("robots.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False, primary_key=True)
    sequence_id = Column(BigInteger)
    data_value = Column(JSONB, nullable=False)
    raw_data = Column(BYTEA)
    quality_score = Column(Float, default=1.0)
    metadata_ = Column("metadata", JSONB, default={})

    sensor = relationship("Sensor", back_populates="data_records")


class CollectionTask(Base):
    __tablename__ = "collection_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(256), nullable=False)
    description = Column(Text)
    robot_id = Column(UUID(as_uuid=True), ForeignKey("robots.id"), nullable=False)
    task_type = Column(String(64), nullable=False)
    config = Column(JSONB, default={})
    sensor_ids = Column(ARRAY(UUID(as_uuid=True)), default=[])
    status = Column(String(32), default="pending")
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    total_samples = Column(BigInteger, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    robot = relationship("Robot", back_populates="tasks")


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(256), nullable=False)
    description = Column(Text)
    version = Column(String(32), default="1.0.0")
    robot_types = Column(ARRAY(String(64)), default=[])
    sensor_types = Column(ARRAY(String(64)), default=[])
    tags = Column(ARRAY(String(64)), default=[])
    license = Column(String(64), default="CC-BY-4.0")
    format = Column(String(32), default="jsonl")
    total_samples = Column(BigInteger, default=0)
    size_bytes = Column(BigInteger, default=0)
    file_path = Column(String(512))
    task_ids = Column(ARRAY(UUID(as_uuid=True)), default=[])
    metadata_ = Column("metadata", JSONB, default={})
    status = Column(String(32), default="draft")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Annotation(Base):
    __tablename__ = "annotations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    sensor_id = Column(UUID(as_uuid=True), ForeignKey("sensors.id"))
    annotation_type = Column(String(64), nullable=False)
    label = Column(String(256))
    value = Column(JSONB, nullable=False)
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    annotator = Column(String(128))
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Pipeline(Base):
    __tablename__ = "pipelines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(256), nullable=False)
    description = Column(Text)
    steps = Column(JSONB, default=[])
    input_dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id"))
    output_dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id"))
    status = Column(String(32), default="idle")
    progress = Column(Float, default=0.0)
    logs = Column(JSONB, default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
