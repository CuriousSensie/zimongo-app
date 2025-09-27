import express, { Response } from "express";
import Lead from "../models/Lead";
import Interaction, { InteractionType } from "../models/Interaction";
import Profile from "../models/Profile";
import SavedLead from "../models/SavedLead";
import { Types } from "mongoose";
import Authentication from "../middleware/auth";
import { CustomRequest } from "../types/request";

const analyticsRouter = express.Router();

/**
 * GET /api/analytics/dashboard
 * Get comprehensive analytics for user dashboard
 */
analyticsRouter.get(
  "/dashboard",
  Authentication.User,
  async (req: CustomRequest, res: Response) => {
    try {
      const userId = new Types.ObjectId(req.context?.user?.id);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Lead Analytics
      const leadAnalytics = await Promise.all([
        // Total leads
        Lead.countDocuments({ userId }),
        
        // Active leads
        Lead.countDocuments({ 
          userId, 
          status: "active" 
        }),
        
        // Verified leads
        Lead.countDocuments({ 
          userId, 
          isVerified: true 
        }),
        
        // Most viewed lead
        Lead.findOne({ userId })
          .sort({ views: -1 })
          .select("title views")
          .lean(),
        
        // Most upvoted lead
        Lead.findOne({ userId })
          .sort({ upvotes: -1 })
          .select("title upvotes")
          .lean(),
        
        // Most saved lead (count from SavedLead collection)
        Lead.aggregate([
          { $match: { userId } },
          {
            $lookup: {
              from: "savedleads",
              localField: "_id",
              foreignField: "leadId",
              as: "saves"
            }
          },
          {
            $addFields: {
              saveCount: { $size: "$saves" }
            }
          },
          { $sort: { saveCount: -1 } },
          { $limit: 1 },
          {
            $project: {
              title: 1,
              saveCount: 1
            }
          }
        ]).then(result => result[0] || null),
        
        // Leads created over time (last 30 days)
        Lead.aggregate([
          {
            $match: {
              userId,
              createdAt: { $gte: thirtyDaysAgo }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt"
                }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { "_id": 1 } }
        ])
      ]);

      // Profile Analytics
      const profileAnalytics = await Profile.findOne({ userId })
        .select("slug")
        .lean();

      let profileStats = null;
      if (profileAnalytics) {
        profileStats = await Promise.all([
          // Profile views (from interactions)
          Interaction.countDocuments({
            type: InteractionType.VIEW_PROFILE,
            // Note: We'll need to add profileId to Interaction model or use a different approach
          }),
          
          // Profile interactions count (placeholder for now)
          Promise.resolve(0)
        ]);
      }

      // Interaction Analytics
      const interactionAnalytics = await Promise.all([
        // Total interactions by user
        Interaction.countDocuments({ interactorId: userId }),
        
        // Interactions by type
        Interaction.aggregate([
          { $match: { interactorId: userId } },
          {
            $group: {
              _id: "$type",
              count: { $sum: 1 }
            }
          }
        ]),
        
        // Saved leads count
        SavedLead.countDocuments({ userId }),
        
        // Recent interactions timeline
        Interaction.aggregate([
          {
            $match: {
              interactorId: userId,
              createdAt: { $gte: thirtyDaysAgo }
            }
          },
          {
            $group: {
              _id: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                type: "$type"
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { "_id.date": 1 } }
        ])
      ]);

      // Format response
      const analytics = {
        leadAnalytics: {
          total: leadAnalytics[0],
          active: leadAnalytics[1],
          verified: leadAnalytics[2],
          mostViewed: leadAnalytics[3],
          mostUpvoted: leadAnalytics[4],
          mostSaved: leadAnalytics[5],
          timeline: leadAnalytics[6]
        },
        profileAnalytics: {
          views: profileStats ? profileStats[0] : 0,
          interactions: profileStats ? profileStats[1] : 0,
          slug: profileAnalytics?.slug || null
        },
        interactionAnalytics: {
          total: interactionAnalytics[0],
          byType: interactionAnalytics[1],
          savedLeads: interactionAnalytics[2],
          timeline: interactionAnalytics[3]
        }
      };

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      console.error("Analytics fetch error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch analytics data"
      });
    }
  }
);

/**
 * GET /api/analytics/lead-stats/:leadId
 * Get detailed analytics for a specific lead
 */
// analyticsRouter.get(
//   "/lead-stats/:leadId",
//   Authentication.User,
//   async (req: CustomRequest, res: Response) => {
//     try {
//       const { leadId } = req.params;
//       const userId = req.context?.user?.id;

//       // Verify lead ownership
//       const lead = await Lead.findOne({ 
//         _id: leadId, 
//         userId 
//       }).select("title views upvotes createdAt");

//       if (!lead) {
//         return res.status(404).json({
//           success: false,
//           message: "Lead not found"
//         });
//       }

//       // Get interaction stats for this lead
//       const interactionStats = await Interaction.getLeadStats(leadId);
//       const savedCount = await SavedLead.countDocuments({ leadId });

//       res.json({
//         success: true,
//         data: {
//           lead: {
//             title: lead.title,
//             views: lead.views,
//             upvotes: lead.upvotes,
//             createdAt: lead.createdAt
//           },
//           interactions: {},
//           savedCount
//         }
//       });

//     } catch (error) {
//       console.error("Lead stats error:", error);
//       res.status(500).json({
//         success: false,
//         message: "Failed to fetch lead statistics"
//       });
//     }
//   }
// );

export default analyticsRouter;