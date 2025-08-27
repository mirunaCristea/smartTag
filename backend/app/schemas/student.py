from pydantic import BaseModel, EmailStr

class StudentCreate(BaseModel):
    nume : str
    email : EmailStr | None = None
    uid_hash : str 

class StudentOut(BaseModel):
    id : int
    nume : str
    email : EmailStr | None = None
    uid_hash : str

    class Config: form_attributes = True 


class StudentUpdate(BaseModel):
    nume: str | None = None
    email: EmailStr | None = None
    uid_hash: str | None = None
    class Config:
        from_attributes = True