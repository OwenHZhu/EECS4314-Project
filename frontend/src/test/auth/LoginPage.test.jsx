/**
 * Frontend tests for the LoginPage component.
 *
 * These tests verify:
 * - The login form renders the required fields.
 * - Empty fields are rejected before authentication is attempted.
 * - Invalid email formats are rejected.
 * - Backend authentication errors are displayed to the user.
 * - Successful login attempts call the authentication function with the
 *   correct credentials and redirect the user to the profile page.
 *
 * Authentication and navigation dependencies are mocked so that these tests
 * focus only on LoginPage behaviour and do not require the backend to run.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../../pages/login/LoginPage.jsx"
import "@testing-library/jest-dom/vitest";

// Mock functions allow each test to verify authentication and navigation calls
// without using the real authentication service or React Router navigation.
const mockNavigate = vi.fn();
const mockLogin = vi.fn();
const mockSetRedirectMessage = vi.fn();

/**
 * Replaces React Router behaviour with predictable test doubles.
 *
 * The Link component is simplified to a normal anchor element, while
 * useNavigate returns a mock function that can be inspected by the tests.
 */
vi.mock("react-router-dom", () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => mockNavigate,
}));

/**
 * Replaces the real authentication context with controlled mock values.
 *
 * This isolates LoginPage from the backend and allows each test to define
 * whether the login attempt succeeds or fails.
 */
vi.mock("../../hooks/auth/useAuth.js", () => ({
  useAuth: () => ({
    login: mockLogin,
    redirectMessage: null,
    setRedirectMessage: mockSetRedirectMessage,
  }),
}));

describe("LoginPage", () => {
  /**
   * Clears call history and mock state before each test so that test results
   * are independent and cannot be affected by earlier tests.
   */
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that the login page displays the minimum required controls:
   * email input, password input, and login button.
   */
  it("renders email and password fields", () => {
    render(<LoginPage />);

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /login/i })
    ).toBeInTheDocument();
  });

  /**
   * Verifies client-side required-field validation.
   *
   * Submitting the form with no credentials should display validation errors
   * and should not call the authentication function.
   */
  it("shows errors when email and password are empty", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.click(
      screen.getByRole("button", { name: /login/i })
    );

    expect(
      screen.getByText("Please enter your email.")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Please enter your password.")
    ).toBeInTheDocument();

    expect(mockLogin).not.toHaveBeenCalled();
  });

  /**
   * Verifies email-format validation.
   *
   * An incorrectly formatted email address should be rejected before the
   * authentication function is called.
   */
  it("shows an error for invalid email format", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.type(
      screen.getByPlaceholderText(/email/i),
      "invalidemail"
    );

    await user.type(
      screen.getByPlaceholderText(/password/i),
      "Password123!"
    );

    await user.click(
      screen.getByRole("button", { name: /login/i })
    );

    expect(
      screen.getByText("Please enter a valid email address.")
    ).toBeInTheDocument();

    expect(mockLogin).not.toHaveBeenCalled();
  });

  /**
   * Verifies how the page handles an unsuccessful authentication response.
   *
   * The mocked authentication function returns a backend-style failure
   * response. The page should display the returned error message and should
   * not redirect the user.
   */
  it("shows backend error when login fails", async () => {
    const user = userEvent.setup();

    mockLogin.mockResolvedValue({
      success: false,
      message: "Invalid credentials",
    });

    render(<LoginPage />);

    await user.type(
      screen.getByPlaceholderText(/email/i),
      "testuser1@example.com"
    );

    await user.type(
      screen.getByPlaceholderText(/password/i),
      "WrongPassword123!"
    );

    await user.click(
      screen.getByRole("button", { name: /login/i })
    );

    expect(
      await screen.findByText("Invalid credentials")
    ).toBeInTheDocument();

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  /**
   * Verifies the successful login flow.
   *
   * The page should pass the entered credentials to the authentication
   * function and redirect the user to the profile page after success.
   */
  it("redirects to profile when login succeeds", async () => {
    const user = userEvent.setup();

    mockLogin.mockResolvedValue({
      success: true,
      message: "Logged in successfully",
    });

    render(<LoginPage />);

    await user.type(
      screen.getByPlaceholderText(/email/i),
      "testuser1@example.com"
    );

    await user.type(
      screen.getByPlaceholderText(/password/i),
      "Password123!"
    );

    await user.click(
      screen.getByRole("button", { name: /login/i })
    );

    expect(mockLogin).toHaveBeenCalledWith(
      "testuser1@example.com",
      "Password123!"
    );

    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });
});