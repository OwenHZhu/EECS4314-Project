/**
 * ./api/auth/authClient.js
 *
 * Axios client dedicated to the Authentication Service.
 * 
 * Dependency: 
 * - createClient factory for creating the basic instance
 * - The base URL is from Vite environment variables
 *
 * @returns {import("axios").AxiosInstance}
 *   A configured Axios instance scoped to the authentication API.
 */

import { createClient } from "../createClient";

/**
 * Create an Axios client for the Auth Service.
 */
const authClient = createClient(import.meta.env.VITE_AUTH_SERVICE_URL);

export default authClient;