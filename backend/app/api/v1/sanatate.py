from fastapi import APIRouter


router=APIRouter()

@router.get("/", summary="verificare sanatate")
def sanatate_check():
    return {"status": "backend healthy"}