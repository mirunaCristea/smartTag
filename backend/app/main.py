# app/asgi.py
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.db import Base, engine
from app.api.router import api_router
from app.realtime.sio_server import sio
from socketio import ASGIApp

def create_app() -> FastAPI:
    Base.metadata.create_all(bind=engine)
    app = FastAPI(title=settings.APP_NAME)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.SIO_CORS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router, prefix=settings.API_V1)
    return app


# pornești cu: uvicorn app.asgi:app --host 0.0.0.0 --port 5000
