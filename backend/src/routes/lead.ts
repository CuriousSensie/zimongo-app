import express, { Response } from "express";
import Lead, {
  ILead,
  LeadIntent,
  LeadType,
  ProductInfo,
  ServiceInfo,
} from "../models/Lead";
import Interaction, { InteractionType } from "../models/Interaction";
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
import SavedLead from "../models/SavedLead";

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
        if (
          !productInfo?.productFiles ||
          productInfo.productFiles.length === 0
        ) {
          return res
            .status(400)
            .json({
              message: "At least one image are required for product leads",
            });
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

// get all leads for browsing
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
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter query
    const filter: any = {
      isPublic: true,
      status: "active",
    };

    // Add filters
    if (leadIntent && leadIntent !== "all") {
      if (leadIntent === "buy") filter.leadIntent = LeadIntent.SELL; // convert buy to sell and vv
      else if (leadIntent === "sell") filter.leadIntent = LeadIntent.BUY;
    }
    if (leadType) filter.leadType = leadType;
    if (status) filter.status = status;
    if (country) filter["location.country"] = country;
    if (state) filter["location.state"] = state;
    if (city) filter["location.city"] = city;

    // search (title, description, product/service names)
    if (search && search.trim() !== "") {
      const searchRegex = { $regex: search, $options: "i" };
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { "productInfo.productName": searchRegex },
          { "productInfo.productDescription": searchRegex },
          { "serviceInfo.serviceName": searchRegex },
          { "serviceInfo.serviceDescription": searchRegex },
        ],
      });
    }

    // budget
    if (minBudget || maxBudget) {
      filter.budget = {};
      if (minBudget) filter.budget.$gte = Number(minBudget);
      if (maxBudget) filter.budget.$lte = Number(maxBudget);
    }

    // Category
    if (category && category.trim() !== "") {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { "productInfo.productCategory": { $regex: category, $options: "i" } },
          { "serviceInfo.serviceCategory": { $regex: category, $options: "i" } },
        ],
      });
    }

    // Exclude expired leads
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [{ expiryDate: { $gt: new Date() } }, { expiryDate: null }],
    });

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
        leadType,
        status,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      // update expired leads (leads that have expired but their statistus is notupdated yet)
      await Lead.updateMany(
        {
          userId,
          expiryDate: { $lt: new Date() },
          status: { $ne: "expired" }
        },
        { status: "expired" }
      );

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

