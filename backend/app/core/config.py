from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "InvestDash API"
    app_version: str = "1.0.0"
    cors_origins: str = "http://localhost:3000"
    cache_ttl_seconds: int = 60

    class Config:
        env_file = ".env"

def get_settings():
    return Settings()
