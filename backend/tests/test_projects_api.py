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


class FakeAdminUser:
    def __init__(self, user_id, email, user_metadata=None):
        self.id = user_id
        self.email = email
        self.user_metadata = user_metadata or {}


class FakeListUsersResponse:
    def __init__(self, users):
        self.users = users


class FakeAuthAdmin:
    def __init__(self, responses, raise_type_error=False):
        self._responses = list(responses)
        self._raise_type_error = raise_type_error
        self.calls = []

    def list_users(self, *args, **kwargs):
        self.calls.append(kwargs)
        if self._raise_type_error and kwargs:
            raise TypeError("list_users() got an unexpected keyword argument")

        response = self._responses.pop(0)
        if isinstance(response, Exception):
            raise response
        return response


class FakeSupabaseAdminAuthOnly:
    def __init__(self, admin):
        self.auth = type("Auth", (), {"admin": admin})()


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


def test_get_user_by_email_handles_paginated_admin_response(monkeypatch):
    first_page_users = [
        FakeAdminUser(f"user-{index}", f"user-{index}@example.com")
        for index in range(1000)
    ]
    admin = FakeAuthAdmin(
        responses=[
            FakeListUsersResponse(first_page_users),
            FakeListUsersResponse([FakeAdminUser("user-2", "Member@Example.com", {"full_name": "Member"})]),
        ]
    )

    monkeypatch.setattr(database, "supabase_admin", FakeSupabaseAdminAuthOnly(admin))

    result = asyncio.run(database.get_user_by_email(" member@example.com "))

    assert result == {
        "id": "user-2",
        "email": "Member@Example.com",
        "user_metadata": {"full_name": "Member"},
    }
    assert admin.calls == [
        {"page": 1, "per_page": 1000},
        {"page": 2, "per_page": 1000},
    ]


def test_get_user_by_email_falls_back_when_list_users_has_no_pagination(monkeypatch):
    admin = FakeAuthAdmin(
        responses=[[{"id": "user-9", "email": "invitee@example.com", "user_metadata": {"role": "member"}}]],
        raise_type_error=True,
    )

    monkeypatch.setattr(database, "supabase_admin", FakeSupabaseAdminAuthOnly(admin))

    result = asyncio.run(database.get_user_by_email("INVITEE@example.com"))

    assert result == {
        "id": "user-9",
        "email": "invitee@example.com",
        "user_metadata": {"role": "member"},
    }
    assert admin.calls == [
        {"page": 1, "per_page": 1000},
        {},
    ]
