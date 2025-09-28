import express, { Response } from "express";
import Authentication from "../middleware/auth";
import { CustomRequest } from "../types/request";
import User from "../models/User";
import Report from "../models/Report";
import logger from "../config/logger";

const reportRouter = express.Router();

// Report user endpoint
reportRouter.post(
  "/user/:userId",
  Authentication.User,
  async (req: CustomRequest, res) => {
    try {
      const { user: reporter } = req.context!;
      const { userId: reportedUserId } = req.params;
      const { reason } = req.body;

      // Check if reported user exists
      const reportedUser = await User.findById(reportedUserId);
      if (!reportedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Prevent self-reporting
      if ((reporter._id as string).toString() === reportedUserId) {
        return res.status(400).json({ message: "Cannot report yourself" });
      }

      // Check if already reported by this user
      const existingReport = await Report.findOne({
        reporterId: reporter._id,
        reportedUserId: reportedUserId,
      });

      if (existingReport) {
        return res.status(400).json({
          message: "You have already reported this user",
        });
      }

      // Create new report
      const report = new Report({
        reporterId: reporter._id,
        reportedUserId: reportedUserId,
        reason: reason || "",
      });

      await report.save();

      // Increment reported count
      await User.findByIdAndUpdate(reportedUserId, {
        $inc: { reportedCount: 1 },
      });

      return res.status(201).json({
        message: "User reported successfully",
        report: {
          _id: report._id,
          reportedUserId: report.reportedUserId,
          reason: report.reason,
          createdAt: report.createdAt,
        },
      });
    } catch (error) {
      logger.error((error as Error).message);
      return res.status(500).json({ message: (error as Error).message });
    }
  }
);

export default reportRouter;