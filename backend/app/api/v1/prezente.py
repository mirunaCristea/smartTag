from fastapi import APIRouter, Depends, Query, HTTPException, status, Header
from sqlalchemy.orm import Session
from sqlalchemy import func
from starlette.concurrency import run_in_threadpool

from app.core.db import get_db
from app.models.student import Student
from app.models.prezenta import Prezenta  # sau .acces_event dacă așa e fișierul tău
from app.schemas.prezenta import PrezentaIn, PrezentaOut
from app.realtime.sio_server import sio

router = APIRouter()

# # (opțional) dacă vrei să validezi dispozitivul cu o cheie
# async def require_device_key(x_device_key: str | None = Header(None), db: Session = Depends(get_db)):
#     # TODO: caută reader după device_key; dacă vrei deocamdată liber, returnează None
#     return None

@router.post("", response_model=PrezentaOut, status_code=status.HTTP_201_CREATED)
async def create_prezenta(
    body: PrezentaIn,
    db: Session = Depends(get_db),
    # _reader = Depends(require_device_key),   # scoate dacă nu folosești încă
):
    def _save():
        student = db.query(Student).filter(Student.uid_hash == body.uid_hash).first()

        # simplu: duplicate dacă același uid apare în <5s (exemplu)
        duplicate = db.query(Prezenta).filter(
            Prezenta.uid_hash == body.uid_hash,
            func.julianday(func.datetime("now")) - func.julianday(Prezenta.timestamp) < (5/86400.0)
        ).first()

        status_val = "accepted" if student else "unknown_card"
        if duplicate:
            status_val = "duplicate"

        ev = Prezenta(
            student_id = student.id if student else None,
            timestamp = body.timestamp or None,  # dacă None, default din model
            uid_hash = body.uid_hash,
            status = status_val,
           
        )
        db.add(ev); db.commit(); db.refresh(ev)
        return ev

    ev = await run_in_threadpool(_save)

    # WS push (frontend ascultă "prezenta_new")
    await sio.emit("prezenta_noua", {
        "id": ev.id,
        "student_id": ev.student_id,
        "timestamp": ev.timestamp.isoformat(),
        "uid_hash": ev.uid_hash,
        "status": ev.status,
    })

    return ev

@router.get("", response_model=list[PrezentaOut])
def list_prezente(limit: int = Query(50, ge=1, le=200), db: Session = Depends(get_db)):
    return db.query(Prezenta).order_by(Prezenta.timestamp.desc()).limit(limit).all()

@router.get("/unknown", response_model=list[PrezentaOut])
def list_unknown(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Prezenta)\
        .filter(Prezenta.status == "unknown_card")\
        .order_by(Prezenta.timestamp.desc())\
        .limit(limit).all()
