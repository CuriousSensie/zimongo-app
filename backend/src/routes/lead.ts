import express, { Response } from "express";
import Lead, { ILead, LeadIntent, LeadType, ProductInfo, ServiceInfo } from "../models/Lead";
import User from "../models/User";
import Profile from "../models/Profile";
import Authentication from "../middleware/auth";
import { CustomRequest } from "../types/request";
import logger from "../config/logger";
import { fileUpload } from "../middleware/file";
import { Types } from "mongoose";
import Permission from "../models/Permission";
import { generateOtp } from "../lib/otp";
import { sendGridGuide } from "../lib/email/SendGridGuide";

const leadRouter = express.Router();

// Interface for lead creation payload
interface CreateLeadPayload {
  leadIntent: LeadIntent;
  leadType: LeadType;
  title: string;
  description: string;
  productInfo?: ProductInfo;
  serviceInfo?: ServiceInfo;
  budget?: number;
  currency?: string;
  location: {
    country: string;
    state: string;
    city: string;
    address?: string;
    zipCode?: string;
  };
  priority?: string;
  expiryDate?: string;
  isPublic?: boolean;
}

// Create a new lead
leadRouter.post(
  "/create",
  Authentication.User,
  async (req: CustomRequest<CreateLeadPayload>, res: Response) => {
    try {
      const userId = req.context?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const {
        leadIntent,
        leadType,
        title,
        description,
        productInfo,
        serviceInfo,
        budget,
        currency,
        location,
        priority,
        expiryDate,
        isPublic,
      } = req.body;

      // Validate required fields
      if (!leadIntent || !leadType || !title || !description || !location) {
        return res.status(400).json({
          message: "Lead type, title, description, and location are required",
        });
      }

      // Validate lead type specific information
      if (leadType === LeadType.PRODUCT && !productInfo) {
        return res.status(400).json({
          message: "Product information is required for product leads",
        });
      }

      if (leadType === LeadType.SERVICE && !serviceInfo) {
        return res.status(400).json({
          message: "Service information is required for service leads",
        });
      }

      // Get user's profile if exists
      const userProfile = await Profile.findOne({ userId });

      if (!userProfile) {
        return res.status(404).json({ message: "User profile not found" });
      }

      // check permissions
      const permssion = await Permission.findOne({
        profileId: userProfile._id,
      });
      if (!permssion) {
        return res.status(404).json({ message: "User permission not found" });
      }

      if (!permssion.canSellProducts && leadType === LeadType.PRODUCT && leadIntent === "sell") {
        return res
          .status(403)
          .json({ message: "User does not have permission to sell products." });
      } else if (!permssion.canSellServices && leadType === LeadType.SERVICE && leadIntent === "sell") {
        return res
          .status(403)
          .json({ message: "User does not have permission to sell services." });
      }

      // Create the lead
      const leadData: Partial<ILead> = {
        userId,
        profileId: userProfile?._id as Types.ObjectId,
        leadIntent,
        leadType,
        title,
        description,
        budget,
        currency: currency || "USD",
        location,
        priority: priority || "medium",
        isPublic: isPublic !== undefined ? isPublic : true,
      };

      // Add type-specific information
      if (leadType === LeadType.PRODUCT) {
        if (!productInfo?.productFiles || productInfo.productFiles.length === 0) {
          return res
            .status(400)
            .json({ message: "At least one image are required for product leads" });
        }
        leadData.productInfo = productInfo;
      } else {
        leadData.serviceInfo = serviceInfo;
      }

      // Set expiry date if provided
      if (expiryDate) {
        leadData.expiryDate = new Date(expiryDate);
      }

      const newLead = new Lead(leadData);
      await newLead.save();

      logger.info(`Lead created successfully by user ${userId}`, {
        leadId: newLead._id,
        leadType,
        title,
      });

      res.status(201).json({
        message: "Lead created successfully",
        data: newLead,
      });
    } catch (error: any) {
      logger.error("Error creating lead:", error);
      res.status(500).json({
        message: "Failed to create lead",
        error: error.message,
      });
    }
  }
);

