import dotenv from "dotenv";
dotenv.config();

export const MONGODB_URL = process.env.MONGO_URL || '';
export const PORT = process.env.PORT || 5000; 
export const JWT_SECRET = process.env.JWT_SECRET || '';
export const CLIENT_APP_URL =
  process.env.CLIENT_APP_URL || "http://localhost:3000";
export const SOCKET_API_URL =
  process.env.SOCKET_API_URL || "http://localhost:5000";
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
export const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || '';

export const S3_REGION = process.env.S3_REGION || '';
export const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || '';
export const S3_SECRET_KEY = process.env.S3_SECRET_KEY || '';
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || '';