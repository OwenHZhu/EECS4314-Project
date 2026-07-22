/**
 * validation.test.js
 *
 * Unit tests for all validators in validation.js.
 * Ensures email, password, and username validation rules correctly return
 * error arrays for invalid input and empty arrays for valid input.
 *
 * Dependencies:
 * - vitest: Test runner and assertion library.
 * - validateEmail / validatePassword / validateUsername: validation.js
 */
import { describe, test, expect } from "vitest";
import { validateEmail, validatePassword, validateUsername } from "../../utils/validation.js"

// Email validation tests
describe("validateEmail", () => {
    test("returns errors for empty string", () => {
        const errors = validateEmail("");
        expect(errors).toContain("Please enter your email.");
    });

    test("returns errors for missing local part", () => {
        const errors = validateEmail("@example.com");
        expect(errors).toContain("Please enter a valid email address.");
    });

    test("returns errors for missing domain", () => {
        const errors = validateEmail("user");
        expect(errors).toContain("Please enter a valid email address.");
    });

    test("returns errors for missing top-level domain", () => {
        const errors = validateEmail("user@example.");
        expect(errors).toContain("Please enter a valid email address.");
    });

    test("returns errors for adding whitespace", () => {
        const errors = validateEmail(" user@example.com");
        expect(errors).toContain("Please enter a valid email address.");
    });

    test("returns errors for adding spaces", () => {
        const errors = validateEmail("user @example.com");
        expect(errors).toContain("Please enter a valid email address.");
    });

    test("returns empty array for valid domain", () => {
        const errors = validateEmail("user@example.com");
        expect(errors).not.toContain("Please enter your email.");
        expect(errors).not.toContain("Please enter a valid email address.");
    });

    test("returns empty array for valid subdomain", () => {
        const errors = validateEmail("user@example.subdomain.com");
        expect(errors).not.toContain("Please enter your email.");
        expect(errors).not.toContain("Please enter a valid email address.");
    });
});

// Password validation tests
describe('validatePassword', () => {
    test('returns errors for empty string', () => {
        const errors = validatePassword("");
        expect(errors).toContain("Please enter your password.");
    });

    test('too short but contains all required characters', () => {
        const errors = validatePassword('Pass123!');
        expect(errors).toContain('Password must be at least 12 characters long.');
        expect(errors).not.toContain('Password needs an uppercase letter.');
        expect(errors).not.toContain('Password needs a lowercase letter.');
        expect(errors).not.toContain('Password needs a number.');
        expect(errors).not.toContain('Password needs a special character.');
    });

    test('correct length but missing uppercase', () => {
        const errors = validatePassword('password123!');
        expect(errors).toContain('Password needs an uppercase letter.');
        expect(errors).not.toContain('Password must be at least 12 characters long.');
    });

    test('correct length but missing lowercase', () => {
        const errors = validatePassword('PASSWORD123!');
        expect(errors).toContain('Password needs a lowercase letter.');
        expect(errors).not.toContain('Password must be at least 12 characters long.');
    });

    test('correct length but missing a number', () => {
        const errors = validatePassword('GOODPASSWORD!');
        expect(errors).toContain('Password needs a number.');
        expect(errors).not.toContain('Password must be at least 12 characters long.');
    });

    test('correct length but missing special character', () => {
        const errors = validatePassword('PASSWORD1234');
        expect(errors).toContain('Password needs a special character.');
        expect(errors).not.toContain('Password must be at least 12 characters long.');
    });

    test('valid password returns empty array', () => {
        const errors = validatePassword('Password123!');
        expect(errors).toEqual([]);
    });
});

// Username validation tests
describe('validateUsername', () => {
    test('returns errors for empty string', () => {
        const errors = validateUsername();
        expect(errors).toContain("Please enter your username.");
    });

    test('too short but valid characters', () => {
        const errors = validateUsername('abc');
        expect(errors).toContain('Username should be 5 to 12 characters long.');
        expect(errors).not.toContain('Username can only have letters, numbers, and _');
    });

    test('too short and invalid characters', () => {
        const errors = validateUsername('abc&');
        expect(errors).toContain('Username should be 5 to 12 characters long.');
        expect(errors).toContain('Username can only have letters, numbers, and _');
    });

    test('too long but valid characters', () => {
        const errors = validateUsername('abcdefghijklmnop');
        expect(errors).toContain('Username should be 5 to 12 characters long.');
        expect(errors).not.toContain('Username can only have letters, numbers, and _');
    });

    test('too long and invalid characters', () => {
        const errors = validateUsername('abcdefghijklmnop#*&$^*&^');
        expect(errors).toContain('Username should be 5 to 12 characters long.');
        expect(errors).toContain('Username can only have letters, numbers, and _');
    });

    test('invalid characters but correct length', () => {
        const errors = validateUsername('user!');
        expect(errors).toContain('Username can only have letters, numbers, and _');
    });

    test('valid username returns empty array', () => {
        const errors = validateUsername('user_1');
        expect(errors).toEqual([]);
    });
});