"""
AgentScope Agent: 数据标注 Agent
自动为传感器数据生成语义标注 (力触觉模式、运动原语等)
"""
from typing import Any
import json


class AutoAnnotationAgent:
    """使用 AgentScope 构建的自动标注 Agent"""

    def __init__(self):
        self.name = "AutoAnnotationAgent"
        self.description = "自动为传感器数据生成语义标注"

    def annotate(self, records: list[dict], sensor_type: str) -> list[dict]:
        """根据传感器类型自动标注"""
        annotators = {
            "force_torque": self._annotate_force,
            "tactile": self._annotate_tactile,
            "imu": self._annotate_imu,
            "joint_encoder": self._annotate_joint,
            "pressure": self._annotate_pressure,
            "camera": self._annotate_image_meta,
            "temperature": self._annotate_temperature,
            "proximity": self._annotate_proximity,
            "lidar": self._annotate_lidar,
            "emg": self._annotate_emg,
        }
        annotator = annotators.get(sensor_type, self._annotate_generic)
        return [annotator(r) for r in records]

    def _annotate_force(self, record: dict) -> dict:
        data = record.get("data_value", {})
        if isinstance(data, dict):
            fx = data.get("fx", 0) or 0
            fy = data.get("fy", 0) or 0
            fz = data.get("fz", 0) or 0
            force_mag = (fx**2 + fy**2 + fz**2) ** 0.5

            if force_mag > 50:
                label = "high_force"
            elif force_mag > 10:
                label = "moderate_contact"
            elif force_mag > 0.5:
                label = "light_contact"
            else:
                label = "free_space"

            record["annotation"] = {
                "annotation_type": "force_profile",
                "label": label,
                "value": {"force_magnitude": force_mag, "components": data},
                "confidence": 0.85,
            }
        return record

    def _annotate_tactile(self, record: dict) -> dict:
        data = record.get("data_value", {})
        if isinstance(data, dict):
            intensity = data.get("intensity", 0) or 0
            if isinstance(intensity, list):
                avg_intensity = sum(intensity) / len(intensity) if intensity else 0
            else:
                avg_intensity = intensity

            if avg_intensity > 0.8:
                label = "strong_touch"
            elif avg_intensity > 0.3:
                label = "gentle_touch"
            else:
                label = "no_contact"

            record["annotation"] = {
                "annotation_type": "label",
                "label": label,
                "value": {"avg_intensity": avg_intensity},
                "confidence": 0.8,
            }
        return record

    def _annotate_imu(self, record: dict) -> dict:
        data = record.get("data_value", {})
        if isinstance(data, dict):
            ax = data.get("ax", 0) or 0
            ay = data.get("ay", 0) or 0
            az = data.get("az", 0) or 0
            accel = (ax**2 + ay**2 + az**2) ** 0.5

            if accel > 15:
                label = "high_motion"
            elif accel > 3:
                label = "moderate_motion"
            else:
                label = "stationary"

            record["annotation"] = {
                "annotation_type": "label",
                "label": label,
                "value": {"acceleration_magnitude": accel},
                "confidence": 0.9,
            }
        return record

    def _annotate_joint(self, record: dict) -> dict:
        data = record.get("data_value", {})
        if isinstance(data, dict):
            velocity = data.get("velocity", 0) or 0
            if abs(velocity) > 1.0:
                label = "moving"
            else:
                label = "static"
            record["annotation"] = {
                "annotation_type": "action_primitive",
                "label": label,
                "value": data,
                "confidence": 0.85,
            }
        return record

    def _annotate_pressure(self, record: dict) -> dict:
        data = record.get("data_value", {})
        if isinstance(data, dict):
            pressure = data.get("pressure", 0) or 0
            if isinstance(pressure, list):
                max_p = max(pressure) if pressure else 0
            else:
                max_p = pressure
            if max_p > 1000:
                label = "high_pressure"
            elif max_p > 100:
                label = "moderate_pressure"
            else:
                label = "low_pressure"
            record["annotation"] = {
                "annotation_type": "label",
                "label": label,
                "value": {"max_pressure": max_p},
                "confidence": 0.8,
            }
        return record

    def _annotate_image_meta(self, record: dict) -> dict:
        record["annotation"] = {
            "annotation_type": "label",
            "label": "image_frame",
            "value": {},
            "confidence": 1.0,
        }
        return record

    def _annotate_generic(self, record: dict) -> dict:
        record["annotation"] = {
            "annotation_type": "label",
            "label": "unannotated",
            "value": record.get("data_value", {}),
            "confidence": 0.5,
        }
        return record

    def _annotate_temperature(self, record: dict) -> dict:
        data = record.get("data_value", {})
        if isinstance(data, dict):
            temp = data.get("temperature", 25) or 25
            if temp > 45:
                label = "overheating"
            elif temp > 35:
                label = "warm"
            elif temp < 10:
                label = "cold"
            else:
                label = "normal"
            record["annotation"] = {
                "annotation_type": "label",
                "label": label,
                "value": {"temperature": temp},
                "confidence": 0.9,
            }
        return record

    def _annotate_proximity(self, record: dict) -> dict:
        data = record.get("data_value", {})
        if isinstance(data, dict):
            distance = data.get("distance", 100) or 100
            if distance < 0.1:
                label = "collision_imminent"
            elif distance < 0.5:
                label = "near_obstacle"
            else:
                label = "clear_path"
            record["annotation"] = {
                "annotation_type": "label",
                "label": label,
                "value": {"distance": distance},
                "confidence": 0.85,
            }
        return record

    def _annotate_lidar(self, record: dict) -> dict:
        data = record.get("data_value", {})
        if isinstance(data, dict):
            points = data.get("point_count", 0) or 0
            min_dist = data.get("min_distance", 100) or 100
            if min_dist < 0.3:
                label = "close_obstacle"
            elif points > 1000:
                label = "dense_environment"
            else:
                label = "open_environment"
            record["annotation"] = {
                "annotation_type": "label",
                "label": label,
                "value": {"point_count": points, "min_distance": min_dist},
                "confidence": 0.8,
            }
        return record

    def _annotate_emg(self, record: dict) -> dict:
        data = record.get("data_value", {})
        if isinstance(data, dict):
            amplitude = data.get("amplitude", 0) or 0
            if amplitude > 0.8:
                label = "strong_muscle_activation"
            elif amplitude > 0.3:
                label = "moderate_activation"
            else:
                label = "rest_state"
            record["annotation"] = {
                "annotation_type": "label",
                "label": label,
                "value": {"amplitude": amplitude},
                "confidence": 0.75,
            }
        return record
