import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../pages/LoginPage";
import "@testing-library/jest-dom/vitest";

const mockNavigate = vi.fn();
const mockLogin = vi.fn();
const mockSetRedirectMessage = vi.fn();

vi.mock("react-router-dom", () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => mockNavigate,
}));

vi.mock("../context/auth/useAuth", () => ({
  useAuth: () => ({
    login: mockLogin,
    redirectMessage: null,
    setRedirectMessage: mockSetRedirectMessage,
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email and password fields", () => {
    render(<LoginPage />);

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("shows errors when email and password are empty", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByText("Please enter your email.")).toBeInTheDocument();
    expect(screen.getByText("Please enter your password.")).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("shows an error for invalid email format", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText(/email/i), "invalidemail");
    await user.type(screen.getByPlaceholderText(/password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(
      screen.getByText("Please enter a valid email address.")
    ).toBeInTheDocument();

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("shows backend error when login fails", async () => {
    const user = userEvent.setup();

    mockLogin.mockResolvedValue({
      success: false,
      message: "Invalid credentials",
    });

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText(/email/i), "testuser1@example.com");
    await user.type(screen.getByPlaceholderText(/password/i), "WrongPassword123!");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("redirects to profile when login succeeds", async () => {
    const user = userEvent.setup();

    mockLogin.mockResolvedValue({
      success: true,
      message: "Logged in successfully",
    });

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText(/email/i), "testuser1@example.com");
    await user.type(screen.getByPlaceholderText(/password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(mockLogin).toHaveBeenCalledWith(
      "testuser1@example.com",
      "Password123!"
    );

    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });
});