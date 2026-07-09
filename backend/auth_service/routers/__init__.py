"""
routers/__init__.py

Router package for the BookAtlas Auth Service.

Each file in this package owns one authentication concern and exposes
a single `router` object that gets mounted onto the FastAPI app in
auth_service.py:

    register.py  - POST /auth/register              (public)
    login.py     - POST /auth/login                 (public)
    account.py   - POST /auth/logout, GET /auth/me   (protected, requires JWT)

All routers share the same response envelope:
    {
        "success": bool,
        "message": str,
        "token": str | None,   # only on register/login
        "data": UserAccount | None
    }
"""

