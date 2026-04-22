from pathlib import Path
import asyncio
import sys

import pytest

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.api.projects import _map_project_creation_error
from app.core import database


class FakeResponse:
    def __init__(self, data):
        self.data = data


class FakeInsertQuery:
    def __init__(self, responses):
        self._responses = responses

    def execute(self):
        response = self._responses.pop(0)
        if isinstance(response, Exception):
            raise response
        return response


class FakeProjectsTable:
    def __init__(self, responses, payloads):
        self._responses = responses
        self._payloads = payloads

    def insert(self, payload):
        self._payloads.append(payload)
        return FakeInsertQuery(self._responses)


class FakeSupabaseAdmin:
    def __init__(self, responses, payloads):
        self._responses = responses
        self._payloads = payloads

    def table(self, table_name):
        assert table_name == "projects"
        return FakeProjectsTable(self._responses, self._payloads)


def test_map_project_creation_error_for_duplicate_name():
    exception = Exception(
        'duplicate key value violates unique constraint "unique_project_name_per_user"'
    )

    http_error = _map_project_creation_error(exception)

    assert http_error.status_code == 409
    assert "already exists" in http_error.detail


def test_create_project_retries_without_created_by(monkeypatch):
    payloads = []
    responses = [
        Exception("Could not find the 'created_by' column of 'projects' in the schema cache"),
        FakeResponse(
            [
                {
                    "id": "project-123",
                    "user_id": "user-123",
                    "name": "Project Alpha",
                    "description": "Schema fallback test",
                    "created_at": "2026-04-22T10:00:00",
                    "updated_at": "2026-04-22T10:00:00",
                }
            ]
        ),
    ]

    monkeypatch.setattr(
        database,
        "supabase_admin",
        FakeSupabaseAdmin(responses=responses, payloads=payloads),
    )

    result = asyncio.run(
        database.create_project(
            user_id="user-123",
            project_name="Project Alpha",
            project_description="Schema fallback test",
        )
    )

    assert result["id"] == "project-123"
    assert len(payloads) == 2
    assert payloads[0]["created_by"] == "user-123"
    assert "created_by" not in payloads[1]
