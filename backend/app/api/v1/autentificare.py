from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, status

class LoginIn(BaseModel) :
    username: str
    password: str

   

    
class LoginOut(BaseModel):
    access_token: str
   



router=APIRouter()

@router.post("/login",response_model=LoginOut ,summary="auth", tags=["auth"])
def login(data: LoginIn):
    if not data.username or not data.password: 
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Credentiale invalide"
        )
    else:
        return LoginOut(access_token="dev-token")
        
