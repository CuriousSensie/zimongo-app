// ? Subdomain logic in server is based on host instead of hostname



/**
 * Converts a company name to a subdomain-safe format
 * Examples:
 * - "Google" → "google"
 * - "ABC Corp & Co." → "abc-corp-co"
 */
export function companyNameToSubdomain(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars except spaces/hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // Trim hyphens
}

/**
 * Extracts subdomain from host (server: req.headers.host OR browser: window.location.host)
 * Examples:
 * - "google.zimongo.com" → "google"
 * - "google.localhost:3000" → "google"
 * - "localhost:3000" → null
 */
export function extractSubdomain(host: string): string | null {
  if (!host) return null;

  // Remove port if present
  const hostWithoutPort = host.split(":")[0];
  const parts = hostWithoutPort.split(".");

  // Production domain
  if (hostWithoutPort.endsWith(".zimongo.com")) {
    if (parts.length >= 3) {
      const subdomain = parts[0];
      if (subdomain && subdomain !== "www") return subdomain;
    }
  }

  // Development subdomain (.localhost)
  if (hostWithoutPort.endsWith(".localhost")) {
    if (parts.length >= 2) {
      const subdomain = parts[0];
      if (subdomain) return subdomain;
    }
  }

  // lvh.me
  if (hostWithoutPort.endsWith(".lvh.me")) {
    if (parts.length >= 2) {
      const subdomain = parts[0];
      if (subdomain) return subdomain;
    }
  }

  // nip.io
  if (hostWithoutPort.endsWith(".nip.io")) {
    if (parts.length >= 2) {
      const subdomain = parts[0];
      if (subdomain && subdomain !== "www" && subdomain !== "127") {
        return subdomain;
      }
    }
  }

  return null;
}

/**
 * Checks if the current environment is production
 */
function isProductionEnvironment(): boolean {
  if (typeof window !== "undefined") {
    const host = window.location.host;
    return (
      host.includes("zimongo.com") ||
      host.includes("ondigitalocean.app") ||
      host.includes("zimongo-staging.com")
    );
  }
  return process.env.NODE_ENV === "production";
}

/**
 * Gets the current domain for subdomain generation
 */
function getCurrentDomain(): string {
  if (typeof window !== "undefined") {
    const host = window.location.host; // includes port
    const protocol = window.location.protocol;

    if (host.includes("ondigitalocean.app")) {
      return `${protocol}//${host}`;
    }

    if (host.includes("zimongo.com")) {
      return "https://zimongo.com";
    }

    return `${protocol}//${host}`;
  }

  // Server-side fallback
  if (process.env.NODE_ENV === "production") {
    return "https://zimongo.com";
  }
  return "http://localhost:3000";
}

/**
 * Generates the appropriate subdomain URL based on environment
 */
export function generateSubdomainUrl(subdomain: string, path: string = ""): string {
  const isProduction = isProductionEnvironment();

  if (isProduction) {
    if (typeof window !== "undefined" && window.location.host.includes("zimongo.com")) {
      const currentDomain = getCurrentDomain();
      return `${currentDomain}/subdomain/${subdomain}${path}/login`;
    }
    return `https://${subdomain}.zimongo.com${path}/login`;
  } else {
    const currentPort = typeof window !== "undefined" ? window.location.port : "3000";
    return `http://${subdomain}.localhost:${currentPort}${path}/login`;
  }
}

/**
 * Checks if current host has a subdomain
 */
export function isSubdomain(host: string): boolean {
  return extractSubdomain(host) !== null;
}

/**
 * Gets the main domain without subdomain
 */
export function getMainDomain(): string {
  const isProduction = isProductionEnvironment();

  if (isProduction) {
    if (typeof window !== "undefined" && window.location.host.includes("ondigitalocean.app")) {
      return getCurrentDomain();
    }
    return "https://zimongo.com";
  } else {
    const currentPort = typeof window !== "undefined" ? window.location.port : "3000";
    return `http://localhost:${currentPort}`;
  }
}
