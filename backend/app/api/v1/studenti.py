# app/api/v1/studenti.py
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_, func

from app.core.db import get_db
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentOut

# dacă n-ai încă, îți propun și asta în schemas:
# class StudentUpdate(BaseModel):
#     nume: str | None = None
#     email: EmailStr | None = None
#     uid_rfid_hash: str | None = None

from app.schemas.student import StudentCreate, StudentOut, StudentUpdate  # + StudentUpdate dacă îl adaugi

router = APIRouter()

@router.get("", response_model=list[StudentOut])
def list_students(
    q: str | None = Query(None, description="search by name/email/uid"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(Student)
    if q:
        like = f"%{q.lower()}%"
        query = query.filter(
            or_(
                func.lower(Student.nume).like(like),
                func.lower(Student.email).like(like),
                func.lower(Student.uid_hash).like(like),
            )
        )
    return query.order_by(Student.id.desc()).limit(limit).offset(offset).all()

@router.post("", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def create_student(body: StudentCreate, db: Session = Depends(get_db)):
    s = Student(**body.model_dump())
    db.add(s)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # probabil coliziune pe email sau uid_rfid_hash (ambele ar trebui să fie unique)
        raise HTTPException(status_code=409, detail="Student with same email or uid_rfid_hash already exists.")
    db.refresh(s)
    return s

@router.get("/{student_id}", response_model=StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db)):
    s = db.get(Student, student_id)
    if not s:
        raise HTTPException(status_code=404, detail="Student not found")
    return s

# (opțional) adaugă în schemas: StudentUpdate
# from app.schemas.student import StudentUpdate
@router.patch("/{student_id}", response_model=StudentOut)
def update_student(student_id: int, body: StudentUpdate, db: Session = Depends(get_db)):
    s = db.get(Student, student_id)
    if not s:
        raise HTTPException(404, "Student not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(s, k, v)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email or UID already taken.")
    db.refresh(s)
    return s

@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    s = db.get(Student, student_id)
    if not s:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(s)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
