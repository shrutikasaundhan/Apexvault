import axios from "axios";

export const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:4000";

export const axiosWithCreds = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const axiosWithoutCreds = axios.create({
  baseURL: BASE_URL,
});
