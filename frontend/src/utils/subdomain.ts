/**
 * Converts a company name to a subdomain-safe format
 * Examples:
 * - "Google" → "google"
 * - "ABC Corp & Co." → "abc-corp-co"
 */
export function companyNameToSubdomain(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Extracts subdomain from hostname
 * Examples:
 * - "google.ep365.com" → "google"
 * - "google.localhost:3000" → "google"
 * - "localhost:3000" → null
 */
export function extractSubdomain(hostname: string): string | null {
  // Remove port if present
  const hostWithoutPort = hostname.split(":")[0];
  const parts = hostWithoutPort.split(".");

  // Check if it's a production subdomain
  if (hostWithoutPort.endsWith(".zimongo.com")) {
    if (parts.length >= 3) {
      const subdomain = parts[0];
      // Ensure it's not 'www' or empty
      if (subdomain && subdomain !== "www") {
        return subdomain;
      }
    }
  }

  // Check if it's a development subdomain (.localhost)
  if (hostWithoutPort.endsWith(".localhost")) {
    if (parts.length >= 2) {
      const subdomain = parts[0];
      // Ensure it's not empty
      if (subdomain) {
        return subdomain;
      }
    }
  }

  // Check if it's a development subdomain (.lvh.me)
  if (hostWithoutPort.endsWith(".lvh.me")) {
    if (parts.length >= 2) {
      const subdomain = parts[0];
      if (subdomain) {
        return subdomain;
      }
    }
  }

  // For plain localhost, we don't extract subdomains
  return null;
}

/**
 * Checks if the current environment is production
 */
function isProductionEnvironment(): boolean {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // Check for production domains: ep365.com or ondigitalocean.app deployments
    return (
      hostname.includes("zimongo.com") || hostname.includes("ondigitalocean.app") || hostname.includes("zimongo-staging.com")
    );
  }
  return process.env.NODE_ENV === "production";
}

/**
 * Gets the current domain for subdomain generation
 */
function getCurrentDomain(): string {
  
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;

    // If it's a DigitalOcean deployment, use the full hostname
    if (hostname.includes("ondigitalocean.app")) {
      return `${protocol}//${hostname}`;
    }

    // If it's ep365.com, use ep365.com
    if (hostname.includes("zimongo.com")) {
      return "https://zimongo.com";
    }

    // For localhost development
    return `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  }

  // Server-side fallback
  if (process.env.NODE_ENV === "production") {
    return "https://zimongo.com";
  }
  return "http://localhost:3000";
}

/**
 * Generates the appropriate subdomain URL based on environment
 * Development: https://[subdomain].localhost:3000
 * Production: https://[subdomain].ep365.com or current domain structure
 */
export function generateSubdomainUrl(
  subdomain: string,
  path: string = "",
): string {
  const isProduction = isProductionEnvironment();

  if (isProduction) {
    // For DigitalOcean deployment, use the current domain structure
    if (
      typeof window !== "undefined" &&
      window.location.hostname.includes("zimongo.com")
    ) {
      const currentDomain = getCurrentDomain();
      return `${currentDomain}/subdomain/${subdomain}${path}/login`;
    }
    // For final production (ep365.com)
    return `https://${subdomain}.zimongo${path}/login`;
  } else {
    // Development: use .localhost subdomain format
    const currentPort =
      typeof window !== "undefined" ? window.location.port : "3000";
    return `http://${subdomain}.localhost:${currentPort}${path}/login`;
  }
}

/**
 * Checks if current hostname is a subdomain
 */
export function isSubdomain(hostname: string): boolean {
  return extractSubdomain(hostname) !== null;
}

/**
 * Gets the main domain without subdomain
 */
export function getMainDomain(): string {
  const isProduction = isProductionEnvironment();

  if (isProduction) {
    if (
      typeof window !== "undefined" &&
      window.location.hostname.includes("ondigitalocean.app")
    ) {
      return getCurrentDomain();
    }
    return "https://zimongo.com";
  } else {
    const currentPort =
      typeof window !== "undefined" ? window.location.port : "3000";
    return `http://localhost:${currentPort}`;
  }
}
