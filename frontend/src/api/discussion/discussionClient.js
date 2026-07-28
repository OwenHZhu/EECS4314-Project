/**
 * ./api/discussion/discussionClient.js
 *
 * Axios client dedicated to the Discussion Service.
 * 
 * Dependency: 
 * - createClient factory for creating the basic instance
 * - The base URL is from Vite environment variables
 *
 * @returns {import("axios").AxiosInstance}
 *   A configured Axios instance scoped to the discussion API.
 */

import { createClient } from "../createClient";

/**
 * Create an Axios client for the Discussion Service.
 */
const discussionClient = createClient(import.meta.env.VITE_DISCUSSION_SERVICE_URL);

export default discussionClient;