import { Account, User } from "next-auth";
import { JWT } from "next-auth/jwt";

export interface IUserBasic {
  email: string;
  name: string;
  isAdmin: boolean;
  picture: string;
  username?: string;
  companyName?: string;
  contactPersonName?: string;
}

export interface IUser extends User {
  auth: Account | null;
  token: string;
  refreshToken: string | null;
  user: IUserBasic;
  is2FA?: boolean | undefined;
  isSuperAdmin?: boolean;
}

export interface ICallback {
  token: JWT;
  account: Account | null;
  user: IUser;
}

export interface ISessionUser {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: string;
  me: IUserBasic;
  is2FA?: boolean | undefined;
  isSuperAdmin?: boolean;
}