import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    GEMINI_API_KEY: Optional[str] = None
    GOOGLE_MAPS_API_KEY: Optional[str] = None
    DATABASE_URL: Optional[str] = None
    ENV: str = "development"
    HOST: str = "127.0.0.1"
    PORT: int = 8000

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def db_url(self) -> str:
        if self.DATABASE_URL and any(self.DATABASE_URL.startswith(p) for p in ["sqlite://", "postgresql://", "postgres://"]):
            return self.DATABASE_URL
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        db_path = os.path.join(backend_dir, "founder_ai.db").replace("\\", "/")
        return f"sqlite:///{db_path}"

settings = Settings()
