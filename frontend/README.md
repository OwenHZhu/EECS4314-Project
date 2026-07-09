# BookAtlas — Frontend

## Overview

The **BookAtlas Frontend** is a React + TailwindCSS application that provides the user-facing interface for the BookAtlas platform. It currently integrates with the Authentication Service backend to support user registration, login, logout, and profile management. Additional services (Book, Library, Discussion) will be integrated as they become available.

## Development Setup

### 1. Clone the Repository
```
git clone https://github.com/OwenHZhu/EECS4314-Project.git
```

The project root is `EECS4314-Project`.

### 2. Navigate to the Frontend
```
cd frontend
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```
cp .env.example .env
```

Set the value for:

-   `VITE_API_URL` — the base URL of the backend API (FastAPI server).
    

### 4. Install Dependencies
```
npm install
```

### 5. Start the Development Server
```
npm run dev
```

Open the app in your browser:
```
http://localhost:5173
```

### 6. Run Tests
```
npm test
```

**Note:** The frontend requires the backend FastAPI server to be running for full functionality.

## Codebase Structure

### Root Files

#### `tailwind.config.js`

Defines global theme settings (colors, spacing, typography) for consistent styling across the UI.

#### `package.json`

Lists all dependencies, scripts, and project metadata.

#### `App.jsx`

Defines the application’s routing structure, including protected and public routes.

## `src/` Directory

### `src/assets`

Static assets such as images and icons.

### `src/components`

Reusable UI components and page-specific components.

### `src/context`

Global state providers, including:

-   `AuthContext` — exposes user state, tokens, and authentication helpers.
    
-   `AuthProvider` — wraps the app and manages authentication logic.
    

### `src/data`

Temporary mock data for users and books until backend services are fully integrated.

### `src/hooks`

Custom hooks that encapsulate shared logic (e.g., specialized `useEffect` or `useState` patterns).

### `src/lib`

API interaction layer. Contains functions that communicate with backend services, keeping network logic separate from UI components.

### `src/pages`

All main pages of the application, organized into folders when needed.

### `src/test`

Unit, component, and integration tests for the frontend.

### `src/utils`

General-purpose utilities such as form validation helpers.

## Future Development

Planned enhancements include:

- Administrator Dashboard  
- Integration with:
    
    -   Book Service
        
    -   Library Service
        
    -   Discussion Service
        
-   Expanded test coverage:
    
    -   Additional unit tests
        
    -   Component tests
        
    -   Integration tests
        
-   Continued refinement of UI/UX and frontend architecture