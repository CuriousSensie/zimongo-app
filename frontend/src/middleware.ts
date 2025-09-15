import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { extractSubdomain, isSubdomain } from "./utils/subdomain";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|signin|signup|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

const WHITELISTED_PAGES = [
  "/signup",
  "/verify",
  "/forgot-password",
  "/confirm-password",
  "/reset-password",
  "/help-and-support",
  "/redirect",
  "/term-of-use",
  "/privacy-policy",
  "/cookies-policy",
  "/security-policy",
  "/accessibility-statement",
];

const COMMON_PAGES = [""];
const ADMIN_SUBDOMAIN = "admin";
const DEFAULT_REDIRECT_URL =
  process.env.NEXT_PUBLIC_LIVE_URL || "http://localhost:3000/";

function isWhitelistedPath(pathname: string) {
  return WHITELISTED_PAGES.some((page) => pathname.includes(page));
}

function isCommonPage(pathname: string) {
  return COMMON_PAGES.some((page) => pathname.includes(page));
}

function createSubdomainRewriteUrl(
  subdomain: string,
  url: URL,
  req: NextRequest
) {
  return new URL(`/subdomain/${subdomain}${url.pathname}`, req.url);
}

function createAdminRewriteUrl(subdomain: string, url: URL, req: NextRequest) {
  return new URL(`/admin/${url.pathname}`, req.url);
}

function createLoginUrl(req: NextRequest) {
  return new URL(`/signin`, req.url);
}

// for user dashboards
async function handleSubdomainRouting(
  subdomain: string,
  url: URL,
  req: NextRequest
) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });


  if (isWhitelistedPath(url.pathname)) {
    return NextResponse.rewrite(new URL(url.pathname, req.url));
  }

  if (token) {
    if (isCommonPage(url.pathname)) {
      return NextResponse.rewrite(
        createSubdomainRewriteUrl(subdomain, url, req)
      );
    }
    return NextResponse.rewrite(createSubdomainRewriteUrl(subdomain, url, req));
  }

  return NextResponse.rewrite(createLoginUrl(req));
}

// for admin dashboard
async function handleAdminRouting(
  subdomain: string,
  url: URL,
  req: NextRequest
) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });


  if (isWhitelistedPath(url.pathname)) {
    return NextResponse.rewrite(new URL(url.pathname, req.url));
  }

  if (token) {
    if (isCommonPage(url.pathname)) {
      return NextResponse.rewrite(createAdminRewriteUrl(subdomain, url, req));
    }
    return NextResponse.rewrite(createAdminRewriteUrl(subdomain, url, req));
  }

  return NextResponse.rewrite(createLoginUrl(req));
}

export default async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const hostname = req.headers.get("host") || "";
  const subdomain = extractSubdomain(hostname);

  // root domain
  if (!subdomain) {
    return NextResponse.next();
  }

  // unknown domain
  if (
    subdomain === null &&
    hostname !== "localhost:3000" &&
    hostname !== "yourdomain.com"
  ) {
    return NextResponse.redirect(DEFAULT_REDIRECT_URL);
  }

  // admin routing
  if (subdomain === ADMIN_SUBDOMAIN) {
    return handleAdminRouting(subdomain, url, req);
  }

  // subdomain routing (user dashboard)
  if (isSubdomain(hostname)) {
    return handleSubdomainRouting(subdomain, url, req);
  }

  return NextResponse.next();
}
