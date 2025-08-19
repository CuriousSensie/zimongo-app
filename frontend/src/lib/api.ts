import axios, { AxiosInstance } from "axios";
import { NEXT_PUBLIC_API_URL } from "@/constant/env";
import { getSession } from "next-auth/react";
import { ISessionData } from "@/types/session";

function getDynamicApiUrl(): string {
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
  // if (hostname.includes('.localhost')) {
  //   // Use the proxy route to avoid CORS issues
  //   return `${protocol}//${hostname}${port ? `:${port}` : ""}/api/proxy`;
  // }

  // If it's production subdomain
  if (
    hostname.includes(".zimongo.com") ||
    hostname.includes(".zimongo-staging.com")
  ) {
    // Use the proxy route for production subdomains too
    return `${protocol}//${hostname}/api/proxy`;
  }

  // Default fallback - use direct backend URL
  return NEXT_PUBLIC_API_URL;
}

export class API {
  instance: AxiosInstance;

  constructor(token?: string) {
    this.instance = axios.create({
      baseURL: getDynamicApiUrl(),
      headers: {
        Authorization: token,
      },
    });
    this.setInterceptor();
  }

  setInterceptor() {
    this.instance.interceptors.request.use(
      async (config) => {
        const session = (await getSession()) as ISessionData | null;
        if (session?.user?.accessToken) {
          config.headers["Authorization"] = session.user.accessToken;
        } else {
          throw new Error("No authorization token found!");
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  getUserLocation() {
    return this.instance.get("/user/location");
  }

  // PROFILE APIS
  createProfile(formData: FormData) {
    return this.instance.post("/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data", 
      },
    });
  }

  getProfileById(id: string) {
    return this.instance.get(`/profile/${id}`);
  }

  getProfileByUserId(userId: string) {
    return this.instance.get(`/profile/${userId}`);
  }

  updateProfile(id: string, formData: FormData) {
    return this.instance.put(`/profile/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

}

const Api = new API();
export default Api;
