import express, { Response } from "express";
import Authentication from "../middleware/auth";
import { CustomRequest } from "../types/request";
import User from "../models/User";
import Report, { ReportType } from "../models/Report";
import Lead from "../models/Lead";
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
        type: ReportType.USER_REPORTING,
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
        type: ReportType.USER_REPORTING,
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

// get all reports for admin
reportRouter.get(
  "/admin/reports",
  Authentication.Admin,
  async (req: CustomRequest, res: Response) => {
    try {
      const { user: currentUser } = req.context!;

      // Check if user is admin
      if (!currentUser.isAdmin) {
        return res.status(403).json({ message: "Access denied. Admin only." });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const type = req.query.type as string;
      const search = (req.query.search as string) || "";

      const skip = (page - 1) * limit;

      // Build filter query
      let filter: any = {};

      if (type && type !== "all") {
        filter.type = type;
      }

      // Get reports with populated data
      const reports = await Report.find(filter)
        .populate("reporterId", "name email")
        .populate("reportedUserId", "name email profileSlug")
        .populate("reportedLeadId", "title description leadType leadIntent")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // If there's a search term, filter after population
      let filteredReports = reports;
      if (search) {
        filteredReports = reports.filter((report: any) => {
          const searchLower = search.toLowerCase();
          
          // Search in reporter info
          if (report.reporterId?.name?.toLowerCase().includes(searchLower) ||
              report.reporterId?.email?.toLowerCase().includes(searchLower)) {
            return true;
          }
          
          // Search in reported user info (for user reports)
          if (report.reportedUserId?.name?.toLowerCase().includes(searchLower) ||
              report.reportedUserId?.email?.toLowerCase().includes(searchLower)) {
            return true;
          }
          
          // Search in reported lead info (for lead reports)
          if (report.reportedLeadId?.title?.toLowerCase().includes(searchLower) ||
              report.reportedLeadId?.description?.toLowerCase().includes(searchLower)) {
            return true;
          }
          
          // Search in reason
          if (report.reason?.toLowerCase().includes(searchLower)) {
            return true;
          }
          
          return false;
        });
      }

      // Get total count for pagination
      const totalReports = await Report.countDocuments(filter);

      return res.status(200).json({
        reports: filteredReports,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalReports / limit),
          totalReports,
          limit,
        },
      });
    } catch (error) {
      logger.error((error as Error).message);
      return res.status(500).json({ message: (error as Error).message });
    }
  }
);

// get report statistics for admin
reportRouter.get(
  "/admin/reports/stats",
  Authentication.Admin,
  async (req: CustomRequest, res: Response) => {
    try {
      const { user: currentUser } = req.context!;

      // Check if user is admin
      if (!currentUser.isAdmin) {
        return res.status(403).json({ message: "Access denied. Admin only." });
      }

      const totalReports = await Report.countDocuments();
      const userReports = await Report.countDocuments({ type: ReportType.USER_REPORTING });
      const leadReports = await Report.countDocuments({ type: ReportType.LEAD_REPORTING });
      const spamFlags = await Report.countDocuments({ type: ReportType.LEAD_SPAM_FLAGGED });

      // Get recent reports (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentReports = await Report.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
      });

      return res.status(200).json({
        totalReports,
        userReports,
        leadReports,
        spamFlags,
        recentReports,
      });
    } catch (error) {
      logger.error((error as Error).message);
      return res.status(500).json({ message: (error as Error).message });
    }
  }
);

// delete a report
reportRouter.delete(
  "/admin/reports/:reportId",
  Authentication.Admin,
  async (req: CustomRequest, res: Response) => {
    try {
      const { user: currentUser } = req.context!;
      const { reportId } = req.params;

      // Check if user is admin
      if (!currentUser.isAdmin) {
        return res.status(403).json({ message: "Access denied. Admin only." });
      }

      const report = await Report.findById(reportId);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      // If it's a user report, decrement the reported count
      if (report.type === ReportType.USER_REPORTING && report.reportedUserId) {
        await User.findByIdAndUpdate(report.reportedUserId, {
          $inc: { reportedCount: -1 }
        });
      }

      await Report.findByIdAndDelete(reportId);

      logger.info(`Admin ${currentUser._id} deleted report ${reportId}`);

      return res.status(200).json({
        message: "Report deleted successfully"
      });
    } catch (error) {
      logger.error((error as Error).message);
      return res.status(500).json({ message: (error as Error).message });
    }
  }
);

export default reportRouter;