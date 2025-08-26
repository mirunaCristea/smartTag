from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, status
from typing import List

class Student(BaseModel):
    id: int
    name: str 
    uid_hash: str | None = None
    group: str | None = None
    is_active: bool = True


class StudentCreate(BaseModel):
    name: str
    uid_hash: str | None = None
    group: str | None = None
    is_active: bool = True

class StudentUpdate(BaseModel):
    name: str | None = None
    uid_hash: str | None = None
    group: str | None = None
    is_active: bool | None = None




STUDENTS: list[Student] = []

router= APIRouter()

def find_student_index(student_id: int) -> int | None:
    for i,s in enumerate(STUDENTS):
        if s.id == student_id:
            return i
        
    return None

@router.get ("/", response_model=List[Student] ,summary="Listeaza toti studentii", tags=["studenti"])
def lista_studenti():
    return STUDENTS

@router.post ("/", response_model=Student,status_code=201,summary="Adauga student", tags=["studenti"])
def adauga_student( data: StudentCreate):
    new_id=len(STUDENTS)+1
    student = Student(id=new_id, **data.dict())  # **data.dict() → transformă obiectul Pydantic în dict și îl “desface” ca argumente.
    STUDENTS.append(student)
    return student

@router.get ("/{id}",response_model=Student, summary="Detalii student", tags=["studenti"])
def detalii_student(id: int):
    idx=find_student_index(id)
    if idx is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Student inexistent"
                           )
    return STUDENTS[idx]


@router.patch ("/{id}",response_model=Student, summary="Actualizeaza partial un student", tags=["studenti"])
def actualizare_student(id: int, data: StudentUpdate):
    idx = find_student_index(id)
    if idx is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Student inexistent"
                            )
    current=STUDENTS[idx]
    update_data=data.dict(exclude_unset=True)
    updated=current.copy(update=update_data)
    STUDENTS[idx]=updated
    return updated


@router.put("/{id}", response_model=Student, summary="Înlocuiește complet un student")
def inlocuieste_student(id: int, data: StudentCreate):
    idx = find_student_index(id)
    if idx is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student inexistent")

    new_obj = Student(id=id, **data.dict())
    STUDENTS[idx] = new_obj
    return new_obj




@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Șterge un student")
def sterge_student(id: int):
    idx = find_student_index(id)
    if idx is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student inexistent")

    STUDENTS.pop(idx)
    return None
