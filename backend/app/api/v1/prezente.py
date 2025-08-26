from datetime import datetime
from pydantic import BaseModel
from typing import List
from fastapi import APIRouter, status, HTTPException, BackgroundTasks
from .live import manager
from app.realtime.sio_server import sio
from fastapi.encoders import jsonable_encoder


class Prezenta(BaseModel):
    id: int
    student_id: int
    timestamp: datetime
    status: str
    source: str

class PrezentaCreate(BaseModel):
    student_id: int
    status: str
    source: str



PREZENTE: list[Prezenta] = []


router = APIRouter()



@router.get("/",response_model=List[Prezenta], summary="Listeaza toate prezentele", tags=["prezente"])
def lista_prezente():
    return PREZENTE

@router.post("/",response_model=Prezenta, status_code=status.HTTP_201_CREATED,summary="Adauga o prezenta noua", tags=["prezente"])
async def adauga_prezenta(data: PrezentaCreate):
    new_id=len(PREZENTE)+1
    prezenta=Prezenta(id=new_id, timestamp=datetime.now(), **data.model_dump())
    PREZENTE.append(prezenta)

    payload = jsonable_encoder(prezenta)
    await sio.emit("prezenta_noua", payload)
    return prezenta


