import TokenManagement from "../lib/Token";
import User, { IUser } from "../models/User";
import { Response, NextFunction } from "express";
import { CustomRequest, RequestContext } from "../types/request";
import { TOKEN_TYPE } from "../constant/tokenType";
import { attachInContext } from "./entity";

// Define interfaces for the context and token payload

interface TokenPayload {
  _id?: string;
  email?: string;
  isAdmin?: boolean;
}

class Authentication {
  constructor() { }

  static async Admin(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const token =
        req.headers.authorization?.split(" ")[1] || req.headers.authorization;
      if (!token) {
        throw new Error("Token not present");
      }
      const rawUser = (await TokenManagement.verify(token)) as {
        tokenType: string;
        isAdmin: boolean;
        _id: string;
      };
      if (rawUser.tokenType !== TOKEN_TYPE.login)
        throw new Error("Invalid token!");
      if (!rawUser.isAdmin) {
        throw new Error("Access Denied");
      }
      const user = await User.findById(rawUser._id);
      if (!user) throw new Error("Access Denied");
      const context = attachInContext(req.context);

      context.user = user;
      req.context = context;
      next();
    } catch (error) {
      res.status(401).send({
        message: (error as Error).message,
      });
    }
  }

  static async User(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const token =
        req.headers.authorization?.split(" ")[1] || req.headers.authorization;
      if (!token) {
        throw new Error("Token not present");
      }
      const rawUser = (await TokenManagement.verify(token)) as {
        tokenType: string;
        isAdmin: boolean;
        _id: string;
      };
      if (rawUser.tokenType !== TOKEN_TYPE.login)
        throw new Error("Invalid token!");
      const user = await User.findById(rawUser._id);
      if (!user) throw new Error("Access Denied");

      const context = attachInContext(req.context);

      context.user = user;
      req.context = context;

      if (req.context?.user?.isBlocked) {
        res.status(401).json({ message: "user is blocked" });
      }
      if (user.isDeactivated) {
        return res
          .status(403)
          .json({ message: "Your account has been deactivated" });
      }

      next();
    } catch (error) {
      res.status(401).send({
        message: (error as Error).message,
      });
    }
  }

  // static async Vendor(req: CustomRequest, res: Response, next: NextFunction) {
  //   try {
  //     const token =
  //       req.headers.authorization?.split(" ")[1] || req.headers.authorization;
  //     if (!token) {
  //       throw new Error("Token not present");
  //     }
  //     const rawUser = (await TokenManagement.verify(token)) as {
  //       tokenType: string;
  //       isAdmin: boolean;
  //       _id: string;
  //     };
  //     if (rawUser.tokenType !== TOKEN_TYPE.login)
  //       throw new Error("Invalid token!");
  //     const vendor = await Vendor.findById(rawUser._id);
  //     if (!vendor) throw new Error("Access Denied");

  //     const context = attachInContext(req.context);

  //     context.vendor = vendor;
  //     req.context = context;

  //     next();
  //   } catch (error) {
  //     res.status(401).send({
  //       message: (error as Error).message,
  //     });
  //   }
  // }

  // static async CustomerOrVendor(
  //   req: CustomRequest,
  //   res: Response,
  //   next: NextFunction
  // ) {
  //   try {
  //     const token =
  //       req.headers.authorization?.split(" ")[1] || req.headers.authorization;
  //     if (!token) {
  //       throw new Error("Token not present");
  //     }
  //     const rawUser = (await TokenManagement.verify(token)) as {
  //       tokenType: string;
  //       isAdmin: boolean;
  //       _id: string;
  //     };
  //     if (rawUser.tokenType !== TOKEN_TYPE.login)
  //       throw new Error("Invalid token!");
  //     const vendor = await Vendor.findById(rawUser._id);
  //     if (!vendor) {
  //       const user = await User.findById(rawUser._id);
  //       if (!user) throw new Error("Access Denied");
  //       const context = attachInContext(req.context);
  //       context.user = user;
  //       req.context = context;
  //     } else {
  //       const context = attachInContext(req.context);
  //       context.vendor = vendor;
  //       req.context = context;
  //     }

  //     next();
  //   } catch (error) {
  //     res.status(401).send({
  //       message: (error as Error).message,
  //     });
  //   }
  // }

  // static async CustomerOrSuperAdmin(
  //   req: CustomRequest,
  //   res: Response,
  //   next: NextFunction
  // ) {
  //   try {
  //     const token =
  //       req.headers.authorization?.split(" ")[1] || req.headers.authorization;
  //     if (!token) {
  //       throw new Error("Token not present");
  //     }

  //     const rawUser = (await TokenManagement.verify(token)) as {
  //       tokenType: string;
  //       isAdmin: boolean;
  //       _id: string;
  //     };

  //     if (rawUser.tokenType !== TOKEN_TYPE.login)
  //       throw new Error("Invalid token!");

  //     const user = await User.findById(rawUser._id);
  //     if (!user) throw new Error("Access Denied");

  //     const context = attachInContext(req.context);
  //     context.user = user;
  //     req.context = context;

  //     if (user.isBlocked) {
  //       return res.status(401).json({ message: "User is blocked" });
  //     }

  //     if (user.isDeactivated) {
  //       return res.status(403).json({ message: "Your account has been deactivated" });
  //     }

  //     if (typeof user.isAdmin !== "boolean") {
  //       return res.status(403).json({ message: "Forbidden access" });
  //     }

  //     next();
  //   } catch (error) {
  //     res.status(401).send({
  //       message: (error as Error).message,
  //     });
  //   }
  // }
}

export default Authentication;
