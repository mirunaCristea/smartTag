# APIRouter "agregator"

from fastapi import APIRouter

from .v1.sanatate import router as sanatate_router

api_router = APIRouter()

api_router.include_router(sanatate_router, prefix="/sanatate")