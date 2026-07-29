"""
auth_service/tests/test_schemas_user.py

Tests for schemas/user.py — Pydantic validation rules that run BEFORE
any request reaches the service layer.
"""

import pytest
from pydantic import ValidationError

from auth_service.schemas.user import (
    UserRegister,
    UserLogin,
    UserUpdate,
    UserUpdatePassword,
)


class TestUserRegisterSchema:
    def test_valid_registration_passes(self):
        user = UserRegister(
            username="bookworm1",
            email="reader@example.com",
            password="ValidPass123!",
        )
        assert user.username == "bookworm1"

    def test_username_too_short_raises(self):
        with pytest.raises(ValidationError):
            UserRegister(username="abc", email="x@example.com", password="ValidPass123!")

    def test_username_too_long_raises(self):
        with pytest.raises(ValidationError):
            UserRegister(username="a" * 13, email="x@example.com", password="ValidPass123!")

    def test_invalid_email_format_raises(self):
        with pytest.raises(ValidationError):
            UserRegister(username="bookworm1", email="not-an-email", password="ValidPass123!")

    def test_weak_password_raises(self):
        with pytest.raises(ValidationError, match="uppercase"):
            UserRegister(username="bookworm1", email="x@example.com", password="weakpass")


class TestUserLoginSchema:
    def test_valid_login_passes(self):
        login = UserLogin(email="reader@example.com", password="anything")
        assert login.email == "reader@example.com"

    def test_no_username_required(self):
        """Login intentionally doesn't extend UserBase — username should
        not be required or even accepted as a field."""
        login = UserLogin(email="reader@example.com", password="anything")
        assert not hasattr(login, "username")

    def test_invalid_email_raises(self):
        with pytest.raises(ValidationError):
            UserLogin(email="not-an-email", password="anything")


class TestUserUpdateSchema:
    def test_partial_update_with_only_bio(self):
        update = UserUpdate(bio="New bio")
        dumped = update.model_dump(exclude_unset=True)
        assert dumped == {"bio": "New bio"}

    def test_empty_update_is_allowed_at_schema_level(self):
        """The schema itself allows zero fields — services/auth.py's
        update_profile is responsible for rejecting an empty payload,
        not this schema."""
        update = UserUpdate()
        assert update.model_dump(exclude_unset=True) == {}

    def test_unexpected_field_is_rejected(self):
        """model_config = ConfigDict(extra='forbid') should reject fields
        that don't exist on the schema, e.g. someone trying to sneak
        `is_admin=True` into a profile update."""
        with pytest.raises(ValidationError):
            UserUpdate(is_admin=True)

    def test_bio_over_max_length_raises(self):
        with pytest.raises(ValidationError):
            UserUpdate(bio="x" * 151)


class TestUserUpdatePasswordSchema:
    def test_valid_password_change_passes(self):
        payload = UserUpdatePassword(
            current_password="OldPass123!456!789!",
            new_password="NewPass456!789!",
        )
        assert payload.new_password == "NewPass456!789!"

    def test_identical_passwords_raise(self):
        with pytest.raises(ValidationError, match="must differ"):
            UserUpdatePassword(current_password="SamePass123!", new_password="SamePass123!")

    def test_weak_new_password_raises(self):
        """new_password must satisfy the same strength rules as
        registration — a password change should never allow downgrading
        to a weaker password."""
        with pytest.raises(ValidationError):
            UserUpdatePassword(current_password="OldPass123!", new_password="weak")