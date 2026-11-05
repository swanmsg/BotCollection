from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://botadmin:botsecret123@localhost:5432/botcollection"
    AGENTSCOPE_MODEL_TYPE: str = "openai"
    OPENAI_API_KEY: str = ""
    DATA_DIR: str = "/app/data"
    MAX_SENSOR_DATA_BATCH: int = 10000

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
