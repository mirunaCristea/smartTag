from fastapi import FastAPI
from .api.router import api_router

def create_app() -> FastAPI:
    app = FastAPI(title="SmartTag API")

    # toate rutele stau sub /api

    app.include_router(api_router,prefix="/api")

    return app


