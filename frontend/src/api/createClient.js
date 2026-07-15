/**
 * ./api/createClient.js
 *
 * Factory function for generating isolated Axios clients.
 * Each client receives its own base URL and configuration,
 * allowing different backend services to operate independently.
 *
 *
 * @param {string} baseURL - The root URL for the target API service.
 * @returns {import("axios").AxiosInstance}
 *   A configured Axios instance scoped to the provided base URL.
 */

import axios from "axios";

/**
 * Creates a basic Axios client with the given base URL.
 */
export function createClient(baseURL) {
  return axios.create({ baseURL });
}