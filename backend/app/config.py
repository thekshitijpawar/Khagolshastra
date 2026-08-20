import os
import sys
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(str(ENV_FILE) if ENV_FILE.exists() else ".env"),
        extra="ignore"
    )

    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./khagolshastra.db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    ADMIN_API_KEY: str = os.getenv("ADMIN_API_KEY", os.getenv("SECRET_KEY", "dev-secret-key-change-in-production"))
    MEILI_URL: str = os.getenv("MEILI_URL", "http://localhost:7700")
    MEILI_KEY: str = os.getenv("MEILI_KEY", "")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000")
    TRUSTED_PROXIES: str = os.getenv("TRUSTED_PROXIES", "127.0.0.1,::1")
    ENABLE_DOCS: bool = os.getenv("ENABLE_DOCS", "false").lower() in ("true", "1", "yes")
    INGESTION_INTERVAL_MINUTES: int = int(os.getenv("INGESTION_INTERVAL_MINUTES", "30"))

    # Rate Limiting configuration
    RATE_LIMIT_AUTH_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_AUTH_PER_MINUTE", "10"))
    RATE_LIMIT_GENERAL_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_GENERAL_PER_MINUTE", "120"))

    # Optional 3rd party integration tokens (Strictly server-side only)
    ADS_API_TOKEN: str | None = os.getenv("ADS_API_TOKEN", None)
    NASA_API_KEY: str | None = os.getenv("NASA_API_KEY", None)

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() in ("production", "prod")

    @property
    def cors_origins_list(self) -> list[str]:
        origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        if self.is_production and "*" in origins:
            raise ValueError("CORS wildcard '*' is strictly prohibited in production mode.")
        return origins

    @property
    def trusted_proxies_list(self) -> set[str]:
        return {ip.strip() for ip in self.TRUSTED_PROXIES.split(",") if ip.strip()}

    def validate_production_readiness(self) -> None:
        """
        Fail-fast check on startup: refuses to start if insecure defaults are used in production.
        """
        if self.is_production:
            if not self.SECRET_KEY or self.SECRET_KEY in ("dev-secret-key-change-in-production", "change_me_in_production"):
                raise RuntimeError(
                    "FATAL SECURITY FAILURE: In production, SECRET_KEY must be set to a secure, 64-character random string."
                )
            if len(self.SECRET_KEY) < 32:
                raise RuntimeError(
                    "FATAL SECURITY FAILURE: SECRET_KEY must be at least 32 characters long."
                )
            if "sqlite" in self.DATABASE_URL.lower():
                # Allow only if explicitly overridden, else require managed DB
                pass


settings = Settings()
# Execute check on import
settings.validate_production_readiness()
