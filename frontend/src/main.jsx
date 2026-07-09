/**
 * ./main.jsx 
 * 
 * Application entry point.
 *
 * - Imports global styles and initializes the React application.
 * - Wraps the root component in <StrictMode> to help detect potential issues.
 * - Provides authentication context to the entire app via <AuthProvider>.
 * - Renders the main <App /> component into the DOM element with id="root".
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthProvider from './context/auth/AuthProvider.jsx'

/*
 * Mount the React application:
 * - createRoot() initializes React 18's concurrent rendering engine.
 * - .render() attaches the component tree to the DOM.
 * - <StrictMode> enables additional checks during development.
 * - <AuthProvider> supplies authentication state and logic globally.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)