import { Schema, model, Document, Types } from "mongoose";

// Enum for report types
export enum ReportType {
  USER_REPORTING = "user_reporting",
  LEAD_REPORTING = "lead_reporting", 
  LEAD_SPAM_FLAGGED = "lead_spam_flagged"
}

// Interface for Report document
export interface IReport extends Document {
  reporterId: Types.ObjectId;
  reportedUserId?: Types.ObjectId;
  reportedLeadId?: Types.ObjectId;
  type: ReportType; 
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
      required: false 
    },
    reportedLeadId: { 
      type: Schema.Types.ObjectId, 
      ref: "Lead", 
      required: false 
    },
    type: {
      type: String,
      enum: Object.values(ReportType),
      required: true
    },
    reason: { 
      type: String, 
      required: false 
    }
  },
  { timestamps: true }
);

// Validation to ensure either reportedUserId or reportedLeadId is provided based on type
reportSchema.pre<IReport>("save", function (next) {
  if (this.type === ReportType.USER_REPORTING && !this.reportedUserId) {
    next(new Error("reportedUserId is required for user reporting"));
  } else if ((this.type === ReportType.LEAD_REPORTING || this.type === ReportType.LEAD_SPAM_FLAGGED) && !this.reportedLeadId) {
    next(new Error("reportedLeadId is required for lead reporting"));
  } else {
    next();
  }
});

// Compound indexes for different report types
reportSchema.index({ reporterId: 1, reportedUserId: 1, type: 1 }, { 
  unique: true, 
  partialFilterExpression: { type: ReportType.USER_REPORTING } 
});
reportSchema.index({ reporterId: 1, reportedLeadId: 1, type: 1 }, { 
  unique: true, 
  partialFilterExpression: { type: ReportType.LEAD_REPORTING } 
});

// Export the model
const Report = model<IReport>("Report", reportSchema);
export default Report;