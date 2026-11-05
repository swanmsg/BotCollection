"""
BotCollection 数据种子脚本
在 Docker 启动后运行: docker compose exec backend python -m app.seed
"""
import asyncio
import random
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://botadmin:botsecret123@localhost:5432/botcollection"


async def seed():
    engine = create_async_engine(DATABASE_URL)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with async_session() as db:
        # 检查是否已有数据
        result = await db.execute(text("SELECT COUNT(*) FROM robots"))
        if result.scalar() > 0:
            print("Database already seeded, skipping.")
            return

        # 创建机器人
        robots = [
            {"name": "UR5e Robot Arm", "robot_type": "robot_arm", "manufacturer": "Universal Robots", "model": "UR5e", "status": "online"},
            {"name": "Shadow Dexterous Hand", "robot_type": "dexterous_hand", "manufacturer": "Shadow Robot", "model": "Hand Mk III", "status": "online"},
            {"name": "Electronic Skin Patch A", "robot_type": "electronic_skin", "manufacturer": "Custom Lab", "model": "E-Skin v2", "status": "online"},
            {"name": "Unitree H1 Humanoid", "robot_type": "humanoid", "manufacturer": "Unitree", "model": "H1", "status": "offline"},
            {"name": "Unitree G1 Humanoid", "robot_type": "unitree_g1", "manufacturer": "Unitree", "model": "G1", "status": "online"},
            {"name": "AgiBot G1 Humanoid", "robot_type": "agibot_g1", "manufacturer": "AgiBot", "model": "G1", "status": "online"},
            {"name": "AgiBot X2 Quadruped", "robot_type": "agibot_x2", "manufacturer": "AgiBot", "model": "X2", "status": "online"},
        ]

        robot_ids = []
        for r in robots:
            rid = uuid4()
            robot_ids.append(rid)
            await db.execute(
                text("INSERT INTO robots (id, name, robot_type, manufacturer, model, status) VALUES (:id, :name, :type, :mfr, :model, :status)"),
                {"id": rid, "name": r["name"], "type": r["robot_type"], "mfr": r["manufacturer"], "model": r["model"], "status": r["status"]},
            )

        # 创建传感器
        sensors_data = [
            (robot_ids[0], "Force Torque Sensor", "force_torque", "vector", 1000, '{"channels": 6, "axis": 6}', "N"),
            (robot_ids[0], "Joint Encoder 1", "joint_encoder", "scalar", 500, '{"joint": 1}', "deg"),
            (robot_ids[0], "IMU on End Effector", "imu", "vector", 400, '{"axis": 6}', "m/s^2"),
            (robot_ids[1], "Fingertip Tactile 1", "tactile", "matrix", 200, '{"taxels": 24, "rows": 4, "cols": 6}', "Pa"),
            (robot_ids[1], "Fingertip Tactile 2", "tactile", "matrix", 200, '{"taxels": 24}', "Pa"),
            (robot_ids[1], "Joint Torque Sensor", "force_torque", "vector", 500, '{"channels": 16}', "Nm"),
            (robot_ids[2], "Pressure Array", "pressure", "matrix", 100, '{"taxels": 64, "rows": 8, "cols": 8}', "Pa"),
            (robot_ids[2], "Temperature Sensor", "temperature", "scalar", 10, '{}', "C"),
            (robot_ids[3], "Whole Body IMU", "imu", "vector", 200, '{"axis": 9}', "m/s^2"),
            (robot_ids[3], "Joint Position Sensor", "joint_encoder", "vector", 500, '{"joints": 19}', "rad"),
            (robot_ids[4], "G1 Whole Body IMU", "imu", "vector", 400, '{"axis": 9}', "m/s^2"),
            (robot_ids[4], "G1 Joint Torques", "force_torque", "vector", 500, '{"channels": 23}', "Nm"),
            (robot_ids[4], "G1 Foot Pressure", "pressure", "matrix", 200, '{"taxels": 32, "rows": 4, "cols": 8}', "Pa"),
            (robot_ids[4], "G1 Depth Camera", "camera", "matrix", 30, '{"width": 640, "height": 480}', "px"),
            (robot_ids[5], "AgiBot LiDAR", "lidar", "point_cloud", 10, '{"points_per_sec": 200000, "range": 40}', "m"),
            (robot_ids[5], "AgiBot Wrist F/T Left", "force_torque", "vector", 1000, '{"channels": 6}', "N"),
            (robot_ids[5], "AgiBot Wrist F/T Right", "force_torque", "vector", 1000, '{"channels": 6}', "N"),
            (robot_ids[5], "AgiBot Fingertip Tactile", "tactile", "matrix", 500, '{"fingers": 10, "taxels_each": 24}', "Pa"),
            (robot_ids[5], "AgiBot Foot Pressure", "pressure", "matrix", 500, '{"taxels": 64, "rows": 8, "cols": 8}', "Pa"),
            (robot_ids[5], "AgiBot Stereo Camera", "camera", "matrix", 90, '{"width": 1920, "height": 1080, "stereo": true}', "px"),
            (robot_ids[5], "AgiBot IMU Array", "imu", "vector", 1000, '{"axis": 9, "units": 4}', "m/s^2"),
            (robot_ids[6], "X2 Livox Avia LiDAR", "lidar", "point_cloud", 10, '{"points_per_frame": 450000, "range": 45}', "m"),
            (robot_ids[6], "X2 Stereo Camera", "camera", "matrix", 60, '{"width": 1280, "height": 800, "stereo": true}', "px"),
            (robot_ids[6], "X2 RGB Camera", "camera", "matrix", 30, '{"width": 1920, "height": 1080}', "px"),
            (robot_ids[6], "X2 Joint Torques", "force_torque", "vector", 1000, '{"channels": 12}', "Nm"),
            (robot_ids[6], "X2 Foot Force", "pressure", "vector", 1000, '{"paws": 4, "axis": 3}', "N"),
            (robot_ids[6], "X2 IMU", "imu", "vector", 1000, '{"axis": 9, "units": 2}', "m/s^2"),
            (robot_ids[6], "X2 Motor Temperature", "temperature", "vector", 1, '{"channels": 12}', "C"),
            (robot_ids[6], "X2 Ultrasonic", "proximity", "vector", 10, '{"channels": 4}', "m"),
        ]

        sensor_ids = []
        for s in sensors_data:
            sid = uuid4()
            sensor_ids.append(sid)
            await db.execute(
                text("""INSERT INTO sensors (id, robot_id, name, sensor_type, data_format, sampling_rate_hz, dimensions, unit)
                         VALUES (:id, :rid, :name, :type, :fmt, :rate, :dim, :unit)"""),
                {"id": sid, "rid": s[0], "name": s[1], "type": s[2], "fmt": s[3], "rate": s[4], "dim": s[5], "unit": s[6]},
            )

        # 生成传感器数据
        now = datetime.now(timezone.utc)
        data_records = []
        for i, sid in enumerate(sensor_ids):
            robot_id = sensors_data[i][0]
            sensor_type = sensors_data[i][2]
            for t in range(200):
                ts = now - timedelta(seconds=200 - t)
                data_value = generate_sensor_reading(sensor_type)
                quality = round(random.uniform(0.7, 1.0), 3)
                data_records.append({
                    "sensor_id": sid,
                    "robot_id": robot_id,
                    "timestamp": ts,
                    "sequence_id": t,
                    "data_value": data_value,
                    "quality_score": quality,
                })

        for r in data_records:
            await db.execute(
                text("""INSERT INTO sensor_data (sensor_id, robot_id, timestamp, sequence_id, data_value, quality_score)
                         VALUES (:sid, :rid, :ts, :seq, :data, :qs)"""),
                {"sid": r["sensor_id"], "rid": r["robot_id"], "ts": r["timestamp"], "seq": r["sequence_id"],
                 "data": r["data_value"], "qs": r["quality_score"]},
            )

        # 创建示例数据集
        ds_id = uuid4()
        await db.execute(
            text("""INSERT INTO datasets (id, name, description, robot_types, sensor_types, tags, total_samples, status)
                     VALUES (:id, :name, :desc, :rt, :st, :tags, :samples, 'ready')"""),
            {"id": ds_id, "name": "Multi-Robot Sensor Dataset v1",
             "desc": "包含机械臂、灵巧手、电子皮肤的多模态传感器数据",
             "rt": ["robot_arm", "dexterous_hand", "electronic_skin"],
             "st": ["force_torque", "tactile", "pressure", "imu", "joint_encoder"],
             "tags": ["multi-modal", "embodied", "manipulation"],
             "samples": len(data_records)},
        )

        await db.commit()
        print(f"Seeded {len(robots)} robots, {len(sensors_data)} sensors, {len(data_records)} data records, 1 dataset.")


