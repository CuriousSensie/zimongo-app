import { Schema, model, Document, Types } from "mongoose";

// Interface for Report document
export interface IReport extends Document {
  reporterId: Types.ObjectId; 
  reportedUserId: Types.ObjectId;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition for Report
const reportSchema = new Schema<IReport>(
  {
    reporterId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    reportedUserId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    reason: { 
      type: String, 
      required: false 
    }
  },
  { timestamps: true }
);

// Compound index to ensure one user can only report another user once
reportSchema.index({ reporterId: 1, reportedUserId: 1 }, { unique: true });

// Export the model
const Report = model<IReport>("Report", reportSchema);
export default Report;