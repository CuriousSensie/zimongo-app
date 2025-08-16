import { NextFunction, Response } from "express";
import { CustomRequest, RequestContext } from "../types/request";

export const attachInContext = (context?: RequestContext): RequestContext => {
  if (!context) {
    context = {} as RequestContext;
  }
  return context;
};
