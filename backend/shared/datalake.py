"""
utils/databricks_storage.py

Databricks workspace connection and configuration for BookAtlas.

Scope of this file:
    This module owns exactly one thing — authenticating to Databricks and
    exposing a ready-to-use client plus the configured Unity Catalog
    Volume path. It does NOT know about profile pictures, uploads, or any
    other file operation. That logic belongs in whichever util imports
    the connection from here (e.g. auth_service/utils/profile_pictures.py), so this
    file stays a single, reusable connection point no matter how many
    different things end up stored in Databricks later.

Auth (current: local dev):
    Uses a Personal Access Token (PAT) read from environment variables,
    scoped to `file.files` only. This is fine for local development but
    should NOT be used in production — PATs are long-lived, tied to a
    single human user, and don't rotate automatically. When this service
    is deployed, swap the client construction inside DatabricksConnection
    for a Service Principal + OAuth and nothing outside this file needs
    to change.

Required environment variables (see .env.example):
    DATABRICKS_HOST         e.g. https://dbc-xxxxxxx-xxxx.cloud.databricks.com
    DATABRICKS_TOKEN        the PAT generated in Databricks (scoped to file.files)
    DATABRICKS_VOLUME_PATH  e.g. /Volumes/bookatlas/storage/profile_pictures

    All three are checked immediately below, at import time. A missing
    or malformed value raises right here — before any other code in the
    app gets a chance to run — so a bad .env is caught the moment the
    service starts, not on the first file operation.

Usage (from another utils file, e.g. utils/profile_pictures.py):
    from utils.databricks_storage import databricks_connection

    databricks_connection.client.files.upload(...)
    databricks_connection.volume_path  # -> "/Volumes/bookatlas/storage/profile_pictures"
"""

import os

from databricks.sdk import WorkspaceClient
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Environment checks — run once, at import time.
# ---------------------------------------------------------------------------

DATABRICKS_HOST = os.getenv("DATABRICKS_HOST")
DATABRICKS_TOKEN = os.getenv("DATABRICKS_TOKEN")
DATABRICKS_VOLUME_PATH = os.getenv("DATABRICKS_VOLUME_PATH")

if not DATABRICKS_HOST:
    raise RuntimeError("Missing required environment variable 'DATABRICKS_HOST'. ")

if not DATABRICKS_TOKEN:
    raise RuntimeError("Missing required environment variable 'DATABRICKS_TOKEN'. ")

if not DATABRICKS_VOLUME_PATH:
    raise RuntimeError("Missing required environment variable 'DATABRICKS_VOLUME_PATH'. ")

DATABRICKS_HOST = DATABRICKS_HOST.rstrip("/")
DATABRICKS_VOLUME_PATH = DATABRICKS_VOLUME_PATH.rstrip("/")


class DatabricksConnection:
    """
    Holds Databricks connection config and lazily provides an
    authenticated WorkspaceClient.

    Config is read from the module-level constants above, which have
    already been validated by the time this class is used.
    """

    def __init__(self) -> None:
        self.host = DATABRICKS_HOST
        self.token = DATABRICKS_TOKEN
        self.volume_path = DATABRICKS_VOLUME_PATH
        self._client: WorkspaceClient | None = None

    @property
    def client(self) -> WorkspaceClient:
        """
        The authenticated WorkspaceClient, created on first access and
        cached for the lifetime of this connection instance.
        """
        if self._client is None:
            self._client = WorkspaceClient(host=self.host, token=self.token)
        return self._client


# Singleton connection, importable by any util that needs to talk to
# Databricks — e.g. utils/profile_pictures.py.
databricks_connection = DatabricksConnection()
