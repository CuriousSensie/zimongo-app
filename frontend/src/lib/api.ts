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

  //  USER APIS
  getUserSettings() {
    return this.instance.get("/user/settings");
  }

  updateUserSettings(is2FA: boolean) {
    return this.instance.patch("/user/settings", { is2FA });
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

  getProfileBySlug(slug: string) {
    return this.instance.get(`/profile/slug/${slug}`);
  }

  // FILE APIS
  uploadFiles(formData: FormData) {
    return this.instance.post(`/file/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  // LEAD APIS
  createLead(leadData: any) {
    return this.instance.post("/lead/create", leadData);
  }

  getLeads(params?: {
    page?: number;
    limit?: number;
    leadIntent?: string;
    leadType?: string;
    title?: string;
    description?: string;
    status?: string;
    budget?: string;
    currency?: string;
    search?: string;
    category?: string;
    minBudget?: string;
    maxBudget?: string;
    country?: string;
    state?: string;
    city?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    return this.instance.get("/lead", { params });
  }

  getMyLeads(params?: {
    page?: number;
    limit?: number;
    leadIntent?: string;
    leadType?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    return this.instance.get("/lead/my-leads", { params });
  }

  getLeadById(id: string) {
    return this.instance.get(`/lead/lead-by-id/${id}`);
  }

  incrementLeadView(id: string) {
    return this.instance.post(`/lead/${id}/view`);
  }

  updateLead(id: string, leadData: any) {
    return this.instance.put(`/lead/${id}`, leadData);
  }

  deleteLead(id: string) {
    return this.instance.delete(`/lead/${id}`);
  }

  updateLeadStatus(id: string, status: string) {
    return this.instance.patch(`/lead/${id}/status`, { status });
  }


  sendLeadVerificationOTP(leadId: string) {
    return this.instance.post(`/lead/${leadId}/verify`);
  }

  verifyLeadOTP(leadId: string, otp: string) {
    return this.instance.patch(`/lead/${leadId}/verify`, { otp });
  }

  getLeadsByProfileId(profileId: string, params?: {
    page?: number,
    limit?: number
  }) {
    return this.instance.get(`/lead/profile/${profileId}`, { params });
  }

  saveLead(leadId: string) {
    return this.instance.post(`/lead/save/${leadId}`);
  }

  unsaveLead(leadId: string) {
    return this.instance.delete(`/lead/unsave/${leadId}`);
  }

  getSavedLeads(params?: { page?: number; limit?: number }) {
    return this.instance.get("/lead/saved", { params });
  }

  checkIfLeadIsSaved(leadId: string) {
    return this.instance.get(`/lead/is-saved/${leadId}`);
  }

}

const Api = new API();
export default Api;
