import express from "express";
import cors from "cors";
import http from "http";
import { SocketServer } from "./socket";

export const app = express();

// Configure CORS to allow subdomain requests
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost and subdomain requests
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow production domains
    if (origin.includes('eprocure365.com') || origin.includes('ep365.com')) {
      return callback(null, true);
    }
    
    // Allow DigitalOcean app domains
    if (origin.includes('ondigitalocean.app')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

export const server = http.createServer(app);
export const socket = new SocketServer(server); 
