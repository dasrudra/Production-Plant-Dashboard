// Empty string means every request is same-origin and relative:
//   fetch("/api/reports/latest")
//
// In development the Vite proxy forwards /api to uvicorn.
// In production FastAPI serves both the UI and the API from one port.
// VITE_API_BASE_URL is only needed if you ever split them across hosts.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
