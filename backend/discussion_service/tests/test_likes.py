import os
import sys
from pathlib import Path

import pytest

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

os.environ.setdefault("SUPABASE_URL", "http://localhost")
os.environ.setdefault("SUPABASE_KEY", "dummy")

from services import discussion_service


class FakeResponse:
    def __init__(self, data=None, count=None):
        self.data = data
        self.count = count


class FakeQuery:
    def __init__(self, table_name, response):
        self.table_name = table_name
        self.response = response
        self.calls = []

    def insert(self, payload):
        self.calls.append(("insert", payload))
        return self

    def delete(self):
        self.calls.append(("delete", None))
        return self

    def select(self, *args, **kwargs):
        self.calls.append(("select", args, kwargs))
        return self

    def eq(self, column, value):
        self.calls.append(("eq", column, value))
        return self

    def limit(self, value):
        self.calls.append(("limit", value))
        return self

    def execute(self):
        return self.response


class FakeSupabaseClient:
    def __init__(self):
        self.tables = {}

    def table(self, name):
        if name not in self.tables:
            self.tables[name] = FakeQuery(name, FakeResponse(data=[], count=0))
        return self.tables[name]


@pytest.fixture
def fake_supabase(monkeypatch):
    client = FakeSupabaseClient()
    monkeypatch.setattr(discussion_service, "supabase", client)
    return client


def test_like_thread_and_count(fake_supabase):
    result = discussion_service.like_thread(user_id="u1", thread_id="t1")

    assert result is True
    assert fake_supabase.table("thread_likes").calls[0][0] == "insert"

    fake_supabase.table("thread_likes").response = FakeResponse(data=[{"user_id": "u1"}], count=1)
    assert discussion_service.count_thread_likes(thread_id="t1") == 1


def test_toggle_thread_like_uses_unlike_when_already_liked(fake_supabase):
    fake_supabase.table("thread_likes").response = FakeResponse(data=[{"user_id": "u1"}], count=1)

    result = discussion_service.toggle_thread_like(user_id="u1", thread_id="t1")

    assert result is False
    assert ("delete", None) in fake_supabase.table("thread_likes").calls
