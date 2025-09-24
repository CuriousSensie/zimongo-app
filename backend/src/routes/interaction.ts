import express, { Response } from "express";
import Interaction, { IInteraction, InteractionType } from "../models/Interaction";
import Lead from "../models/Lead";
import Authentication from "../middleware/auth";
import { CustomRequest } from "../types/request";
import logger from "../config/logger";
import { Types } from "mongoose";

const interactionRouter = express.Router();

// Create a new interaction
interactionRouter.post(
  "/create",
  Authentication.User,
  async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.context?.user?.id;
      const { leadId, type, content, metadata } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!leadId || !type) {
        return res.status(400).json({ message: "Lead ID and type are required" });
      }

      // Validate interaction type
      if (!Object.values(InteractionType).includes(type)) {
        return res.status(400).json({ message: "Invalid interaction type" });
      }

      // Check if lead exists
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

      // Create the interaction
      const interactionData: Partial<IInteraction> = {
        leadId: new Types.ObjectId(leadId),
        interactorId: new Types.ObjectId(userId),
        type,
        content: content || `User ${type.replace('_', ' ')}`,
        metadata
      };

      const newInteraction = new Interaction(interactionData);
      await newInteraction.save();

      // Update lead counters based on interaction type
      if (type === InteractionType.UPVOTE) {
        lead.upvotes += 1;
        await lead.save();
      }

      logger.info(`Interaction created successfully by user ${userId}`, {
        interactionId: newInteraction._id,
        leadId,
        type
      });

      res.status(201).json({
        message: "Interaction created successfully",
        data: newInteraction
      });
    } catch (error: any) {
      logger.error("Error creating interaction:", error);
      res.status(500).json({
        message: "Failed to create interaction",
        error: error.message
      });
    }
  }
);

// Get interactions for a specific lead
interactionRouter.get(
  "/lead/:leadId",
  Authentication.User,
  async (req: CustomRequest, res: Response) => {
    try {
      const { leadId } = req.params;
      const { page = 1, limit = 20, type } = req.query;

      if (!Types.ObjectId.isValid(leadId)) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }

      // Build filter
      const filter: any = { leadId };
      if (type && Object.values(InteractionType).includes(type as InteractionType)) {
        filter.type = type;
      }

      // Pagination
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(50, Math.max(1, Number(limit)));
      const skip = (pageNum - 1) * limitNum;

      // Get interactions
      const interactions = await Interaction.find(filter)
        .populate("interactorId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      // Get total count
      const totalInteractions = await Interaction.countDocuments(filter);
      const totalPages = Math.ceil(totalInteractions / limitNum);

      res.status(200).json({
        message: "Lead interactions retrieved successfully",
        data: {
          interactions,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalInteractions,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
          }
        }
      });
    } catch (error: any) {
      logger.error("Error fetching lead interactions:", error);
      res.status(500).json({
        message: "Failed to fetch lead interactions",
        error: error.message
      });
    }
  }
);

// Get user's interactions
interactionRouter.get(
  "/my",
  Authentication.User,
  async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.context?.user?.id;
      const { page = 1, limit = 20, type, leadId } = req.query;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Build filter
      const filter: any = { interactorId: userId };
      if (type && Object.values(InteractionType).includes(type as InteractionType)) {
        filter.type = type;
      }
      if (leadId && Types.ObjectId.isValid(leadId as string)) {
        filter.leadId = leadId;
      }

      // Pagination
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(50, Math.max(1, Number(limit)));
      const skip = (pageNum - 1) * limitNum;

      // Get interactions
      const interactions = await Interaction.find(filter)
        .populate({
          path: "leadId",
          select: "title leadType leadIntent status",
          populate: {
            path: "profileId",
            select: "companyName slug"
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      // Filter out interactions where lead was deleted
      const validInteractions = interactions.filter(interaction => interaction.leadId);

      // Get total count
      const totalInteractions = await Interaction.countDocuments(filter);
      const totalPages = Math.ceil(totalInteractions / limitNum);

      res.status(200).json({
        message: "User interactions retrieved successfully",
        data: {
          interactions: validInteractions,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalInteractions,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
          }
        }
      });
    } catch (error: any) {
      logger.error("Error fetching user interactions:", error);
      res.status(500).json({
        message: "Failed to fetch user interactions",
        error: error.message
      });
    }
  }
);

