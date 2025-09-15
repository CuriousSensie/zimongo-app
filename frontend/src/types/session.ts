import { ISODateString, Session } from "next-auth";

export interface IUser {
  name: string;
  email: string;
  picture: {
    type: string;
    path: string;
    originalName: string;
  }
  resetToken: string;
  isEmailVerified: boolean;
  isAdmin: boolean;
  isDeactivated: boolean;
  _id: string;
  companyName: string;
  profileSlug: string;
}

export interface ISessionData {
  user: {
    accessToken: string;
    me: IUser;
  };
  expires: ISODateString;
}

export interface IExtendedSession extends Session {
  data: ISessionData;
  status: "authenticated" | "unauthenticated" | "loading";
}
