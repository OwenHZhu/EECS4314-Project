import { createClient } from "../createClient.js"

const libraryClient = createClient(import.meta.env.VITE_LIBRARY_SERVICE_URL);

export default libraryClient; 