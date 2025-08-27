
from fastapi import APIRouter

router = APIRouter()

@router.get("/attendance_rate")
def attendance_rate(group: str = "day"):
    # TODO: interogări agregate (zi/săptămână/lună)
    return {"group": group, "rate": 0.0}
