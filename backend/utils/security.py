"""
utils/security.py

Password hashing and verification utilities for BookAtlas authentication.

Uses bcrypt via the bcrypt library — industry standard for password hashing.
bcrypt is intentionally slow (work factor controlled by rounds) which makes
brute force attacks computationally expensive.

Why bcrypt:
    - Automatically salts each hash — same password always produces a different hash
    - Work factor (rounds=12) can be increased over time as hardware gets faster
    - Widely audited and battle-tested for production auth systems

Usage:
    from utils.security import hash_password, verify_password

    hashed = hash_password("MyPassword123!")       # on registration
    valid  = verify_password("MyPassword123!", hashed)  # on login
"""
import bcrypt

ROUNDS = 12

def hash_password(password: str) -> str:
    # generate salt + hash
    salt = bcrypt.gensalt(rounds=ROUNDS)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(
        password.encode("utf-8"),
        hashed.encode("utf-8")
    )