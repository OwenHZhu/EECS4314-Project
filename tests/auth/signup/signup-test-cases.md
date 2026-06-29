# Signup Test Cases

## Feature

User account registration for BookAtlas.

## Backend Endpoint

POST `/api/v1/auth/register`

## Request Body

```json
{
  "username": "testuser1",
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

| ID         | Test Scenario                      | Test Type                                | Steps                                                  | Expected Result                                                                                         |
| ---------- | ---------------------------------- | ---------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| SIGNUP-001 | Valid signup                       | Backend API / Frontend                   | Submit valid username, email, and password.            | Account is created, JWT token is returned, user data is returned, and user is redirected to `/profile`. |
| SIGNUP-002 | Empty username                     | Frontend validation                      | Leave username empty and submit signup form.           | Error appears: `Please enter your username.`                                                            |
| SIGNUP-003 | Empty email                        | Frontend validation                      | Leave email empty and submit signup form.              | Error appears: `Please enter your email.`                                                               |
| SIGNUP-004 | Empty password                     | Frontend validation                      | Leave password empty and submit signup form.           | Error appears: `Please enter your password.`                                                            |
| SIGNUP-005 | All fields empty                   | Frontend validation / Backend validation | Submit empty signup form or empty backend request.     | Validation errors are returned for required fields.                                                     |
| SIGNUP-006 | Invalid email format               | Frontend validation                      | Enter invalid email such as `invalidemail` and submit. | Error appears: `Invalid email.`                                                                         |
| SIGNUP-007 | Duplicate email                    | Backend API                              | Register using an email that already exists.           | Backend returns `409` with message: `An account with this email already exists`.                        |
| SIGNUP-008 | Duplicate username                 | Backend API                              | Register using a username that already exists.         | Backend returns `409` with message: `Username is already taken`.                                        |
| SIGNUP-009 | Successful response shape          | Backend API                              | Submit valid registration request.                     | Response includes `success`, `message`, `token`, and `data`.                                            |
| SIGNUP-010 | Password not returned              | Backend API                              | Submit valid registration and inspect response.        | Response does not include plain password or hashed password.                                            |
| SIGNUP-011 | User data returned                 | Backend API                              | Submit valid registration and inspect `data`.          | `data` includes user `id`, `username`, `email`, and `created_at`.                                       |
| SIGNUP-012 | Backend error displayed            | Frontend component                       | Mock failed registration response.                     | Backend error message is displayed on the signup page.                                                  |
| SIGNUP-013 | Register function called correctly | Frontend component                       | Submit valid signup form.                              | `register` is called with username, email, and password.                                                |
| SIGNUP-014 | Redirect after signup              | Frontend routing                         | Complete valid signup from frontend component test.    | User is redirected to `/profile`.                                                                       |
| SIGNUP-015 | Signup form renders                | Frontend component                       | Render signup page.                                    | Username, email, password fields, and Sign up button are visible.                                       |

## Test Execution Results

| ID         | Actual Result                                           | Status | Notes                                                                      |
| ---------- | ------------------------------------------------------- | ------ | -------------------------------------------------------------------------- |
| SIGNUP-001 | Automated backend and frontend tests passed.            | Pass   | Covered by `test_register_success` and RegisterPage success redirect test. |
| SIGNUP-002 | Automated frontend test passed.                         | Pass   | Covered by RegisterPage empty fields test.                                 |
| SIGNUP-003 | Automated frontend test passed.                         | Pass   | Covered by RegisterPage empty fields test.                                 |
| SIGNUP-004 | Automated frontend test passed.                         | Pass   | Covered by RegisterPage empty fields test.                                 |
| SIGNUP-005 | Automated backend and frontend validation tests passed. | Pass   | Covered by empty request and empty form tests.                             |
| SIGNUP-006 | Automated frontend test passed.                         | Pass   | Covered by RegisterPage invalid email test.                                |
| SIGNUP-007 | Automated backend test passed.                          | Pass   | Covered by `test_register_duplicate_email`.                                |
| SIGNUP-008 | Automated backend test passed.                          | Pass   | Covered by `test_register_duplicate_username`.                             |
| SIGNUP-009 | Automated backend test passed.                          | Pass   | Covered by `test_register_success`.                                        |
| SIGNUP-010 | Automated backend test passed.                          | Pass   | Covered by `test_register_password_not_returned`.                          |
| SIGNUP-011 | Automated backend test passed.                          | Pass   | Covered by `test_register_success`.                                        |
| SIGNUP-012 | Automated frontend test passed.                         | Pass   | Covered by RegisterPage backend error test.                                |
| SIGNUP-013 | Automated frontend test passed.                         | Pass   | Covered by RegisterPage success test.                                      |
| SIGNUP-014 | Automated frontend test passed.                         | Pass   | Covered by RegisterPage redirect test.                                     |
| SIGNUP-015 | Automated frontend test passed.                         | Pass   | Covered by RegisterPage render test.                                       |

## Notes

Frontend component tests are stored in `frontend/src/test` because Vitest resolves React component imports more reliably from inside the frontend project. Backend automated tests and markdown test documentation are stored under the root `tests/auth` folder.
