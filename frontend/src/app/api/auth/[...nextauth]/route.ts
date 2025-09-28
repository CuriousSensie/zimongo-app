// pages/api/auth/[...nextauth].ts  (or app/api/auth/.../route.ts)
import axios from "axios";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { AuthOptions } from "next-auth";

function normalizeSuccessPayload(data: any) {
  // Map your backend payload to what jwt callback expects.
  // Adjust keys if your backend uses different names.
  return {
    token: data.token ?? data.accessToken ?? null,
    refreshToken: data.refreshToken ?? null,
    is2FA: data.is2FA ?? false,
    user: data.user ?? data.me ?? { email: data.email, name: data.name } // minimal fallback
  };
}

async function postJson(url: string, payload: any) {
  return axios.post(url, payload, {
    headers: { "Content-Type": "application/json" },
    validateStatus: () => true, // handle statuses manually
  });
}

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    // Example generic credentials provider (keep if needed)
    CredentialsProvider({
      id: "userSignIn",
      name: "userSignIn",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        ip: { label: "IP", type: "text" },
        isRemember: { label: "Remember", type: "text" },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials) return null;

        try {
          const res = await postJson(`${process.env.NEXT_PUBLIC_API_URL}/user/login`, {
            email: credentials.email,
            password: credentials.password,
            ip: credentials.ip,
            isRemember: credentials.isRemember,
          });

          const status = res.status;
          const data = res.data ?? {};

          if (status === 200 || status === 201) {
            return normalizeSuccessPayload(data);
          }

          // map server messages -> throw a clear message
          const serverMsg = (data?.message || "").toString().toLowerCase();

          if (status === 401) {
            throw new Error(data?.message || "Unauthorized");
          }

          if (status === 403) {
            if (serverMsg.includes("blocked")) throw new Error("blocked");
            if (serverMsg.includes("email") || serverMsg.includes("verify")) throw new Error("email_not_verified");
            if (serverMsg.includes("deactivated")) throw new Error("deactivated");
            throw new Error(data?.message || "forbidden");
          }

          if (status === 422) throw new Error(data?.message || "validation_error");

          // fallback
          throw new Error(data?.message || `HTTP_${status}`);
        } catch (err: any) {
          // surface helpful error message to client
          // prefer server-provided message if available
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            "Unable to reach authentication server. Please try again.";
          // always throw so next-auth returns an error to client
          throw new Error(msg);
        }
      },
    }),

    // Add other credential providers with the same pattern (example: superAdmin)
    CredentialsProvider({
      id: "superAdminSignIn",
      name: "superAdminSignIn",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        ip: { label: "IP", type: "text" },
        isRemember: { label: "Remember", type: "text" },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials) return null;
        try {
          const res = await postJson(`${process.env.NEXT_PUBLIC_API_URL}/superAdmin/login`, {
            email: credentials.email,
            password: credentials.password,
            ip: credentials.ip,
            isRemember: credentials.isRemember,
          });

          if (res.status === 200 || res.status === 201) {
            const normalized = normalizeSuccessPayload(res.data);
            // tag super-admin
            return { ...normalized, isSuperAdmin: true, user: { ...(normalized.user ?? {}), isSuperAdmin: true } };
          }

          throw new Error(res.data?.message || `HTTP_${res.status}`);
        } catch (err: any) {
          const msg = err?.response?.data?.message || err?.message || "Super admin login error";
          throw new Error(msg);
        }
      },
    }),

    // signUp provider example, same pattern:
    CredentialsProvider({
      id: "signUp",
      name: "signUp",
      credentials: {
        name: { label: "Name", type: "text" },
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        ip: { label: "IP", type: "text" },
      },
      async authorize(credentials) : Promise<any> {
        if (!credentials) return null;
        try {
          const res = await postJson(`${process.env.NEXT_PUBLIC_API_URL}/user/register`, {
            name: credentials.name,
            email: credentials.email,
            password: credentials.password,
            ip: credentials.ip,
          });
          if (res.status === 201) {
            return normalizeSuccessPayload(res.data);
          }
          throw new Error(res.data?.message || `HTTP_${res.status}`);
        } catch (err: any) {
          const msg = err?.response?.data?.message || err?.message || "Signup error";
          throw new Error(msg);
        }
      },
    }),
  ],

  debug: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  pages: {
    signIn: "/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ account, user }) {
      // if google provider attached auth info to user
      if (account && account.provider === "google") {
        (user as any).auth = { ...account };
      }
      return true;
    },

    async jwt({ token, user, account }) {
      // user here is the object we returned from authorize on first sign-in
      if (user) {
        const u = user as any;
        // copy normalized properties to token
        token.accessToken = u.token ?? token.accessToken;
        token.refreshToken = u.refreshToken ?? token.refreshToken;
        token.is2FA = u.is2FA ?? false;
        token.isSuperAdmin = u.isSuperAdmin ?? false;
        token.me = u.user ?? u.me ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).refreshToken = token.refreshToken;
        (session.user as any).is2FA = token.is2FA;
        (session.user as any).isSuperAdmin = token.isSuperAdmin;
        (session.user as any).me = token.me;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
