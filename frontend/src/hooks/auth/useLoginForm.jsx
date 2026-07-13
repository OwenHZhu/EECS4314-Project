import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/validation";
import { useAuth } from "./useAuth";

export function useLoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  function validateLogin() {
    const validationErrors = [];

    if (!email.trim()) validationErrors.push("Please enter your email.");
    if (!password.trim()) validationErrors.push("Please enter your password.");
    if (email && !validateEmail(email)) {
      validationErrors.push("Please enter a valid email address.");
    }

    return validationErrors;
  }

  async function handleSubmit() {
    const newErrors = validateLogin();

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);

    if (!res.success) {
      setErrors([res.message]);
      return;
    }

    // Successful login
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