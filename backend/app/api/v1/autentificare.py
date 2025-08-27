from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import LoginIn, TokenOut



router=APIRouter()

@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn):
    # TODO: verifică user/parola, întoarce JWT
    return TokenOut(access_token="demo-token")
