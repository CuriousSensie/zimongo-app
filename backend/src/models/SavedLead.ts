import { Schema, model, Document, Types } from "mongoose";

// Interface for SavedLead document
export interface ISavedLead extends Document {
  userId: Types.ObjectId;
  leadId: Types.ObjectId;
  savedAt: Date;
}

// Schema definition
const savedLeadSchema = new Schema<ISavedLead>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      required: true, 
      ref: "User" 
    },
    leadId: { 
      type: Schema.Types.ObjectId, 
      required: true, 
      ref: "Lead" 
    },
  },
  { 
    timestamps: { 
      createdAt: "savedAt",
      updatedAt: false 
    } 
  }
);

// Compound index to ensure a user can only save a lead once
savedLeadSchema.index({ userId: 1, leadId: 1 }, { unique: true });

// Index for efficient queries
savedLeadSchema.index({ userId: 1, savedAt: -1 });

// Export the model
const SavedLead = model<ISavedLead>("SavedLead", savedLeadSchema);
export default SavedLead;