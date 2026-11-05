"""
AgentScope Agent: 数据预处理流水线 Agent
执行数据清洗、归一化、插值、降采样等操作
"""
from typing import Any
import json
import math


class DataPreprocessingAgent:
    """使用 AgentScope 构建的数据预处理 Agent"""

    def __init__(self):
        self.name = "DataPreprocessingAgent"
        self.description = "执行传感器数据预处理: 清洗、归一化、插值、降采样"
        self._fitted_stats = {}

    def process(self, records: list[dict], steps: list[dict]) -> list[dict]:
        """按步骤序列处理数据"""
        result = list(records)
        for step in steps:
            op = step.get("operation")
            params = step.get("params", {})
            if op == "remove_outliers":
                result = self._remove_outliers(result, **params)
            elif op == "normalize":
                result = self._normalize(result, **params)
            elif op == "smooth":
                result = self._smooth(result, **params)
            elif op == "resample":
                result = self._resample(result, **params)
            elif op == "fill_missing":
                result = self._fill_missing(result, **params)
            elif op == "denoise":
                result = self._denoise(result, **params)
        return result

    def _remove_outliers(self, records: list[dict], threshold: float = 3.0, **kw) -> list[dict]:
        """基于 Z-score 去除异常值"""
        values = []
        for r in records:
            data = r.get("data_value", {})
            if isinstance(data, dict):
                for v in data.values():
                    if isinstance(v, (int, float)):
                        values.append(v)

        if not values:
            return records

        mean = sum(values) / len(values)
        std = (sum((v - mean) ** 2 for v in values) / len(values)) ** 0.5 or 1

        filtered = []
        for r in records:
            data = r.get("data_value", {})
            if isinstance(data, dict):
                all_ok = True
                for v in data.values():
                    if isinstance(v, (int, float)):
                        if abs(v - mean) / std > threshold:
                            all_ok = False
                            break
                if all_ok:
                    filtered.append(r)
            else:
                filtered.append(r)
        return filtered

    def _normalize(self, records: list[dict], method: str = "min_max", **kw) -> list[dict]:
        """归一化: min_max 或 z_score"""
        all_values = []
        for r in records:
            data = r.get("data_value", {})
            if isinstance(data, dict):
                for v in data.values():
                    if isinstance(v, (int, float)):
                        all_values.append(v)

        if not all_values:
            return records

        if method == "min_max":
            min_v, max_v = min(all_values), max(all_values)
            rng = max_v - min_v or 1
            for r in records:
                data = r.get("data_value", {})
                if isinstance(data, dict):
                    r["data_value"] = {
                        k: (v - min_v) / rng if isinstance(v, (int, float)) else v
                        for k, v in data.items()
                    }
        elif method == "z_score":
            mean = sum(all_values) / len(all_values)
            std = (sum((v - mean) ** 2 for v in all_values) / len(all_values)) ** 0.5 or 1
            for r in records:
                data = r.get("data_value", {})
                if isinstance(data, dict):
                    r["data_value"] = {
                        k: (v - mean) / std if isinstance(v, (int, float)) else v
                        for k, v in data.items()
                    }
        return records

    def _smooth(self, records: list[dict], window: int = 5, **kw) -> list[dict]:
        """滑动窗口平滑"""
        if len(records) < window:
            return records

        smoothed = list(records)
        for i in range(window // 2, len(records) - window // 2):
            window_data = records[i - window // 2: i + window // 2 + 1]
            avg_data = {}
            for key in window_data[0].get("data_value", {}):
                vals = [r["data_value"].get(key, 0) for r in window_data if isinstance(r.get("data_value"), dict)]
                nums = [v for v in vals if isinstance(v, (int, float))]
                avg_data[key] = sum(nums) / len(nums) if nums else 0
            smoothed[i]["data_value"] = avg_data
        return smoothed

    def _resample(self, records: list[dict], factor: int = 2, **kw) -> list[dict]:
        """降采样"""
        return records[::factor]

    def _fill_missing(self, records: list[dict], method: str = "linear", **kw) -> list[dict]:
        """填充缺失值"""
        for r in records:
            data = r.get("data_value", {})
            if isinstance(data, dict):
                r["data_value"] = {
                    k: v if v is not None else 0
                    for k, v in data.items()
                }
        return records

    def _denoise(self, records: list[dict], strength: float = 0.5, **kw) -> list[dict]:
        """简单降噪: 移动平均"""
        return self._smooth(records, window=max(3, int(strength * 10)))
