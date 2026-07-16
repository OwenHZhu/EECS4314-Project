"""
auth_service/tests/__init__.py

Test package for the BookAtlas Auth Service.

Layout:
    conftest.py              - shared pytest fixtures (mock Supabase client, sample data)
    test_security.py          - utils/security.py (hashing, password strength rules)
    test_schemas_user.py      - schemas/user.py (Pydantic validation)
    test_register_user.py     - services/auth.py -> register_user
    test_login_user.py        - services/auth.py -> login_user
    test_logout_user.py       - services/auth.py -> logout_user
    test_get_me.py             - services/auth.py -> get_me
    test_update_profile.py     - services/auth.py -> update_profile
    test_update_password.py    - services/auth.py -> update_password
    test_delete_account.py     - services/auth.py -> delete_account

Run all tests (from backend/):
    pytest auth_service/tests -v

Run a single file:
    pytest auth_service/tests/test_register_user.py -v
"""