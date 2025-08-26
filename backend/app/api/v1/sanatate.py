from fastapi import APIRouter


router=APIRouter()

@router.get("/", summary="verificare sanatate", tags=["sanatate"])
def sanatate_check():
    return {"status": "backend healthy"}