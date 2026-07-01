# Login Test Cases

## Feature

User login for BookAtlas.

## Backend Endpoint

POST `/api/v1/auth/login`

## Request Body

```json
{
  "email": "testuser1@example.com",
  "password": "Password123!"
}
```

## Automated Test Results

### Backend Tests

Command used:

```powershell
python -m pytest ..\tests\auth\backend -v
```

Result:

```text
10 passed, 1 warning
```

### Frontend Tests

Command used:

```powershell
npm test
```

Result:

```text
2 test files passed
10 frontend tests passed
```

## Test Cases

| ID        | Test Scenario                   | Test Type                                | Steps                                                  | Expected Result                                                                                     |
| --------- | ------------------------------- | ---------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| LOGIN-001 | Valid login                     | Backend API / Frontend                   | Submit registered email and correct password.          | Login succeeds, JWT token is returned, user data is returned, and user is redirected to `/profile`. |
| LOGIN-002 | Empty email                     | Frontend validation                      | Leave email empty and submit login form.               | Error appears: `Please enter your email.`                                                           |
| LOGIN-003 | Empty password                  | Frontend validation                      | Leave password empty and submit login form.            | Error appears: `Please enter your password.`                                                        |
| LOGIN-004 | Both fields empty               | Frontend validation / Backend validation | Submit empty login form or empty backend request.      | Validation errors are returned for required fields.                                                 |
| LOGIN-005 | Invalid email format            | Frontend validation                      | Enter invalid email such as `invalidemail` and submit. | Error appears: `Please enter a valid email address.`                                                |
| LOGIN-006 | Wrong password                  | Backend API                              | Enter registered email with incorrect password.        | Backend returns `401` with message: `Invalid credentials`.                                          |
| LOGIN-007 | Non-existing email              | Backend API                              | Enter an email that does not exist.                    | Backend returns `401` with message: `Invalid credentials`.                                          |
| LOGIN-008 | Successful response shape       | Backend API                              | Submit valid login request.                            | Response includes `success`, `message`, `token`, and `data`.                                        |
| LOGIN-009 | User data returned              | Backend API                              | Submit valid login and inspect `data`.                 | `data` includes user `id`, `username`, `email`, and `created_at`.                                   |
| LOGIN-010 | Password not returned           | Backend API                              | Submit valid login and inspect response.               | Response does not include plain password or hashed password.                                        |
| LOGIN-011 | Backend error displayed         | Frontend component                       | Mock failed login response.                            | Backend error message is displayed on the login page.                                               |
| LOGIN-012 | Redirect after login            | Frontend routing                         | Complete valid login from frontend component test.     | User is redirected to `/profile`.                                                                   |
| LOGIN-013 | Login form renders              | Frontend component                       | Render login page.                                     | Email field, password field, and Login button are visible.                                          |
| LOGIN-014 | Login function called correctly | Frontend component                       | Submit valid login form.                               | `login` is called with email and password.                                                          |

## Test Execution Results

| ID        | Actual Result                                           | Status | Notes                                                                |
| --------- | ------------------------------------------------------- | ------ | -------------------------------------------------------------------- |
| LOGIN-001 | Automated backend and frontend tests passed.            | Pass   | Covered by `test_login_success` and LoginPage success redirect test. |
| LOGIN-002 | Automated frontend test passed.                         | Pass   | Covered by LoginPage empty fields test.                              |
| LOGIN-003 | Automated frontend test passed.                         | Pass   | Covered by LoginPage empty fields test.                              |
| LOGIN-004 | Automated backend and frontend validation tests passed. | Pass   | Covered by empty request and empty form tests.                       |
| LOGIN-005 | Automated frontend test passed.                         | Pass   | Covered by LoginPage invalid email test.                             |
| LOGIN-006 | Automated backend test passed.                          | Pass   | Covered by `test_login_invalid_credentials_wrong_password`.          |
| LOGIN-007 | Automated backend test passed.                          | Pass   | Covered by `test_login_invalid_credentials_non_existing_email`.      |
| LOGIN-008 | Automated backend test passed.                          | Pass   | Covered by `test_login_success`.                                     |
| LOGIN-009 | Automated backend test passed.                          | Pass   | Covered by `test_login_success`.                                     |
| LOGIN-010 | Automated backend test passed.                          | Pass   | Covered by `test_login_password_not_returned`.                       |
| LOGIN-011 | Automated frontend test passed.                         | Pass   | Covered by LoginPage backend error test.                             |
| LOGIN-012 | Automated frontend test passed.                         | Pass   | Covered by LoginPage redirect test.                                  |
| LOGIN-013 | Automated frontend test passed.                         | Pass   | Covered by LoginPage render test.                                    |
| LOGIN-014 | Automated frontend test passed.                         | Pass   | Covered by LoginPage success test.                                   |

## Notes

Frontend component tests are stored in `frontend/src/test` because Vitest resolves React component imports more reliably from inside the frontend project. Backend automated tests and markdown test documentation are stored under the root `tests/auth` folder.
