import { NextFunction, Request, Response } from "express";

export const requestLogger = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    next();
  } catch (err) {
    throw new Error("error");
  }
};
