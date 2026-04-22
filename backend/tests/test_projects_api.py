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


class FakeAnalysesTable:
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


class FakeSupabaseAdminAnalyses:
    def __init__(self, responses, payloads):
        self._responses = responses
        self._payloads = payloads

    def table(self, table_name):
        assert table_name == "analyses"
        return FakeAnalysesTable(self._responses, self._payloads)


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


class FakeFilterQuery:
    def __init__(self, rows, action="select", payload=None):
        self._rows = rows
        self._action = action
        self._payload = payload or {}
        self._filters = []

    def eq(self, key, value):
        self._filters.append((key, value))
        return self

    def execute(self):
        matches = [
            row for row in self._rows
            if all(row.get(key) == value for key, value in self._filters)
        ]

        if self._action == "update":
            for row in matches:
                row.update(self._payload)

        return FakeResponse(matches)


class FakeTeamInvitationsTable:
    def __init__(self, rows):
        self._rows = rows

    def select(self, _fields):
        return FakeFilterQuery(self._rows, action="select")

    def update(self, payload):
        return FakeFilterQuery(self._rows, action="update", payload=payload)


class FakeSupabaseAdminTablesOnly:
    def __init__(self, invitation_rows):
        self._invitation_rows = invitation_rows

    def table(self, table_name):
        assert table_name == "team_invitations"
        return FakeTeamInvitationsTable(self._invitation_rows)


class FakeProjectSharesTable:
    def __init__(self, rows):
        self._rows = rows

    def select(self, _fields):
        return FakeFilterQuery(self._rows, action="select")


class FakeSupabaseAdminProjectSharesOnly:
    def __init__(self, share_rows):
        self._share_rows = share_rows

    def table(self, table_name):
        assert table_name == "project_shares"
        return FakeProjectSharesTable(self._share_rows)


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


def test_accept_team_invitations_for_user_adds_member_and_marks_invite(monkeypatch):
    invitation_rows = [
        {
            "id": "invite-1",
            "team_id": "team-1",
            "email": "invitee@example.com",
            "role": "member",
            "status": "pending",
            "accepted_at": None,
            "accepted_user_id": None,
        }
    ]
    add_calls = []

    async def fake_get_team_members(_team_id):
        return []

    async def fake_add_team_member(team_id, user_id, role):
        add_calls.append((team_id, user_id, role))
        return {"team_id": team_id, "user_id": user_id, "role": role}

    monkeypatch.setattr(database, "supabase_admin", FakeSupabaseAdminTablesOnly(invitation_rows))
    monkeypatch.setattr(database, "get_team_members", fake_get_team_members)
    monkeypatch.setattr(database, "add_team_member", fake_add_team_member)

    accepted_count = asyncio.run(
        database.accept_team_invitations_for_user("user-42", "INVITEE@example.com")
    )

    assert accepted_count == 1
    assert add_calls == [("team-1", "user-42", "member")]
    assert invitation_rows[0]["status"] == "accepted"
    assert invitation_rows[0]["accepted_user_id"] == "user-42"


def test_save_analysis_to_db_includes_team_id(monkeypatch):
    payloads = []
    responses = [FakeResponse([{"id": "analysis-1"}])]

    monkeypatch.setattr(
        database,
        "supabase_admin",
        FakeSupabaseAdminAnalyses(responses=responses, payloads=payloads),
    )

    asyncio.run(
        database.save_analysis_to_db(
            user_id="user-1",
            analysis_id="analysis-1",
            design_name="Team Run",
            filename="team-run.png",
            file_path="uploads/team-run.png",
            results={
                "arai_score": 91,
                "overall_grade": "A",
                "accessibility": {"score": 92},
                "readability": {"score": 90},
                "attention": {"score": 91},
            },
            team_id="team-123",
        )
    )

    assert len(payloads) == 1
    assert payloads[0]["team_id"] == "team-123"


def test_infer_team_id_from_project_returns_only_shared_team(monkeypatch):
    monkeypatch.setattr(
        database,
        "supabase_admin",
        FakeSupabaseAdminProjectSharesOnly(
            [
                {"project_id": "project-1", "team_id": "team-1"},
                {"project_id": "project-1", "team_id": "team-1"},
                {"project_id": "project-2", "team_id": "team-9"},
            ]
        ),
    )

    inferred_team_id = asyncio.run(database.infer_team_id_from_project("project-1"))

    assert inferred_team_id == "team-1"


def test_infer_team_id_from_project_returns_none_for_multi_team_share(monkeypatch):
    monkeypatch.setattr(
        database,
        "supabase_admin",
        FakeSupabaseAdminProjectSharesOnly(
            [
                {"project_id": "project-1", "team_id": "team-1"},
                {"project_id": "project-1", "team_id": "team-2"},
            ]
        ),
    )

    inferred_team_id = asyncio.run(database.infer_team_id_from_project("project-1"))

    assert inferred_team_id is None
