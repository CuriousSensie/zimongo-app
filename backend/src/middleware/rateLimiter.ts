import rateLimit from "express-rate-limit";
import { CustomRequest } from "../types/request";
import { NextFunction, Response } from "express";

const loginLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 15 minutes
  max: 5,
  handler: (req: CustomRequest, res: Response, next: NextFunction) => {
    res.status(429).json({
      success: false,
      message: "Too many requests from this IP, please try again later.",
    });
  },
});

const resetPasswordLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3,
  message: "Too many password reset attempts. Please try again after 30 minutes.",
});

export { loginLimiter, resetPasswordLimiter };
