import sys
from pathlib import Path
from datetime import datetime, timezone

# Ensure discussion_service and its parent are on sys.path when running tests from project root
ROOT = Path(__file__).resolve().parents[2]
DISC_ROOT = Path(__file__).resolve().parents[1]
for p in (str(DISC_ROOT), str(ROOT)):
    if p not in sys.path:
        sys.path.insert(0, p)

from services import discussion_service as ds


class _ExecResult:
    def __init__(self, data=None, count=None):
        self.data = data
        self.count = count

    def execute(self):
        return self


class FakeTable:
    def __init__(self):
        self.insert_payload = None
        self.select_args = []

    def insert(self, payload):
        self.insert_payload = payload
        # simulate insert returning the created row with an id
        created = dict(payload)
        created["id"] = "fake-id"
        # include timestamps similar to database defaults
        now = datetime.now(timezone.utc).isoformat()
        created["created_at"] = now
        created["updated_at"] = now
        return _ExecResult(data=[created])

    def select(self, *args, **kwargs):
        self.select_args.append((args, kwargs))
        return _ExecResult(data=[])

    def delete(self):
        return _ExecResult(data=[{"id": "deleted-id"}])


class FakeSupabase:
    def __init__(self):
        self._tables = {}

    def table(self, name: str):
        t = FakeTable()
        self._tables[name] = t
        return t


def test_create_thread_inserts(monkeypatch):
    fake = FakeSupabase()
    monkeypatch.setattr(ds, "supabase", fake)

    thread = ds.create_thread(user_id="user-1", title="Hello", content="Body text", tag_ids=["t1", "t2"])

    assert thread.id == "fake-id"
    tbl = fake._tables[ds.DISCUSSION_THREADS_TABLE]
    assert tbl.insert_payload["user_id"] == "user-1"
    assert tbl.insert_payload["title"] == "Hello"

    # verify tag links inserted
    tag_tbl = fake._tables[ds.DISCUSSION_THREAD_TAGS_TABLE]
    assert isinstance(tag_tbl.insert_payload, list)
    assert tag_tbl.insert_payload[0]["thread_id"] == "fake-id"


def test_create_reply_inserts(monkeypatch):
    fake = FakeSupabase()
    monkeypatch.setattr(ds, "supabase", fake)

    reply = ds.create_reply(thread_id="thread-1", user_id="user-2", content="Nice post!")

    assert reply.id == "fake-id"
    tbl = fake._tables[ds.DISCUSSION_REPLIES_TABLE]
    assert tbl.insert_payload["thread_id"] == "thread-1"
    assert tbl.insert_payload["content"] == "Nice post!"
