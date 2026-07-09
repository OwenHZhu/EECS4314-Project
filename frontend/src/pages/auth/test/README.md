# Frontend Authentication Tests

## Overview

This folder contains the frontend automated tests for the BookAtlas authentication pages.

The tests verify the behaviour of the Login and Registration pages independently from the real backend authentication service. Authentication functions and navigation behaviour are mocked where necessary so that the frontend components can be tested in isolation.

The test suite covers:

- Login form rendering
- Login form validation
- Successful login behaviour
- Failed login behaviour
- Registration form rendering
- Registration form validation
- Successful registration behaviour
- Failed registration behaviour
- Navigation behaviour after successful authentication

---

## Test Files

### `LoginPage.test.jsx`

Tests the behaviour of the Login page.

The test cases verify that:

- The login form renders correctly.
- The user can enter an email and password.
- Invalid input is handled correctly.
- The login function is called with the expected credentials.
- Successful login attempts navigate the user to the expected page.
- Failed login attempts display the appropriate error behaviour.
- Authentication and navigation dependencies are mocked so the page can be tested without a running backend.

### `RegisterPage.test.jsx`

Tests the behaviour of the Registration page.

The test cases verify that:

- The registration form renders correctly.
- The user can enter registration information.
- Email, password, and username validation is handled correctly.
- The register function is called with the expected user information.
- Successful registration attempts navigate the user to the expected page.
- Failed registration attempts display the appropriate error behaviour.
- Authentication and navigation dependencies are mocked so the component can be tested independently from the backend.

---

## Testing Approach

The authentication page tests focus on frontend component behaviour.

The tests follow this general pattern:

1. Render the component in a controlled test environment.
2. Mock external dependencies such as the authentication context and React Router navigation.
3. Simulate user interactions such as typing into form fields and submitting the form.
4. Verify that the correct authentication function is called.
5. Verify the expected UI or navigation behaviour.

This approach allows the frontend authentication flow to be tested without requiring the FastAPI backend or database to be running.

---

## Mocking

The tests use mocks for external dependencies that are outside the responsibility of the page component being tested.

Examples include:

- Authentication context functions such as `login` and `register`
- React Router navigation
- Backend-dependent authentication behaviour

Mocking these dependencies keeps the tests focused on the frontend page logic and makes the tests faster and more reliable.

---

## Running the Tests

Navigate to the frontend directory:

```bash
cd frontend