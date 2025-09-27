import mongoose, { Schema, model, Document, Types } from "mongoose";

export enum InteractionType {
  VIEW_DETAILS = "view_details",
  VIEW_PROFILE = "view_profile",
  UPVOTE = "upvote",
  SAVE = "save",
  UNSAVE = "unsave"
}

// Interface for Interaction document
export interface IInteraction extends Document {
  leadId: Types.ObjectId;
  interactorId: Types.ObjectId;
  type: InteractionType;
  content?: string;
  timestamp: Date;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Interaction Schema
const InteractionSchema = new Schema<IInteraction>({
  leadId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Lead",
    index: true
  },
  interactorId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
    index: true
  },
  type: {
    type: String,
    enum: Object.values(InteractionType),
    required: true,
    index: true
  },
  content: {
    type: String,
    maxlength: 500
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    userAgent: { type: String },
    ipAddress: { type: String },
    referrer: { type: String }
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Compound indexes for efficient queries
InteractionSchema.index({ leadId: 1, createdAt: -1 });
InteractionSchema.index({ interactorId: 1, createdAt: -1 });
InteractionSchema.index({ leadId: 1, type: 1 });
InteractionSchema.index({ interactorId: 1, type: 1 });

// Static methods
InteractionSchema.statics.findByLead = function(leadId: string) {
  return this.find({ leadId })
    .populate("interactorId", "name email")
    .sort({ createdAt: -1 });
};

InteractionSchema.statics.findByUser = function(userId: string) {
  return this.find({ interactorId: userId })
    .populate("leadId", "title leadType leadIntent")
    .sort({ createdAt: -1 });
};

InteractionSchema.statics.countByType = function(leadId: string, type: InteractionType) {
  return this.countDocuments({ leadId, type });
};

InteractionSchema.statics.getLeadStats = function(leadId: string) {
  return this.aggregate([
    { $match: { leadId: new Types.ObjectId(leadId) } },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 }
      }
    }
  ]);
};

// Export the model
const Interaction = model<IInteraction>("Interaction", InteractionSchema);
export default Interaction;