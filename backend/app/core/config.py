from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "SmartTag API"
    API_PREFIX: str = "/api"
    API_V1: str = "/api/v1"
    DATABASE_URL: str = "sqlite:///data/smarttag.db"
    SIO_CORS: list[str] = ["*"]



settings = Settings()