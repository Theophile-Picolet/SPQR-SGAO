import axios from "axios";

// One instance for every call to the API: base URL and session cookie.
// The messages come from the API: read them with error.response.data.message
export const apiClient = axios.create({
  baseURL: process.env.API_URL,
  withCredentials: true,
});
