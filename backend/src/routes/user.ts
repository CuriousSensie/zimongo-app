import bcrypt from "bcrypt";
import express, { Response } from "express";
import User from "../models/User";
import TokenManagement from "../lib/Token";
import { TOKEN_TYPE } from "../constant/tokenType";
import logger from "../config/logger";
import Authentication from "../middleware/auth";
import { CLIENT_APP_URL } from "../constant/env";
import LocationProvider from "../lib/location";
import { generateOtp } from "../lib/otp";
import { loginLimiter } from "../middleware/rateLimiter";
import { CustomRequest } from "../types/request";
import { sendGridGuide } from "../lib/email/SendGridGuide";

const signUpTokenType = {
  employee: "employee",
  company: "company",
};
// Initialize the router
const userRouter = express.Router();

interface SignupPayload {
  email: string;
  name: string;
  password: string;
  ip: string;
}

userRouter.post(
  "/register",
  async (req: CustomRequest<SignupPayload>, res: Response) => {
    try {
      let { email, password, name } = req.body;

      if (!email || !password || !name) {
        console.log(email, password);
        return res.status(400).json({ message: "All fields are required." });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        email,
      });

      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User already exists. Try to login." });
      }

      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      // Create new user
      const user = await User.findOneAndUpdate(
        { email },
        {
          email,
          password,
          name,
          isAdmin: false,
          isBlocked: false,
          isRegistrationCompleted: false,
        },
        {
          new: true,
          upsert: true,
        }
      );

      if (!user) throw new Error("no user present");

      const { otp, expiry } = generateOtp(); //default expiry is 10 min
      user.otp = otp;
      user.otpExpiry = expiry;
      await user.save();

      // otp email
      try {
        await sendGridGuide.sendOTP(user);
      } catch (emailError) {
        logger.error(
          `Failed to send registration OTP to ${user.email}: ${
            (emailError as Error).message
          }`
        );
      }

      return res.status(201).json({
        message: "User created successfully.",
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          isEmailVerified: user.isEmailVerified,
        },
      });
    } catch (error) {
      console.log(error);
      logger.error((error as Error).message);
      return res.status(500).json({ message: (error as Error).message });
    }
  }
);

userRouter.patch(
  "/:userId/deactivate",
  Authentication.Admin,
  async (req: CustomRequest, res) => {
    try {
      const { user: admin } = req.context!;
      const userId = req.params.userId;
      const { reason } = req.body;
      let errorMessage = "";
      let emailStatus = "failed";
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Invalid userId",
        });
      }

      user.isDeactivated = !user.isDeactivated;
      await user.save();
      const link = "http://localhost:3000/signin"; // TODO: make dynamic
      try {
        sendGridGuide.sendUserDeactivationEmail(
          user,
          user.isDeactivated,
          link,
          reason
        );
        emailStatus = "sent";
      } catch (emailError) {
        errorMessage = (emailError as Error).message;
        logger.error(`Failed to send deactivation email: ${errorMessage}`);
      }

      return res.status(200).json({
        success: true,
        message: `User ${
          user.isDeactivated ? "deactivated" : "activated"
        } successfully`,
        data: {
          _id: user._id,
          email: user.email,
          name: user.name,
          isDeactivated: user.isDeactivated,
        },
      });
    } catch (error) {
      logger.error((error as Error).message);
      return res.status(500).json({
        error: (error as Error).message,
        message: "Error while deactivating user",
      });
    }
  }
);

userRouter.post(
  "/login",
  loginLimiter,
  async (
    req: CustomRequest<{
      email: string;
      password: string;
      ip: string;
      isRemember: any;
    }>,
    res: Response
  ) => {
    try {
      const { email, password, ip, isRemember } = req.body;
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "invalid credentials" });
      }

      if (user?.isDeactivated) {
        return res
          .status(403)
          .json({ status: 403, message: "User deactivated" });
      }

      if (!user.isEmailVerified) {
        return res
          .status(403)
          .json({ status: 403, message: "Verify your email first." });
      }

      // Compare the provided password with the stored hashed password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      const rememberMe =
        isRemember === "true" ? true : isRemember === "false" ? false : false;

      const token = TokenManagement.createToken(
        {
          _id: user._id,
          email: user.email,
          isAdmin: user.isAdmin,
          isEmailVerified: user.isEmailVerified,
        },
        TOKEN_TYPE.login,
        rememberMe
      );

      if (user.is2FA) {
        const { otp, expiry } = generateOtp(); //default expiry is 10 min
        user.otp = otp;
        user.otpExpiry = expiry;
        await user.save();

        // otp email
        try {
          await sendGridGuide.sendOTP(user);
        } catch (emailError) {
          logger.error(
            `Failed to send registration OTP to ${user.email}: ${
              (emailError as Error).message
            }`
          );
        }

        return res.status(201).json({
          message: "An OTP was sent to your mail.",
          token,
          is2FA: true,
          user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin,
            isEmailVerified: user.isEmailVerified,
            profileSlug: user.profileSlug,
          },
        });
      }

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          isEmailVerified: user.isEmailVerified,
          profileSlug: user.profileSlug,
        },
      });
    } catch (error) {
      logger.error((error as Error).message);
      return res.status(500).json({ message: "Internal server erro" });
    }
  }
);

