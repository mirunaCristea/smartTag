# APIRouter "agregator"

from fastapi import APIRouter

from .v1.sanatate import router as sanatate_router
from .v1.autentificare import router as autentificare_router
from .v1.studenti import router as studenti_router
from .v1.prezente import router as prezente_router
from .v1.live import router as live_router
from .v1.statistici import router as statistici_router

api_router = APIRouter()

api_router.include_router(sanatate_router, prefix="/sanatate", tags=["sanatate"])
api_router.include_router(autentificare_router,prefix="/autentificare", tags=["autentificare"])
api_router.include_router(studenti_router,prefix="/studenti", tags=["studenti"])
api_router.include_router(prezente_router,prefix="/prezente", tags=["prezente"])
api_router.include_router(statistici_router,prefix="/statistici", tags=["statistici"])

api_router.include_router(live_router,prefix="/live", tags=["live"])