// Get all leads with filtering and pagination
leadRouter.get("/", async (req: CustomRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 5,
      leadIntent,
      leadType,
      status,
      country,
      state,
      city,
      category,
      minBudget,
      maxBudget,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter query
    const filter: any = {
      isPublic: true,
      status: { $ne: "inactive" },
    };

    // Add filters
    if (leadType) filter.leadType = leadType;
    if (status) filter.status = status;
    if (country) filter["location.country"] = country;
    if (state) filter["location.state"] = state;
    if (city) filter["location.city"] = city;
    if (leadIntent) filter.leadIntent = leadIntent;

    // Budget range filter
    if (minBudget || maxBudget) {
      filter.budget = {};
      if (minBudget) filter.budget.$gte = Number(minBudget);
      if (maxBudget) filter.budget.$lte = Number(maxBudget);
    }

    // Category filter (for both product and service)
    if (category) {
      filter.$or = [
        { "productInfo.productCategory": { $regex: category, $options: "i" } },
        { "serviceInfo.serviceCategory": { $regex: category, $options: "i" } },
      ];
    }

    // Exclude expired leads
    filter.$or = [{ expiryDate: { $gt: new Date() } }, { expiryDate: null }];

    // Pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === "asc" ? 1 : -1;

    // Execute query
    const leads = await Lead.find(filter)
      .populate("userId", "name email")
      .populate("profileId", "companyName slug")
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const totalLeads = await Lead.countDocuments(filter);
    const totalPages = Math.ceil(totalLeads / limitNum);

    res.status(200).json({
      message: "Leads retrieved successfully",
      data: {
        leads,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalLeads,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error: any) {
    logger.error("Error fetching leads:", error);
    res.status(500).json({
      message: "Failed to fetch leads",
      error: error.message,
    });
  }
});

// Get leads by user (authenticated route)
leadRouter.get(
  "/my-leads",
  Authentication.User,
  async (req: CustomRequest, res: Response) => {
    try {
      const userId = req?.context?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const {
        page = 1,
        limit = 10,
        search,
        leadIntent,
        status,
        leadType,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      // Build filter query
      const filter: any = { userId };
      if (search && search !== "") {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }
      if (leadIntent && leadIntent !== "all") filter.leadIntent = leadIntent;
      if (status && status !== "all") filter.status = status;
      if (leadType && leadType !== "all") filter.leadType = leadType;

      // Pagination
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(50, Math.max(1, Number(limit)));
      const skip = (pageNum - 1) * limitNum;

      // Sort options
      const sortOptions: any = {};
      sortOptions[sortBy as string] = sortOrder === "asc" ? 1 : -1;

      // Execute query
      const leads = await Lead.find(filter)
        .populate("profileId", "companyName slug")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

      // Get total count
      const totalLeads = await Lead.countDocuments(filter);
      const totalPages = Math.ceil(totalLeads / limitNum);

      res.status(200).json({
        message: "User leads retrieved successfully",
        data: {
          leads,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalLeads,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
          },
        },
      });
    } catch (error: any) {
      logger.error("Error fetching user leads:", error);
      res.status(500).json({
        message: "Failed to fetch user leads",
        error: error.message,
      });
    }
  }
);

// Get a specific lead by ID (authenticated route)
leadRouter.get(
  "/:id",
  Authentication.User,
  async (req: CustomRequest, res: Response) => {
    try {
      const { id } = req.params;

      const lead = await Lead.findById(id)
        .populate("userId", "name email")
        .populate("profileId", "companyName slug website mobile");

      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      res.status(200).json({
        message: "Lead retrieved successfully",
        data: lead
      });

    } catch (error: any) {
      logger.error("Error fetching lead:", error);
      res.status(500).json({
        message: "Failed to fetch lead",
        error: error.message
      });
    }
  }
);

// Update a lead
// leadRouter.put(
//   "/:id",
//   Authentication.User,
//   async (req: CustomRequest<CreateLeadPayload>, res: Response) => {
//     try {
//       const userId = req?.context?.user?.id;
//       const { id } = req.params;

//       if (!userId) {
//         return res.status(401).json({ message: "User not authenticated" });
//       }

//       // Find the lead and check ownership
//       const lead = await Lead.findById(id);
//       if (!lead) {
//         return res.status(404).json({ message: "Lead not found" });
//       }

//       if (lead.userId.toString() !== userId) {
//         return res.status(403).json({ message: "Not authorized to update this lead" });
//       }

//       // Update the lead
//       const updateData = { ...req.body };

//       // Handle expiry date conversion
//       if (updateData.expiryDate) {
//         updateData.expiryDate = new Date(updateData.expiryDate);
//       }

//       const updatedLead = await Lead.findByIdAndUpdate(
//         id,
//         updateData,
//         { new: true, runValidators: true }
//       ).populate([
//         { path: "userId", select: "name email" },
//         { path: "profileId", select: "companyName slug" }
//       ]);

//       logger.info(`Lead updated successfully by user ${userId}`, {
//         leadId: id
//       });

//       res.status(200).json({
//         message: "Lead updated successfully",
//         data: updatedLead
//       });

//     } catch (error: any) {
//       logger.error("Error updating lead:", error);
//       res.status(500).json({
//         message: "Failed to update lead",
//         error: error.message
//       });
//     }
//   }
// );

// Delete a lead
// leadRouter.delete(
//   "/:id",
//   Authentication,
//   async (req: CustomRequest, res: Response) => {
//     try {
//       const userId = req.user?.id;
//       const { id } = req.params;

//       if (!userId) {
//         return res.status(401).json({ message: "User not authenticated" });
//       }

//       // Find the lead and check ownership
//       const lead = await Lead.findById(id);
//       if (!lead) {
//         return res.status(404).json({ message: "Lead not found" });
//       }

//       if (lead.userId.toString() !== userId) {
//         return res.status(403).json({ message: "Not authorized to delete this lead" });
//       }

//       await Lead.findByIdAndDelete(id);

//       logger.info(`Lead deleted successfully by user ${userId}`, {
//         leadId: id
//       });

//       res.status(200).json({
//         message: "Lead deleted successfully"
//       });

//     } catch (error: any) {
//       logger.error("Error deleting lead:", error);
//       res.status(500).json({
//         message: "Failed to delete lead",
//         error: error.message
//       });
//     }
//   }
// );

// send verification otp
leadRouter.post(
  "/:id/verify",
  Authentication.User,
  async (req: CustomRequest, res: Response) => {
    try {
      const userId = req?.context?.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Find the lead and check ownership
      const lead = await Lead.findById(id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      if (lead.userId.toString() !== userId) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this lead" });
      }

      if (lead.isVerified) {
        return res.status(400).json({ message: "Lead is already verified" });
      }

      const { otp, expiry } = generateOtp(); //default expiry is 10 min
      lead.otp = otp;
      lead.otpExpiry = expiry;

      await sendGridGuide.leadVerificationOtp(req?.context?.user?.email ?? '', lead);
      await lead.save();

      logger.info(`Lead verification email sent successfully by user ${userId}`, {
        leadId: id,
      });

      res.status(200).json({
        message: "Lead verification email sent.",
        data: lead,
      });
    } catch (error: any) {
      logger.error("Error verifying lead:", error);
      res.status(500).json({
        message: "Failed to verify lead",
        error: error.message,
      });
    }
  }
);

// handle verification
leadRouter.patch(
  "/:id/verify",
  Authentication.User,
  async (req: CustomRequest, res: Response) => {
    try {
      const userId = req?.context?.user?.id;
      const { id } = req.params;
      const { otp } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Find the lead and check ownership
      const lead = await Lead.findById(id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      if (lead.userId.toString() !== userId) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this lead" });
      }

      if (lead.isVerified) {
        return res.status(400).json({ message: "Lead is already verified" });
      }

      if (!lead.otp || lead.otp !== Number(otp)) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      lead.isVerified = true;
      await lead.save();

      logger.info(`Lead verified successfully by user ${userId}`, {
        leadId: id,
      });

      res.status(200).json({
        message: "Lead verified successfully",
      });
    } catch (error: any) {
      logger.error("Error verifying lead:", error);
      res.status(500).json({
        message: "Failed to verify lead",
        error: error.message,
      });
    }
  }
);

// Update lead status
leadRouter.patch(
  "/:id/status",
  Authentication.User,
  async (req: CustomRequest<{ status: string }>, res: Response) => {
    try {
      const userId = req?.context?.user?.id;
      const { id } = req.params;
      const { status } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!["inactive", "active", "closed", "expired"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Find the lead and check ownership
      const lead = await Lead.findById(id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      if (lead.userId.toString() !== userId) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this lead" });
      }

      lead.status = status;
      await lead.save();

      res.status(200).json({
        message: "Lead status updated successfully",
        data: { status: lead.status },
      });
    } catch (error: any) {
      logger.error("Error updating lead status:", error);
      res.status(500).json({
        message: "Failed to update lead status",
        error: error.message,
      });
    }
  }
);

// Upload files for a lead
leadRouter.post(
  "/:id/upload",
  Authentication.User,
  fileUpload.array("files", 5), // Allow up to 5 files
  async (req: CustomRequest, res: Response) => {
    try {
      const userId = req?.context?.user?.id;
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      // Find the lead and check ownership
      const lead = await Lead.findById(id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      if (lead.userId.toString() !== userId) {
        return res
          .status(403)
          .json({ message: "Not authorized to upload files for this lead" });
      }

      // Process uploaded files
      const uploadedFiles = files.map((file) => ({
        type: file.mimetype,
        path: file.path,
        originalName: file.originalname,
        size: file.size,
      }));

      // Add files to appropriate array based on lead type
      if (lead.leadType === LeadType.PRODUCT && lead.productInfo) {
        if (!lead.productInfo.productFiles) {
          lead.productInfo.productFiles = [];
        }
        lead.productInfo.productFiles.push(...uploadedFiles);
      } else if (lead.leadType === LeadType.SERVICE && lead.serviceInfo) {
        if (!lead.serviceInfo.serviceDocuments) {
          lead.serviceInfo.serviceDocuments = [];
        }
        lead.serviceInfo.serviceDocuments.push(...uploadedFiles);
      }

      await lead.save();

      res.status(200).json({
        message: "Files uploaded successfully",
        data: {
          uploadedFiles: uploadedFiles.length,
          files: uploadedFiles,
        },
      });
    } catch (error: any) {
      logger.error("Error uploading lead files:", error);
      res.status(500).json({
        message: "Failed to upload files",
        error: error.message,
      });
    }
  }
);

export default leadRouter;
