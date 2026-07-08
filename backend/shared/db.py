"""
database/db.py

Initializes and exports the Supabase client used across all services.

The client is created once at startup and shared throughout the app.
All database interactions (users, books, forums, etc.) go through this client.

Required environment variables (.env):
    SUPABASE_URL  - Supabase project URL
    SUPABASE_KEY  - Supabase service role key 

Usage:
    from database.db import supabase
    
    res = supabase.table("users").select("*").execute()
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)