def generate_sensor_reading(sensor_type: str) -> dict:
    if sensor_type == "force_torque":
        return {"fx": round(random.gauss(0, 5), 2), "fy": round(random.gauss(0, 5), 2),
                "fz": round(random.gauss(-10, 3), 2), "mx": round(random.gauss(0, 1), 3),
                "my": round(random.gauss(0, 1), 3), "mz": round(random.gauss(0, 0.5), 3)}
    elif sensor_type == "tactile":
        return {"intensity": [round(random.uniform(0, 1), 3) for _ in range(24)]}
    elif sensor_type == "pressure":
        return {"pressure": [round(random.uniform(0, 500), 1) for _ in range(64)]}
    elif sensor_type == "imu":
        return {"ax": round(random.gauss(0, 2), 3), "ay": round(random.gauss(0, 2), 3),
                "az": round(random.gauss(9.81, 0.5), 3), "gx": round(random.gauss(0, 0.1), 4),
                "gy": round(random.gauss(0, 0.1), 4), "gz": round(random.gauss(0, 0.1), 4)}
    elif sensor_type == "joint_encoder":
        return {"position": round(random.uniform(-180, 180), 2), "velocity": round(random.gauss(0, 10), 2)}
    elif sensor_type == "temperature":
        return {"temperature": round(random.uniform(20, 40), 1)}
    else:
        return {"value": round(random.uniform(0, 100), 2)}


if __name__ == "__main__":
    asyncio.run(seed())
