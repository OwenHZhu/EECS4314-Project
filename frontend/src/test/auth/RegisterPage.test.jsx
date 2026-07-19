/**
 * Frontend tests for the RegisterPage component.
 *
 * These tests verify:
 * - The registration form renders the required fields.
 * - Required-field validation prevents empty submissions.
 * - Invalid usernames are rejected.
 * - Invalid email formats are rejected.
 * - Password requirements are enforced.
 * - Backend registration errors are displayed to the user.
 * - Successful registration calls the authentication function with the
 *   correct user information and redirects to the profile page.
 *
 * Authentication and navigation dependencies are mocked so that these tests
 * focus only on RegisterPage behaviour and do not require a running backend.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "../../pages/register/RegisterPage.jsx"
import "@testing-library/jest-dom/vitest";

// Mock functions allow tests to observe registration and navigation behaviour
// without calling the real backend authentication service.
const mockNavigate = vi.fn();
const mockRegister = vi.fn();

/**
 * Replaces React Router behaviour with controlled test doubles.
 *
 * The Link component is simplified to an anchor element, while useNavigate
 * returns a mock function that records navigation attempts.
 */
vi.mock("react-router-dom", () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => mockNavigate,
}));

/**
 * Replaces the real authentication context with a mocked register function.
 *
 * Individual tests control whether registration succeeds or fails, allowing
 * RegisterPage to be tested independently from the backend.
 */
vi.mock("../../hooks/auth/useAuth.js", () => ({
  useAuth: () => ({
    register: mockRegister,
  }),
}));

describe("RegisterPage", () => {
  /**
   * Resets all mock call history before each test to ensure that every test
   * runs independently.
   */
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies username validation.
   *
   * A username outside the permitted length range should display a validation
   * error and prevent the registration function from being called.
   */
  it("shows errors for invalid username format", async () => {
    const user = userEvent.setup();

    render(<RegisterPage />);

    await user.type(
      screen.getByPlaceholderText(/username/i),
      "abc"
    );

    await user.type(
      screen.getByPlaceholderText(/email/i),
      "testuser1@example.com"
    );

    await user.type(
      screen.getByPlaceholderText(/password/i),
      "Password123!"
    );

    await user.click(
      screen.getByRole("button", { name: /sign up/i })
    );

    expect(
      screen.getByText(
        "Username should be 5 to 12 characters long."
      )
    ).toBeInTheDocument();

    expect(mockRegister).not.toHaveBeenCalled();
  });

  /**
   * Verifies that all password rules are enforced.
   *
   * A weak password should display each applicable validation message and
   * prevent registration from being attempted.
   */
  it("shows errors for invalid password format", async () => {
    const user = userEvent.setup();

    render(<RegisterPage />);

    await user.type(
      screen.getByPlaceholderText(/username/i),
      "testuser1"
    );

    await user.type(
      screen.getByPlaceholderText(/email/i),
      "testuser1@example.com"
    );

    await user.type(
      screen.getByPlaceholderText(/password/i),
      "password"
    );

    await user.click(
      screen.getByRole("button", { name: /sign up/i })
    );

    expect(
      screen.getByText(
        "Password must be at least 12 characters long."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText("Password needs an uppercase letter.")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Password needs a number.")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Password needs a special character.")
    ).toBeInTheDocument();

    expect(mockRegister).not.toHaveBeenCalled();
  });

  /**
   * Verifies that all required registration controls are rendered:
   * username input, email input, password input, and sign-up button.
   */
  it("renders username, email, and password fields", () => {
    render(<RegisterPage />);

    expect(
      screen.getByPlaceholderText(/username/i)
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/email/i)
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/password/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  /**
   * Verifies required-field validation.
   *
   * Submitting an empty form should display validation messages for all three
   * required fields and should not call the registration function.
   */
  it("shows errors when all fields are empty", async () => {
    const user = userEvent.setup();

    render(<RegisterPage />);

    await user.click(
      screen.getByRole("button", { name: /sign up/i })
    );

    expect(
      screen.getByText("Please enter your username.")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Please enter your email.")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Please enter your password.")
    ).toBeInTheDocument();

    expect(mockRegister).not.toHaveBeenCalled();
  });

  /**
   * Verifies email-format validation.
   *
   * An invalid email address should display an error and prevent registration
   * from reaching the authentication function.
   */
  it("shows an error for invalid email", async () => {
    const user = userEvent.setup();

    render(<RegisterPage />);

    await user.type(
      screen.getByPlaceholderText(/username/i),
      "testuser1"
    );

    await user.type(
      screen.getByPlaceholderText(/email/i),
      "invalidemail"
    );

    await user.type(
      screen.getByPlaceholderText(/password/i),
      "Password123!"
    );

    await user.click(
      screen.getByRole("button", { name: /sign up/i })
    );

    expect(
      screen.getByText("Invalid email.")
    ).toBeInTheDocument();

    expect(mockRegister).not.toHaveBeenCalled();
  });

  /**
   * Verifies how the page handles a failed backend registration response.
   *
   * The mocked authentication function simulates an existing-account error.
   * The returned message should be displayed and the user should remain on the
   * registration page.
   */
  it("shows backend error when registration fails", async () => {
    const user = userEvent.setup();

    mockRegister.mockResolvedValue({
      success: false,
      message: "An account with this email already exists",
    });

    render(<RegisterPage />);

    await user.type(
      screen.getByPlaceholderText(/username/i),
      "testuser1"
    );

    await user.type(
      screen.getByPlaceholderText(/email/i),
      "testuser1@example.com"
    );

    await user.type(
      screen.getByPlaceholderText(/password/i),
      "Password123!"
    );

    await user.click(
      screen.getByRole("button", { name: /sign up/i })
    );

    expect(
      await screen.findByText(
        "An account with this email already exists"
      )
    ).toBeInTheDocument();

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  /**
   * Verifies the successful registration flow.
   *
   * The page should pass the entered username, email, and password to the
   * authentication function and redirect the user to the profile page.
   */
  it("redirects to profile when registration succeeds", async () => {
    const user = userEvent.setup();

    mockRegister.mockResolvedValue({
      success: true,
      message: "Account created successfully",
    });

    render(<RegisterPage />);

    await user.type(
      screen.getByPlaceholderText(/username/i),
      "testuser1"
    );

    await user.type(
      screen.getByPlaceholderText(/email/i),
      "testuser1@example.com"
    );

    await user.type(
      screen.getByPlaceholderText(/password/i),
      "Password123!"
    );

    await user.click(
      screen.getByRole("button", { name: /sign up/i })
    );

    expect(mockRegister).toHaveBeenCalledWith(
      "testuser1",
      "testuser1@example.com",
      "Password123!"
    );

    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });
});