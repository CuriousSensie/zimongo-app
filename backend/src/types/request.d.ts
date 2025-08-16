import { Document } from "mongoose";
import { IUser } from "../models/User";
import { Request } from "express"; // <-- NOT from "node-fetch" or DOM types

export interface RequestContext {
  user: IUser
}

export interface CustomRequest<Body = any, Params = any, Query = any>
  extends Request<Params, any, Body, Query> {
  context?: RequestContext;
}