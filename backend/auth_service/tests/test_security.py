"""
auth_service/tests/test_security.py

Tests for utils/security.py:
    - hash_password / verify_password round-trip correctness
    - validate_password_strength rule enforcement and edge cases
"""

import pytest

from auth_service.utils.security import (
    hash_password,
    verify_password,
    validate_password_strength,
)


class TestPasswordHashing:
    """hash_password and verify_password should round-trip correctly
    and never expose or compare plain text directly."""

    def test_hash_is_not_plain_text(self):
        plain = "SuperSecret123!"
        hashed = hash_password(plain)
        assert hashed != plain

    def test_verify_correct_password_succeeds(self):
        plain = "SuperSecret123!"
        hashed = hash_password(plain)
        assert verify_password(plain, hashed) is True

    def test_verify_incorrect_password_fails(self):
        hashed = hash_password("SuperSecret123!")
        assert verify_password("WrongPassword123!", hashed) is False

    def test_same_password_produces_different_hashes(self):
        """bcrypt salts each hash, so two hashes of the same password
        should never be identical — this guards against someone
        accidentally switching to an unsalted hash function."""
        plain = "SuperSecret123!"
        assert hash_password(plain) != hash_password(plain)


class TestPasswordStrengthValidation:
    """validate_password_strength enforces BookAtlas password rules and
    must raise ValueError with ALL failing rules listed together, not
    just the first one it finds."""

    def test_valid_password_passes(self):
        validate_password_strength("ValidPass123!")  # should not raise

    def test_too_short_raises(self):
        with pytest.raises(ValueError, match="at least"):
            validate_password_strength("Ab1!")

    def test_missing_uppercase_raises(self):
        with pytest.raises(ValueError, match="uppercase"):
            validate_password_strength("lowercase123!")

    def test_missing_lowercase_raises(self):
        with pytest.raises(ValueError, match="lowercase"):
            validate_password_strength("UPPERCASE123!")

    def test_missing_number_raises(self):
        with pytest.raises(ValueError, match="number"):
            validate_password_strength("NoNumbersHere!")

    def test_missing_special_char_raises(self):
        with pytest.raises(ValueError, match="special character"):
            validate_password_strength("NoSpecialChar123")

    def test_all_rules_broken_reports_all_of_them(self):
        """A password that fails every rule should list every failure,
        not just the first one encountered — this is what lets the
        frontend show all issues to the user at once."""
        with pytest.raises(ValueError) as exc_info:
            validate_password_strength("ab")  # too short, no upper, no digit, no special
        message = str(exc_info.value)
        assert "uppercase" in message
        assert "number" in message
        assert "special character" in message

    def test_empty_password_raises(self):
        with pytest.raises(ValueError):
            validate_password_strength("")