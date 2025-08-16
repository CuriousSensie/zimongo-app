import { NEXT_PUBLIC_API_URL } from "@/constant/env";
import axios, { AxiosInstance } from "axios";

// Function to get the dynamic API URL based on current subdomain
function getDynamicApiUrl(): string {
  // return NEXT_PUBLIC_API_URL;
  if (typeof window === "undefined") {
    // Server-side, use default
    return NEXT_PUBLIC_API_URL;
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;

  // If it's a subdomain (e.g., qzueos.localhost:3000)
  if (hostname.includes(".localhost")) {
    // Use the proxy route to avoid CORS issues
    return `${protocol}//${hostname}${port ? `:${port}` : ""}/api/proxy`;
  }

  // If it's production subdomain
  if (
    hostname.includes(".eprocure365.com") ||
    hostname.includes(".ep365.com")
  ) {
    // Use the proxy route for production subdomains too
    return `${protocol}//${hostname}/api/proxy`;
  }

  // Default fallback - use direct backend URL
  return NEXT_PUBLIC_API_URL;
}

export class PublicApi {
  instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: getDynamicApiUrl(),
    });
  }

  getLocation() {
    return this.instance.get("/location");
  }

  verifyOTP(payload: { email: string; otp: number; ip: string }) {
    return this.instance.post("/user/verify-otp", payload);
  }

  verifySignUpToken(token: string) {
    return this.instance.get(`/user/verify-signup-expiry/${token}`);
  }

  resendOTP(payload: { email: string }) {
    return this.instance.post("/user/resend-otp", payload);
  }

  resetUserPassword(token: string, password: string) {
    return this.instance.put(`/user/reset-password`, { token, password });
  }

  getResetPasswordLink(email: string) {
    return this.instance.post(`/user/reset-password/confirm`, { email });
  }
  verifyResetPasswordToken(token: string) {
    return this.instance.post(`/user/reset-password/verify`, { token });
  }

  resetVendorPassword(token: string, password: string) {
    return this.instance.put(`/vendor/reset-password`, { token, password });
  }

  getVendorResetPasswordLink(email: string) {
    return this.instance.post(`/vendor/reset-password/confirm`, { email });
  }
  verifyVendorResetPasswordToken(token: string) {
    return this.instance.post(`/vendor/reset-password/verify`, { token });
  }
}

const publicApi = new PublicApi();
export default publicApi;
