# app/schemas/prezenta.py
from pydantic import BaseModel
from datetime import datetime

class PrezentaIn(BaseModel):
    uid_hash: str
    timestamp: datetime | None = None


class PrezentaOut(BaseModel):
    id: int
    student_id: int | None
    timestamp: datetime | None = None
    status: str
    class Config: from_attributes = True
