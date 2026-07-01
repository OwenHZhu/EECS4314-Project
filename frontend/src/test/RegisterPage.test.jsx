import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "../pages/RegisterPage";
import "@testing-library/jest-dom/vitest";

const mockNavigate = vi.fn();
const mockRegister = vi.fn();

vi.mock("react-router-dom", () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => mockNavigate,
}));

vi.mock("../context/auth/useAuth", () => ({
  useAuth: () => ({
    register: mockRegister,
  }),
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders username, email, and password fields", () => {
    render(<RegisterPage />);

    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("shows errors when all fields are empty", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(screen.getByText("Please enter your username.")).toBeInTheDocument();
    expect(screen.getByText("Please enter your email.")).toBeInTheDocument();
    expect(screen.getByText("Please enter your password.")).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("shows an error for invalid email", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(/username/i), "testuser1");
    await user.type(screen.getByPlaceholderText(/email/i), "invalidemail");
    await user.type(screen.getByPlaceholderText(/password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(screen.getByText("Invalid email.")).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("shows backend error when registration fails", async () => {
    const user = userEvent.setup();

    mockRegister.mockResolvedValue({
      success: false,
      message: "An account with this email already exists",
    });

    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(/username/i), "testuser1");
    await user.type(screen.getByPlaceholderText(/email/i), "testuser1@example.com");
    await user.type(screen.getByPlaceholderText(/password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(
      await screen.findByText("An account with this email already exists")
    ).toBeInTheDocument();

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("redirects to profile when registration succeeds", async () => {
    const user = userEvent.setup();

    mockRegister.mockResolvedValue({
      success: true,
      message: "Account created successfully",
    });

    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(/username/i), "testuser1");
    await user.type(screen.getByPlaceholderText(/email/i), "testuser1@example.com");
    await user.type(screen.getByPlaceholderText(/password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(mockRegister).toHaveBeenCalledWith(
      "testuser1",
      "testuser1@example.com",
      "Password123!"
    );

    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });
});