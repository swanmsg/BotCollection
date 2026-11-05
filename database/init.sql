-- BotCollection: 具身智能传感器数据集采集系统
-- PostgreSQL 初始化脚本

-- 启用扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. 机器人/设备注册表
-- ============================================================
CREATE TABLE robots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(128) NOT NULL,
    robot_type VARCHAR(64) NOT NULL,          -- robot_arm | humanoid | unitree_g1 | agibot_g1 | agibot_x2 | dexterous_hand | electronic_skin | custom
    manufacturer VARCHAR(128),
    model VARCHAR(128),
    description TEXT,
    config JSONB DEFAULT '{}',                -- 设备特定配置
    status VARCHAR(32) DEFAULT 'offline',     -- online | offline | calibrating | error
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. 传感器定义表
-- ============================================================
CREATE TABLE sensors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    robot_id UUID NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    sensor_type VARCHAR(64) NOT NULL,         -- force_torque | imu | proximity | tactile | camera | lidar | joint_encoder | pressure | temperature | emg
    data_format VARCHAR(32) NOT NULL,         -- scalar | vector | matrix | point_cloud | image | audio
    sampling_rate_hz FLOAT,                   -- 采样频率
    dimensions JSONB,                         -- 如 {"channels": 6, "axis": 3}
    calibration_params JSONB DEFAULT '{}',    -- 校准参数
    unit VARCHAR(32),                         -- N | m/s^2 | deg/s | Pa | C | V
    status VARCHAR(32) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. 传感器数据表 (分区表 - 按月分区)
-- ============================================================
CREATE TABLE sensor_data (
    id BIGSERIAL,
    sensor_id UUID NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
    robot_id UUID NOT NULL REFERENCES robots(id),
    timestamp TIMESTAMPTZ NOT NULL,
    sequence_id BIGINT,                       -- 采集序列号
    data_value JSONB NOT NULL,                -- 传感器读数: 数值/数组/矩阵
    raw_data BYTEA,                           -- 原始二进制数据(可选)
    quality_score FLOAT DEFAULT 1.0,          -- 数据质量评分 0-1
    metadata JSONB DEFAULT '{}',              -- 额外元数据(环境温度等)
    PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- 创建月度分区示例 (2026)
CREATE TABLE sensor_data_2026_01 PARTITION OF sensor_data
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE sensor_data_2026_02 PARTITION OF sensor_data
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE sensor_data_2026_03 PARTITION OF sensor_data
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE sensor_data_2026_04 PARTITION OF sensor_data
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE sensor_data_2026_05 PARTITION OF sensor_data
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE sensor_data_2026_06 PARTITION OF sensor_data
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE sensor_data_2026_07 PARTITION OF sensor_data
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE sensor_data_2026_08 PARTITION OF sensor_data
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE sensor_data_2026_09 PARTITION OF sensor_data
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE sensor_data_2026_10 PARTITION OF sensor_data
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE sensor_data_2026_11 PARTITION OF sensor_data
    FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE sensor_data_2026_12 PARTITION OF sensor_data
    FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- ============================================================
-- 4. 采集任务表
-- ============================================================
CREATE TABLE collection_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(256) NOT NULL,
    description TEXT,
    robot_id UUID NOT NULL REFERENCES robots(id),
    task_type VARCHAR(64) NOT NULL,           -- realtime_streaming | batch_recording | triggered_capture
    config JSONB NOT NULL DEFAULT '{}',       -- 采集参数: duration, frequency, triggers
    sensor_ids UUID[] DEFAULT '{}',           -- 采集哪些传感器
    status VARCHAR(32) DEFAULT 'pending',     -- pending | running | paused | completed | failed
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    total_samples BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. 数据集管理表
-- ============================================================
CREATE TABLE datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(256) NOT NULL,
    description TEXT,
    version VARCHAR(32) DEFAULT '1.0.0',
    robot_types VARCHAR(64)[] DEFAULT '{}',   -- 涉及的机器人类型
    sensor_types VARCHAR(64)[] DEFAULT '{}',  -- 涉及的传感器类型
    tags VARCHAR(64)[] DEFAULT '{}',
    license VARCHAR(64) DEFAULT 'CC-BY-4.0',
    format VARCHAR(32) DEFAULT 'jsonl',       -- jsonl | csv | hdf5 | rosbag | parquet
    total_samples BIGINT DEFAULT 0,
    size_bytes BIGINT DEFAULT 0,
    file_path VARCHAR(512),                   -- 导出文件路径
    task_ids UUID[] DEFAULT '{}',             -- 关联的采集任务
    metadata JSONB DEFAULT '{}',              -- 数据集元数据: 统计信息、特征描述
    status VARCHAR(32) DEFAULT 'draft',       -- draft | processing | ready | archived
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. 数据标注表
-- ============================================================
CREATE TABLE annotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    sensor_id UUID REFERENCES sensors(id),
    annotation_type VARCHAR(64) NOT NULL,     -- label | bbox | trajectory | action_primitive | force_profile
    label VARCHAR(256),
    value JSONB NOT NULL,                     -- 标注数据
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    annotator VARCHAR(128),                   -- 人工标注 / agent 标注
    confidence FLOAT DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. 数据预处理流水线表
-- ============================================================
CREATE TABLE pipelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(256) NOT NULL,
    description TEXT,
    steps JSONB NOT NULL DEFAULT '[]',        -- 处理步骤序列
    input_dataset_id UUID REFERENCES datasets(id),
    output_dataset_id UUID REFERENCES datasets(id),
    status VARCHAR(32) DEFAULT 'idle',        -- idle | running | completed | failed
    progress FLOAT DEFAULT 0.0,
    logs JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 索引
-- ============================================================
CREATE INDEX idx_sensors_robot ON sensors(robot_id);
CREATE INDEX idx_sensor_data_sensor_time ON sensor_data(sensor_id, timestamp DESC);
CREATE INDEX idx_sensor_data_robot_time ON sensor_data(robot_id, timestamp DESC);
CREATE INDEX idx_sensor_data_quality ON sensor_data(quality_score) WHERE quality_score < 0.8;
CREATE INDEX idx_collection_tasks_robot ON collection_tasks(robot_id);
CREATE INDEX idx_collection_tasks_status ON collection_tasks(status);
CREATE INDEX idx_datasets_status ON datasets(status);
CREATE INDEX idx_datasets_tags ON datasets USING GIN(tags);
CREATE INDEX idx_annotations_dataset ON annotations(dataset_id);
CREATE INDEX idx_annotations_type ON annotations(annotation_type);

-- ============================================================
-- 更新时间触发器
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_robots_updated_at
    BEFORE UPDATE ON robots FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_datasets_updated_at
    BEFORE UPDATE ON datasets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_pipelines_updated_at
    BEFORE UPDATE ON pipelines FOR EACH ROW EXECUTE FUNCTION update_updated_at();