// get leads by profile ID
leadRouter.get(
  "/profile/:profileId",
  Authentication.User,
  async (req: CustomRequest, res: Response) => {
    try {
      const { profileId } = req.params;
      const { limit = 10, page = 1 } = req.query;

      if (!profileId) {
        return res.status(400).json({ msg: "Profile ID is required." });
      }

      const leads = await Lead.find({
        profileId,
        status: "active",
        isPublic: true,
      })
        .populate("profileId", "companyName slug")
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      res.status(200).json({
        msg: "Leads fetched successfully.",
        data: leads,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal server error." });
    }
  }
);

// Get a specific lead by ID (authenticated route)
leadRouter.get(
  "/lead-by-id/:id",
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

// Increment view count for a lead
leadRouter.post(
  "/:id/view",
  async (req: CustomRequest, res: Response) => {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }

      const lead = await Lead.findById(id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      // Increment the view count
      await lead.incrementViews();

      res.status(200).json({
        message: "View count incremented successfully",
        views: lead.views
      });
    } catch (error: any) {
      logger.error("Error incrementing view count:", error);
      res.status(500).json({
        message: "Failed to increment view count",
        error: error.message
      });
    }
  }
);

// ? not allowing users to update leads for now
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
leadRouter.delete(
  "/:id",
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
          .json({ message: "Not authorized to delete this lead" });
      }

      await Lead.findByIdAndDelete(id);

      logger.info(`Lead deleted successfully by user ${userId}`, {
        leadId: id,
      });

      res.status(200).json({
        message: "Lead deleted successfully",
      });
    } catch (error: any) {
      logger.error("Error deleting lead:", error);
      res.status(500).json({
        message: "Failed to delete lead",
        error: error.message,
      });
    }
  }
);

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

      // handle activation
      if (!lead.isVerified && status === "active") {
        return res
          .status(400)
          .json({ message: "Lead is not verified and cannot be activated" });
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

// Extend lead expiry
leadRouter.patch(
  "/:id/extend-expiry",
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

      // Extend expiry by 30 days from now
      const newExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      lead.expiryDate = newExpiryDate;
      
      // If the lead was expired, reactivate it to inactive status so user can verify/activate
      if (lead.status === "expired") {
        lead.status = lead.isVerified ? "active" : "inactive";
      }
      
      await lead.save();

      logger.info(`Lead expiry extended successfully by user ${userId}`, {
        leadId: id,
        newExpiryDate: newExpiryDate.toISOString(),
      });

      res.status(200).json({
        message: "Lead expiry extended successfully",
        data: { 
          expiryDate: lead.expiryDate,
          status: lead.status
        },
      });
    } catch (error: any) {
      logger.error("Error extending lead expiry:", error);
      res.status(500).json({
        message: "Failed to extend lead expiry",
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

// Save a lead
leadRouter.post(
  "/save/:leadId",
  Authentication.User,
  async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.context?.user?.id;
      const { leadId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Check if user has a profile
      const user = await User.findById(userId);
      if (!user?.profileSlug) {
        return res.status(403).json({ 
          message: "Only users with profiles can save leads. Please complete your profile setup first." 
        });
      }

      // Check if lead exists
      const lead = await Lead.findById(leadId);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      if (!lead.isPublic || lead.status !== "active") {
        return res.status(403).json({ message: "Lead is not available for saving" });
      }

      // Check if already saved
      const existingSave = await SavedLead.findOne({ userId, leadId });
      if (existingSave) {
        return res.status(400).json({ message: "Lead already saved" });
      }

      // Save the lead
      const savedLead = new SavedLead({
        userId,
        leadId
      });
      await savedLead.save();

      // Add interaction
      const interaction = new Interaction({
        leadId: new Types.ObjectId(leadId),
        interactorId: new Types.ObjectId(userId),
        type: InteractionType.SAVE,
        content: "User saved this Lead."
      });
      await interaction.save();

      res.status(201).json({
        message: "Lead saved successfully",
        data: savedLead
      });
    } catch (error: any) {
      logger.error("Error saving lead:", error);
      res.status(500).json({
        message: "Failed to save lead",
        error: error.message
      });
    }
  }
);

// Unsave a lead
leadRouter.delete(
  "/unsave/:leadId",
  Authentication.User,
  async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.context?.user?.id;
      const { leadId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Remove the saved lead
      const deletedSave = await SavedLead.findOneAndDelete({ userId, leadId });
      if (!deletedSave) {
        return res.status(404).json({ message: "Saved lead not found" });
      }

      // Add interaction for unsaving
      const lead = await Lead.findById(leadId);
      if (lead) {
        const interaction = new Interaction({
          leadId: new Types.ObjectId(leadId),
          interactorId: new Types.ObjectId(userId),
          type: InteractionType.UNSAVE,
          content: "User unsaved this lead."
        });
        await interaction.save();
      }

      res.status(200).json({
        message: "Lead unsaved successfully"
      });
    } catch (error: any) {
      logger.error("Error unsaving lead:", error);
      res.status(500).json({
        message: "Failed to unsave lead",
        error: error.message
      });
    }
  }
);

// Get user's saved leads
leadRouter.get(
  "/saved",
  Authentication.User,
  async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.context?.user?.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Get saved leads with populated lead data
      const savedLeads = await SavedLead.find({ userId })
        .populate({
          path: "leadId",
          match: { status: "active", isPublic: true }, // Only show active public leads
          populate: {
            path: "profileId",
            select: "companyName slug"
          }
        })
        .sort({ savedAt: -1 })
        .skip(skip)
        .limit(limit);

      // Filter out saved leads where the lead was deleted or is no longer available
      const validSavedLeads = savedLeads.filter(savedLead => savedLead.leadId);

      // Get total count
      const totalSavedLeads = await SavedLead.countDocuments({ userId });

      res.status(200).json({
        message: "Saved leads retrieved successfully",
        data: {
          savedLeads: validSavedLeads,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalSavedLeads / limit),
            totalSavedLeads,
            hasNext: page * limit < totalSavedLeads,
            hasPrev: page > 1
          }
        }
      });
    } catch (error: any) {
      logger.error("Error fetching saved leads:", error);
      res.status(500).json({
        message: "Failed to fetch saved leads",
        error: error.message
      });
    }
  }
);

// Check if a lead is saved by the current user
leadRouter.get(
  "/is-saved/:leadId",
  Authentication.User,
  async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.context?.user?.id;
      const { leadId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const savedLead = await SavedLead.findOne({ userId, leadId });
      
      res.status(200).json({
        isSaved: !!savedLead
      });
    } catch (error: any) {
      logger.error("Error checking saved status:", error);
      res.status(500).json({
        message: "Failed to check saved status",
        error: error.message
      });
    }
  }
);

// Track lead interaction
leadRouter.post(
  "/:leadId/interaction",
  Authentication.User,
  async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.context?.user?.id;
      const { leadId } = req.params;
      const { type, content } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!type) {
        return res.status(400).json({ message: "Interaction type is required" });
      }

      // Valid interaction types
      const validTypes = [InteractionType.VIEW_DETAILS, InteractionType.VIEW_PROFILE, InteractionType.UPVOTE];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid interaction type" });
      }

      const lead = await Lead.findById(leadId);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      // For upvotes, check if user has already upvoted this lead (as a fallback)
      if (type === InteractionType.UPVOTE) {
        const existingUpvote = await Interaction.findOne({
          leadId: new Types.ObjectId(leadId),
          interactorId: new Types.ObjectId(userId),
          type: InteractionType.UPVOTE
        });

        if (existingUpvote) {
          return res.status(400).json({ 
            message: "You have already upvoted this lead",
            code: "ALREADY_UPVOTED"
          });
        }
      }

      // Create interaction
      const interaction = new Interaction({
        leadId: new Types.ObjectId(leadId),
        interactorId: new Types.ObjectId(userId),
        type,
        content: content || `User ${type.replace('_', ' ')}`
      });
      await interaction.save();

      // If it's an upvote, increment the upvotes count
      if (type === InteractionType.UPVOTE) {
        lead.upvotes += 1;
        await lead.save();
      }

      res.status(200).json({
        message: "Interaction tracked successfully",
        data: { type, timestamp: new Date() }
      });
    } catch (error: any) {
      logger.error("Error tracking interaction:", error);
      res.status(500).json({
        message: "Failed to track interaction",
        error: error.message
      });
    }
  }
);


export default leadRouter;
