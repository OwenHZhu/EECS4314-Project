/**
 * ./hooks/auth/useLoginForm.js
 *
 * Manages login form state, validation, submission, and navigation.
 *
 * Dependencies:
 * - useNavigate: Redirects to /profile after successful login.
 * - useAuth.login(): Performs backend authentication.
 * - validateEmail: Email format validation.
 *
 * Returns:
 * - Controlled fields: email, password
 * - UI state: errors, isLoading
 * - Setters: setEmail, setPassword
 * - handleSubmit(): Runs validation + login flow
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/validation";
import { useAuth } from "./useAuth";

export function useLoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Controlled form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * validateLogin()
   * Performs required-field checks and email format validation.
   *
   * @returns {string[]} Array of validation error messages.
   */
  function validateLogin() {
    const validationErrors = [];

    // Required fields
    if (!email.trim()) validationErrors.push("Please enter your email.");
    if (!password.trim()) validationErrors.push("Please enter your password.");

    // Email validation
    if (email) {
      const emailErrors = validateEmail(email);

      if (emailErrors.length > 0) {
        validationErrors.push(...emailErrors);
      }
    }

    return validationErrors;
  }


  /**
   * handleSubmit()
   * Runs validation, attempts login, and handles success/failure.
   *
   * @returns {Promise<void>}
   */
  async function handleSubmit() {
    const newErrors = validateLogin();

    // Validation failure
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Attempt login
    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);

    // Backend failure
    if (!res.success) {
      setErrors([res.message]);
      return;
    }

    // Successful login → navigate + clear state
    navigate("/profile");
    setEmail("");
    setPassword("");
    setErrors([]);
  }

  return {
    email,
    password,
    errors,
    isLoading,
    setEmail,
    setPassword,
    handleSubmit,
  };
}