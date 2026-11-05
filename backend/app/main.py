from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routes import robots, sensors, data, datasets, tasks, dashboard

settings = get_settings()

app = FastAPI(
    title="BotCollection API",
    description="具身智能传感器数据集采集系统 - AgentScope Backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(robots.router)
app.include_router(sensors.router)
app.include_router(data.router)
app.include_router(datasets.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "BotCollection", "version": "1.0.0"}
