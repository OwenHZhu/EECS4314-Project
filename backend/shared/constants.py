"""
utils/constants.py

Shared constants used across the BookAtlas backend.

Add any magic numbers, configuration values, or shared strings here
rather than hardcoding them in individual files.
"""

# Minimum password length enforced by UserRegister validator in schemas/user.py
MIN_PASSWORD_LENGTH = 12

# Allowed origins for CORS — controls which frontend URLs can talk to the API
# TODO: Add your deployed frontend URL here before pushing to production
ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",  # React + Vite dev server
]