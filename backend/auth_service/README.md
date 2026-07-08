# BookAtlas — Auth Service

Standalone authentication microservice for BookAtlas. Owns all user
registration, login, session, and profile-management logic. Runs
independently from any other BookAtlas service.

## What this service owns

- User registration & login
- JWT issuance, validation, and blacklisting (logout)
- Authenticated profile retrieval, update, password change, and account
  deletion
