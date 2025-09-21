import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./src/middleware/errorHandler";
import { MONGODB_URL, PORT } from "./src/constant/env";
//routes import
import { app, server } from "./src/config/server";

import path from "path";
import morgan from "morgan";
import userRouter from "./src/routes/user";
import LocationProvider from "./src/lib/location";
import profileRouter from "./src/routes/profile";
import fileRouter from "./src/routes/file";
import leadRouter from "./src/routes/lead";
import interactionRouter from "./src/routes/interaction";

dotenv.config();

const port = process.env.PORT || 5000;

// Middleware - CORS is already configured in socket server
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // ONLY ALLOW PRODUCTION and DEV DOMAINS
      if (
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.includes("lvh.me")
      ) {
        return callback(null, true);
      }

      // Allow staging domains
      if (
        origin.includes("zimongo-app.vercel.app") ||
        origin.includes(".vercel.app")
      ) {
        return callback(null, true);
      }

      // Allow production domains
      if (
        origin.includes("zimongo.com")
      ) {
        return callback(null, true);
      }

      // Allow storage app domains

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// use trust proxy to get ip
app.set("trust proxy", 1);

app.get("/location", async (req, res) => {
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

// app.set('trust proxy', false);

// define all routes
app.get("/api/test", async (req, res) => {
  return res.status(200).json({ message: "Server working!" });
});
app.use("/api/user", userRouter);
app.use("/api/profile", profileRouter);
app.use("/api/lead", leadRouter);
app.use("/api/interaction", interactionRouter);
app.use("/api/file", fileRouter);

// Error handling middleware
app.use(errorHandler);

// Database connection
mongoose
  .connect(MONGODB_URL)
  .then(async () => {
    console.log("Connected to MongoDB");

    // Initialize compliance system on startup
    // await initializeComplianceSystem();

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

export default app;
