# BotCollection

具身智能传感器数据集采集系统 — 机器人、机械臂、灵巧手、电子皮肤、Unitree G1、AgiBot G1、AgiBot X2 等多模态数据采集与管理。

## Tech Stack

- **Frontend**: Next.js 14 + Tailwind CSS + Recharts
- **Backend**: FastAPI + AgentScope Agents + SQLAlchemy
- **Database**: PostgreSQL 16 (分区表)

## Quick Start

```bash
# 1. Clone and enter project
cd BotCollection

# 2. Configure environment
cp .env .env.local
# Edit .env with your OPENAI_API_KEY (optional for agents)

# 3. Start all services
docker compose up -d

# 4. Seed sample data
docker compose exec backend python -m app.seed
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs
- PostgreSQL: localhost:5432

## Architecture

```
Next.js Frontend (port 3000)
        |
        v
FastAPI Backend (port 8000)
   ├── DataQualityAgent     → 自动质量评估
   ├── AutoAnnotationAgent   → 自动标注
   └── DataPreprocessingAgent → 数据预处理流水线
        |
        v
PostgreSQL 16 (port 5432)
   robots → sensors → sensor_data (分区表)
   collection_tasks → datasets → annotations → pipelines
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard` | Dashboard statistics |
| GET/POST | `/api/robots` | CRUD robots |
| GET/POST | `/api/sensors` | CRUD sensors |
| POST | `/api/data` | Ingest sensor data (auto quality check) |
| GET | `/api/data` | Query sensor data |
| GET | `/api/data/quality-report` | Quality report |
| GET/POST | `/api/tasks` | Collection tasks |
| POST | `/api/tasks/{id}/annotate` | Auto-annotate via Agent |
| POST | `/api/tasks/{id}/preprocess` | Preprocess via Agent |
| GET/POST | `/api/datasets` | Dataset management |
| POST | `/api/datasets/{id}/export` | Export dataset (JSONL/CSV) |

## Unitree G1 Support

Built-in configuration for Unitree G1 humanoid robot:
- 23 joints, 43 DoFs
- Intel RealSense D435i depth camera
- 6-axis force torque sensors (ankles)
- 3x IMU (9-axis, 400Hz)
- 32-taxel foot pressure arrays
- Joint encoders at 500Hz

G1 page: `/g1` in the frontend UI.

## AgiBot G1 Support

Built-in configuration for AgiBot G1 full-size humanoid robot:
- 40 joints, 40 DoFs
- Livox Mid-360 LiDAR (200K pts/s)
- Intel RealSense D455 stereo camera
- 6x 6-axis force torque sensors (wrists/ankles/hips)
- 10x tactile fingertip sensors
- 64-taxel foot pressure arrays
- 4x IMU at 1KHz
- AgiBot SDK (UDP + ROS2)

AgiBot G1 page: `/agibot-g1` in the frontend UI.

## AgiBot X2 Support

Built-in configuration for AgiBot X2 quadruped robot:
- 12 joints, 12 DoFs (3 per leg)
- Livox Avia LiDAR (450K pts/frame)
- Stereo + RGB cameras
- 12x 6-axis joint torque sensors
- 4x 3-axis foot force sensors
- 2x IMU, 4x ultrasonic, 6x temperature
- AgiBot Legged SDK (RL-based gait control)

AgiBot X2 page: `/agibot-x2` in the frontend UI.

## AgentScope Agents

### DataQualityAgent
- Z-score outlier detection
- NaN/Inf value detection
- Timestamp validity check
- Batch quality scoring with metadata flags

### AutoAnnotationAgent
- Force/tactile pattern recognition (high_force, moderate_contact, light_contact)
- IMU motion state detection (high_motion, stationary)
- Joint action primitive labeling (moving, static)
- Pressure level classification

### DataPreprocessingAgent
- Outlier removal (Z-score threshold)
- Min-max / Z-score normalization
- Sliding window smoothing
- Downsampling
- Missing value filling
- Denoising

## Database Schema

- `robots` — Robot/device registry
- `sensors` — Sensor definitions (type, format, calibration)
- `sensor_data` — Time-series data (partitioned by month)
- `collection_tasks` — Data collection tasks
- `datasets` — Dataset management
- `annotations` — Data annotations
- `pipelines` — Preprocessing pipelines
