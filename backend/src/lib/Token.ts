import jwt from "jsonwebtoken";
import { TOKEN_TYPE } from "../constant/tokenType";
import { JWT_SECRET } from "../constant/env";

const secret = JWT_SECRET;

interface ITokenPayload {
  tokenType: string;
  isAdmin: boolean;
  _id: string;
  email: string;
}
interface ISignupTokenPayload  {
  email: string;
  name: string;
  exp: number;
  iat: number;
}

class Token {
  constructor() {}

  createToken(
    payload: Record<string, unknown>,
    tokenType = TOKEN_TYPE.login,
    rememberMe?: boolean
  ): string {
    const expiresIn = rememberMe ? "24h" : "12h";
    return jwt.sign({ ...payload, tokenType }, secret, { expiresIn });
  }
  generateSignupToken(payload: Record<string, unknown>): string {
    return jwt.sign({ ...payload }, secret);
  }

  verifySignupToken(token: string): Promise<ISignupTokenPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err, payload) => {
        if (err) {
          reject(err);
        } else if (!payload) {
          reject("nothing found");
        } else {
          resolve(payload as ISignupTokenPayload);
        }
      });
    });
  }
  verify(token: string): Promise<ITokenPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err, payload) => {
        if (err) {
          reject(err);
        } else if (!payload) {
          reject("No user");
        } else {
          resolve(payload as unknown as ITokenPayload);
        }
      });
    });
  }
}
const TokenManagement = new Token();
export default TokenManagement;
