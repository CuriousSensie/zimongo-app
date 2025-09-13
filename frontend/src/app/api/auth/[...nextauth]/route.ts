import DataError from "@/lib/DataError";
import { ICallback, ISessionUser, IUser, IUserBasic } from "@/types/auth";

import axios from "axios";
import NextAuth from "next-auth";
import type { Account, AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "credentials",
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        ip: { label: "IP", type: "text" },
        isRemember: { label: "Remember", type: "text" },
      },

      async authorize(credentials): Promise<any> {
        if (typeof credentials !== "undefined") {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/user/login`,
            {
              email: credentials.email,
              password: credentials.password,
              ip: credentials.ip,
              isRemember: credentials.isRemember,
            }
          );
          if (res.status === 200 || res.status == 201) {
            return res.data;
          } else {
            return null;
          }
        } else {
          return null;
        }
      },
    }),
    CredentialsProvider({
      name: "superAdminSignIn",
      id: "superAdminSignIn",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        ip: { label: "IP", type: "text" },
        isRemember: { label: "Remember", type: "text" },
      },

      async authorize(credentials): Promise<any> {
        if (typeof credentials !== "undefined") {
          try {
            const res = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/superAdmin/login`,
              {
                email: credentials.email,
                password: credentials.password,
                ip: credentials.ip,
                isRemember: credentials.isRemember,
              }
            );
            if (res.status === 200 || res.status === 201) {
              return {
                ...res.data,
                isSuperAdmin: true,
              };
            } else {
              return null;
            }
          } catch (error) {
            console.error("Super admin login error:", error);
            return null;
          }
        } else {
          return null;
        }
      },
    }),
    CredentialsProvider({
      name: "userSignin",
      id: "userSignIn",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        ip: { label: "IP", type: "text" },
        isRemember: { label: "Remember", type: "text" },
        companyName: { label: "Company Name", type: "text" },
      },

      async authorize(credentials): Promise<any> {
        if (typeof credentials !== "undefined") {
          try {
            const res = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/user/login`,
              {
                email: credentials.email,
                password: credentials.password,
                ip: credentials.ip,
                isRemember: credentials.isRemember,
              }
            );
            if (res.status === 200 || res.status === 201) {
              return {
                ...res.data,
              };
            } else {
              return null;
            }
          } catch (error) {
            console.error("User login error:", error);
            return null;
          }
        } else {
          return null;
        }
      },
    }),
    CredentialsProvider({
      name: "signUp",
      id: "signUp",
      credentials: {
        name: { label: "Name", type: "text" },
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        ip: { label: "IP", type: "text" },
      },

      async authorize(credentials, req): Promise<any> {
        if (typeof credentials !== "undefined") {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/user/register`,
            {
              name: credentials.name,
              email: credentials.email,
              password: credentials.password,
              ip: credentials.ip,
            }
          );
          if (res.status === 201) {
            return res.data;
          } else {
            return null;
          }
        } else {
          return null;
        }
      },
    }),
  ],
  debug: true,
  session: { 
    strategy: "jwt", 
    maxAge: 30 * 24 * 60 * 60, // ! session age = 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,

  // // !! passing cookie options with domain to get same cookies across subdomains.
  // cookies: {
  //   sessionToken: {
  //     name: `next-auth.session-token`,
  //     options: {
  //       httpOnly: process.env.NODE_ENV === "production",
  //       sameSite: "lax",
  //       path: "/",
  //       secure: process.env.NODE_ENV === "production",
  //       domain: process.env.COOKIE_DOMAIN || ".127.0.0.1.nip.io",
  //     },
  //   },
  // },

  callbacks: {
    async signIn({ account, user }) {
      if (account && account.provider === "google") {
        (user as IUser).auth = { ...account };
      }
      return true;
    },

    async jwt({ token, user, account }) {
      const currentUser = user as IUser;
      if (account && currentUser) {
        // Handle super admin login
        if (currentUser.isSuperAdmin) {
          return {
            ...token,
            accessToken: currentUser.token,
            refreshToken: currentUser.refreshToken,
            isSuperAdmin: true,
            me: {
              ...currentUser.user,
              isSuperAdmin: true,
            },
          };
        }

        return {
          ...token,
          accessToken: currentUser.token,
          refreshToken: currentUser.refreshToken,
          is2FA: currentUser.is2FA,
          me: { ...currentUser.user, isAdmin: currentUser.user.isAdmin }, // Include isAdmin
        };
      }
      return token;
    },

    async session({ session, token, user }) {
      const currentUser = session.user as ISessionUser;
      if (currentUser) {
        currentUser.accessToken = token.accessToken as string;
        currentUser.refreshToken = token.refreshToken as string;
        currentUser.accessTokenExpires = token.exp as string;
        currentUser.is2FA = token.is2FA as unknown as boolean;
        currentUser.isSuperAdmin = token.isSuperAdmin as boolean;
        currentUser.me = token.me as IUserBasic;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
