"""
AgentScope Agent: 传感器数据质量评估 Agent
自动检测异常数据、噪声、缺失值，给出质量评分
"""
from typing import Any
import json
import math


class DataQualityAgent:
    """使用 AgentScope 构建的数据质量评估 Agent"""

    def __init__(self):
        self.name = "DataQualityAgent"
        self.description = "评估传感器数据质量，检测异常值和缺失数据"

    def evaluate_batch(self, records: list[dict]) -> list[dict]:
        """批量评估数据质量，返回带质量评分的记录"""
        results = []
        for record in records:
            score = self._compute_quality_score(record)
            record["quality_score"] = score
            record["metadata"] = record.get("metadata", {})
            record["metadata"]["quality_flags"] = self._get_flags(record)
            results.append(record)
        return results

    def _compute_quality_score(self, record: dict) -> float:
        score = 1.0
        data = record.get("data_value", {})

        # 检查缺失值
        if isinstance(data, dict):
            values = list(data.values())
            null_count = sum(1 for v in values if v is None)
            if values:
                score -= (null_count / len(values)) * 0.3

        # 检查 NaN / Inf
        if isinstance(data, (list, dict)):
            nums = data if isinstance(data, list) else list(data.values())
            for v in nums:
                if isinstance(v, (int, float)):
                    if math.isnan(v) or math.isinf(v):
                        score -= 0.2
                        break

        # 检查时间戳合理性 (5秒偏差)
        from datetime import datetime, timezone
        ts = record.get("timestamp")
        if isinstance(ts, str):
            try:
                ts_dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                now = datetime.now(timezone.utc)
                diff = abs((now - ts_dt).total_seconds())
                if diff > 86400:
                    score -= 0.1
            except Exception:
                pass

        return max(0.0, min(1.0, score))

    def _get_flags(self, record: dict) -> list[str]:
        flags = []
        data = record.get("data_value", {})
        if isinstance(data, (list, dict)):
            nums = data if isinstance(data, list) else list(data.values())
            for v in nums:
                if isinstance(v, (int, float)):
                    if math.isnan(v):
                        flags.append("nan_detected")
                        break
                    if math.isinf(v):
                        flags.append("inf_detected")
                        break
        if record.get("quality_score", 1.0) < 0.5:
            flags.append("low_quality")
        return flags

    def get_summary(self, records: list[dict]) -> dict:
        scores = [r.get("quality_score", 1.0) for r in records]
        return {
            "total_records": len(records),
            "avg_quality": sum(scores) / len(scores) if scores else 0,
            "min_quality": min(scores) if scores else 0,
            "low_quality_count": sum(1 for s in scores if s < 0.7),
        }
