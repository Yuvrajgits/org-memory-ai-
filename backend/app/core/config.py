from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Organizational Memory AI"
    ENV: str = "development"

    # Security
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"  # Comma-separated origins
    ADMIN_SECRET_KEY: str = "change-me-in-production"  # Secret key for upload protection

    # OpenAI
    OPENAI_API_KEY: str

    # Embeddings / Vector DB
    EMBEDDING_DIMENSION: int = 1536
    FAISS_INDEX_PATH: str = "data/faiss_index"
    
    # LLM / RAG
    DEFAULT_LLM_MODEL: str = "gpt-4o-mini"
    MAX_CONTEXT_TOKENS: int = 3000
    LLM_TEMPERATURE: float = 0.2
    LLM_MAX_RETRIES: int = 3

    class Config:
        env_file = ".env"
        extra = "forbid"  # explicit (default in v2)
    
    @property
    def cors_origins(self) -> list[str]:
        """Parse comma-separated origins into a list"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()

APP_NAME = settings.APP_NAME
ENV = settings.ENV
ALLOWED_ORIGINS = settings.cors_origins
ADMIN_SECRET_KEY = settings.ADMIN_SECRET_KEY
OPENAI_API_KEY = settings.OPENAI_API_KEY
EMBEDDING_DIMENSION = settings.EMBEDDING_DIMENSION
FAISS_INDEX_PATH = settings.FAISS_INDEX_PATH

DEFAULT_LLM_MODEL = settings.DEFAULT_LLM_MODEL
MAX_CONTEXT_TOKENS = settings.MAX_CONTEXT_TOKENS
LLM_TEMPERATURE = settings.LLM_TEMPERATURE
LLM_MAX_RETRIES = settings.LLM_MAX_RETRIES