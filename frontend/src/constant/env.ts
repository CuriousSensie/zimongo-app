export const isProd = process.env.NODE_ENV === "production";
export const isLocal = process.env.NODE_ENV === "development";

export const NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
  
export const NEXT_PUBLIC_SOCKET_API_URL = process.env.NEXT_PUBLIC_SOCKET_API_URL ?? "http://localhost:5000";

