import sys
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[2]  # .../backend
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from discussion_service.services import discussion_service as ds
from discussion_service.schemas.discussion_forum import ThreadCreate, ReplyCreate


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
        self._select_result = []  # what execute() returns for select chains

    def insert(self, payload):
        self.insert_payload = payload
        created = dict(payload)
        created["id"] = "fake-id"
        now = datetime.now(timezone.utc).isoformat()
        created["created_at"] = now
        created["updated_at"] = now
        self._select_result = [created]
        return _ExecResult(data=[created])

    def select(self, *args, **kwargs):
        self.select_args.append((args, kwargs))
        return self  # chainable now, not a terminal result

    def eq(self, *args, **kwargs):
        return self

    def limit(self, *args, **kwargs):
        return self

    def order(self, *args, **kwargs):
        return self

    def execute(self):
        # terminal call after a select chain
        return _ExecResult(data=self._select_result)

    def delete(self):
        return _ExecResult(data=[{"id": "deleted-id"}])

class FakeSupabase:
    def __init__(self):
        self._tables = {}

    def table(self, name: str):
        # reuse the same fake table object across calls for a given name
        if name not in self._tables:
            self._tables[name] = FakeTable()
        return self._tables[name]


def test_create_thread_inserts(monkeypatch):
    fake = FakeSupabase()
    monkeypatch.setattr(ds, "supabase", fake)
    monkeypatch.setattr(ds, "publish_analytics_event", lambda *a, **k: None)

    thread_in = ThreadCreate(
        title="Hello",
        content="Body text",
        has_spoilers=False,
        tags=["t1", "t2"],
    )

    result = ds.create_thread(user_id="user-1", thread=thread_in)

    assert result["success"] is True
    assert result["data"].id == "fake-id"

    tbl = fake._tables[ds.DISCUSSION_THREADS_TABLE]
    assert tbl.insert_payload["user_id"] == "user-1"
    assert tbl.insert_payload["title"] == "Hello"

    # tag rows get created (t1/t2 didn't exist -> insert into tags table)
    tags_tbl = fake._tables[ds.DISCUSSION_TAGS_TABLE]
    assert tags_tbl.insert_payload["name"] in ("t1", "t2")

    # verify tag links inserted
    tag_link_tbl = fake._tables[ds.DISCUSSION_THREAD_TAGS_TABLE]
    assert isinstance(tag_link_tbl.insert_payload, list)
    assert tag_link_tbl.insert_payload[0]["thread_id"] == "fake-id"


def test_create_reply_inserts(monkeypatch):
    fake = FakeSupabase()
    monkeypatch.setattr(ds, "supabase", fake)
    monkeypatch.setattr(ds, "publish_analytics_event", lambda *a, **k: None)

    reply_in = ReplyCreate(content="Nice post!")

    result = ds.create_reply(thread_id="thread-1", user_id="user-2", reply=reply_in)

    assert result["success"] is True
    assert result["data"].id == "fake-id"

    tbl = fake._tables[ds.DISCUSSION_REPLIES_TABLE]
    assert tbl.insert_payload["thread_id"] == "thread-1"
    assert tbl.insert_payload["content"] == "Nice post!"