from fastapi import APIRouter, HTTPException
from schemas.user import UserRegister, UserLogin, UserAccount
from services.auth_service import register_user, login_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserAccount)
def register(user: UserRegister):
    result = register_user(user)

    if not result["success"]:
        raise HTTPException(status_code=409, detail=result["message"])

    return result

@router.post("/login", response_model=UserAccount)
def login(user: UserLogin):
    result = login_user(user)
    if not result["success"]:
        raise HTTPException(status_code=401, detail=result["message"])

    return result