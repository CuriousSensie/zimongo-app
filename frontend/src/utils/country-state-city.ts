import axios from "axios";

const BASE_URL = "https://api.countrystatecity.in/v1";
const API_KEY = process.env.NEXT_PUBLIC_CSC_API_KEY;

if (!API_KEY) {
  console.warn("⚠️ Missing NEXT_PUBLIC_CSC_API_KEY in environment variables.");
}

const headers = {
  "X-CSCAPI-KEY": API_KEY || "",
};

export const locationService = {
  async getCountries() {
    try {
      const { data } = await axios.get(`${BASE_URL}/countries`, { headers });
      return data.map((c: any) => ({
        name: c.name,
        iso2: c.iso2,
      }));
    } catch (error) {
      console.error("Error fetching countries:", error);
      return [];
    }
  },

  async getStates(countryCode: string) {
    if (!countryCode) return [];
    try {
      const { data } = await axios.get(
        `${BASE_URL}/countries/${countryCode}/states`,
        { headers }
      );
      return data.map((s: any) => ({
        name: s.name,
        iso2: s.iso2,
      }));
    } catch (error) {
      console.error(`Error fetching states for ${countryCode}:`, error);
      return [];
    }
  },

  async getCities(countryCode: string, stateCode: string) {
    if (!countryCode || !stateCode) return [];
    try {
      const { data } = await axios.get(
        `${BASE_URL}/countries/${countryCode}/states/${stateCode}/cities`,
        { headers }
      );

      return data.map((city: any) => ({
        name: city.name,
      }));
    } catch (error) {
      console.error(
        `Error fetching cities for ${countryCode}-${stateCode}:`,
        error
      );
      return [];
    }
  },

  async getCountryFromCode(countryCode: string) {
    if (!countryCode) return null;
    try {
      const { data } = await axios.get(
        `${BASE_URL}/countries/${countryCode}`,
        { headers }
      );
      return { name: data.name, iso2: data.iso2 };
    } catch (error) {
      console.error(`Error fetching country for code ${countryCode}:`, error);
      return null;
    }
  },

  async getStateFromCode(countryCode: string, stateCode: string) {
    if (!countryCode || !stateCode) return null;
    try {
      const { data } = await axios.get(
        `${BASE_URL}/countries/${countryCode}/states/${stateCode}`,
        { headers }
      );
      return { name: data.name, iso2: data.iso2 };
    } catch (error) {
      console.error(
        `Error fetching state for ${countryCode}-${stateCode}:`,
        error
      );
      return null;
    }
  },
};