// get users location
userRouter.get("/location", async (req, res) => {
  try {
    const ip = req.ip;

    let location: string | undefined;
    let country: string | undefined;

    if (ip) {
      location = await LocationProvider.getLocation(ip);
      country = await LocationProvider.getCountryFromIP(ip);
    }

    return res.status(200).json({
      msg: "Location Fetching successfull",
      data: {
        ip: ip,
        location: location,
        country: country,
      },
    });
  } catch (error) {}
});

userRouter.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, ip } = req.body;
    if (!email || !otp) {
      return res.status(404).json({ message: "Email and OTP is required." });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    console.log(otp);
    if (!user.otp || user.otp !== Number(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry && new Date() > user.otpExpiry) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    const Location = await LocationProvider.getLocation(ip);
    if (!user.knownIps?.includes(ip)) {
      user.knownIps.push(ip);
    }

    if (!user.knownLocation?.includes(Location)) {
      user.knownLocation.push(Location);
    }

    user.isEmailVerified = true;
    user.otp = 0;
    user.otpExpiry = undefined;
    await user.save();

    // redirection logic to be implemented
    await sendGridGuide.emailVerificationSuccess(user, "http://localhost:3000");
    res
      .status(200)
      .json({ message: "Email verified successfully. You can now login." });
  } catch (error) {
    logger.error((error as Error).message);
    return res.status(500).json({ message: (error as Error).message });
  }
});

userRouter.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const { otp, expiry } = generateOtp();
    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    try {
      await sendGridGuide.sendOTP(user);
    } catch (emailError) {
      logger.error(
        `Failed to send resend OTP to ${user.email}: ${
          (emailError as Error).message
        }`
      );
    }

    res.status(200).json({ message: "OTP resent" });
  } catch (error) {
    logger.error((error as Error).message);
    return res.status(500).json({ message: (error as Error).message });
  }
});

userRouter.get(
  "/verification/status",
  Authentication.User as any,
  async (req: CustomRequest, res) => {
    try {
      const { user } = req.context!;

      res.status(200).json({
        message: "User verification status",
        isEmailVerified: user.isEmailVerified,
      });
    } catch (error) {
      logger.error((error as Error).message);
      return res.status(500).json({ message: (error as Error).message });
    }
  }
);

userRouter.post("/reset-password/confirm", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }, { password: 0 });
    if (user) {
      const payload = {
        email: user.email,
        isResetPassword: true,
      };
      const token = TokenManagement.createToken(
        payload,
        TOKEN_TYPE.resetPassword
      );
      user.resetToken = token;
      await user.save();
      // const company = await user.getCompany();
      // if (company && company?.epDomain) {
      //   const link = `${addSubdomain(
      //     company?.epDomain,
      //     CLIENT_APP_URL
      //   )}/auth/confirm-password?token=${token}`;
      //   await sendGridGuide.sendForgotPassword(user, link);
      // }

      return res.json({ token, message: "Email changed request processed" });
    }
    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    logger.error((error as Error).message);
    return res.status(500).json({ message: (error as Error).message });
  }
});

userRouter.post("/reset-password/verify", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      throw new Error("Invalid request");
    }
    await TokenManagement.verify(token);
    const user = await User.findOne({ resetToken: token });
    if (user) {
      res.status(200).json({ message: "token authorized" });
    } else {
      throw new Error("Invalid token");
    }
  } catch (error) {
    logger.error((error as Error).message);
    return res.status(500).json({ message: (error as Error).message });
  }
});

userRouter.put("/reset-password", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      throw new Error("Invalid request");
    }
    await TokenManagement.verify(token);
    const user = await User.findOne({ resetToken: req.body.token });
    if (user) {
      user.password = req.body.password;
      user.resetToken = "";
      await user.save();
      res.status(201).json({ message: "password updated successfully" });
    } else {
      throw new Error("Invalid token");
    }
  } catch (error) {
    logger.error((error as Error).message);
    return res.status(500).json({ message: (error as Error).message });
  }
});

export default userRouter;
