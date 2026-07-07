"""
schemas/__init__.py

Schema package for the BookAtlas Auth Service.

Contains all Pydantic models used for request validation and response
serialization across the auth routers (register.py, login.py, account.py).

    user.py - All User-related schemas:
        UserBase           - shared username/email fields
        UserRegister       - registration request (+ password validation)
        UserLogin          - login request
        UserAccount        - public user profile (safe to return to frontend)
        UserUpdate         - partial profile update request
        UserUpdatePassword - password change request
        AuthResponse       - shared response envelope for every auth route

Design notes:
    - No schema in this package ever exposes a hashed password or any other
      sensitive/internal field. UserAccount is the only schema returned to
      the frontend and it's built deliberately narrow.
    - Validation (password strength, username length, differing passwords,
      etc.) happens here at the schema layer so invalid requests are
      rejected before they ever reach services/auth_service.py.

TODO:
    - EmailVerificationRequest / EmailVerificationConfirm (pending email
      verification flow)
    - PasswordResetRequest / PasswordResetConfirm (pending forgot-password flow)
"""