// Get interaction statistics for a lead
interactionRouter.get(
  "/stats/:leadId",
  Authentication.User,
  async (req: CustomRequest, res: Response) => {
    try {
      const { leadId } = req.params;

      if (!Types.ObjectId.isValid(leadId)) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }

      // Check if lead exists
      const lead = await Lead.findById(leadId);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      // Get interaction stats
      const stats = await Interaction.aggregate([
        { $match: { leadId: new Types.ObjectId(leadId) } },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 }
          }
        }
      ]);

      // Format stats
      const formattedStats = {
        total: 0,
        byType: {} as Record<string, number>
      };

      stats.forEach(stat => {
        formattedStats.byType[stat._id] = stat.count;
        formattedStats.total += stat.count;
      });

      res.status(200).json({
        message: "Lead interaction stats retrieved successfully",
        data: formattedStats
      });
    } catch (error: any) {
      logger.error("Error fetching interaction stats:", error);
      res.status(500).json({
        message: "Failed to fetch interaction stats",
        error: error.message
      });
    }
  }
);

// Check if user has upvoted a specific lead
interactionRouter.get(
  "/check-upvote/:leadId",
  Authentication.User,
  async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.context?.user?.id;
      const { leadId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!Types.ObjectId.isValid(leadId)) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }

      // Check if user has upvoted this lead
      const existingUpvote = await Interaction.findOne({
        leadId: new Types.ObjectId(leadId),
        interactorId: new Types.ObjectId(userId),
        type: InteractionType.UPVOTE
      });

      res.status(200).json({
        message: "Upvote status retrieved successfully",
        data: {
          hasUpvoted: !!existingUpvote,
          upvoteId: existingUpvote?._id || null
        }
      });
    } catch (error: any) {
      logger.error("Error checking upvote status:", error);
      res.status(500).json({
        message: "Failed to check upvote status",
        error: error.message
      });
    }
  }
);

// Remove upvote from a lead
interactionRouter.delete(
  "/upvote/:leadId",
  Authentication.User,
  async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.context?.user?.id;
      const { leadId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!Types.ObjectId.isValid(leadId)) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }

      // Find the user's upvote for this lead
      const existingUpvote = await Interaction.findOne({
        leadId: new Types.ObjectId(leadId),
        interactorId: new Types.ObjectId(userId),
        type: InteractionType.UPVOTE
      });

      if (!existingUpvote) {
        return res.status(404).json({ 
          message: "You haven't upvoted this lead",
          code: "NOT_UPVOTED"
        });
      }

      // Remove the upvote interaction
      await Interaction.findByIdAndDelete(existingUpvote._id);

      // Decrement the lead's upvote count
      const lead = await Lead.findById(leadId);
      if (lead && lead.upvotes > 0) {
        lead.upvotes -= 1;
        await lead.save();
      }

      logger.info(`Upvote removed successfully by user ${userId}`, {
        leadId,
        upvoteId: existingUpvote._id
      });

      res.status(200).json({
        message: "Upvote removed successfully",
        data: {
          leadId,
          newUpvoteCount: lead?.upvotes || 0
        }
      });
    } catch (error: any) {
      logger.error("Error removing upvote:", error);
      res.status(500).json({
        message: "Failed to remove upvote",
        error: error.message
      });
    }
  }
);

// Delete an interaction (for cleanup or user request)
interactionRouter.delete(
  "/:interactionId",
  Authentication.User,
  async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.context?.user?.id;
      const { interactionId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!Types.ObjectId.isValid(interactionId)) {
        return res.status(400).json({ message: "Invalid interaction ID" });
      }

      // Find the interaction
      const interaction = await Interaction.findById(interactionId);
      if (!interaction) {
        return res.status(404).json({ message: "Interaction not found" });
      }

      // Check if user owns the interaction
      if (interaction.interactorId.toString() !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this interaction" });
      }

      // If it was an upvote, decrement the lead's upvote count
      if (interaction.type === InteractionType.UPVOTE) {
        const lead = await Lead.findById(interaction.leadId);
        if (lead && lead.upvotes > 0) {
          lead.upvotes -= 1;
          await lead.save();
        }
      }

      await Interaction.findByIdAndDelete(interactionId);

      logger.info(`Interaction deleted successfully by user ${userId}`, {
        interactionId,
        type: interaction.type
      });

      res.status(200).json({
        message: "Interaction deleted successfully"
      });
    } catch (error: any) {
      logger.error("Error deleting interaction:", error);
      res.status(500).json({
        message: "Failed to delete interaction",
        error: error.message
      });
    }
  }
);

export default interactionRouter;