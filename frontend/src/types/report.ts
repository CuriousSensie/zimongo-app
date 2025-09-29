export interface ReportData {
  _id: string;
  type: "user_reporting" | "lead_reporting" | "lead_spam_flagged";
  reason?: string;
  reporterId: {
    _id: string;
    name: string;
    email: string;
  };
  reportedUserId?: {
    _id: string;
    name: string;
    email: string;
    profileSlug?: string;
  };
  reportedLeadId?: {
    _id: string;
    title: string;
    description: string;
    leadType: string;
    leadIntent: string;
  };
  createdAt: string;
}

export interface IReport {
  reporterId: string;
  reportedUserId?: string;
  reportedLeadId?: string;
  type: ReportType;
  reason?: string;
}

export enum ReportType {
  USER_REPORTING = "user_reporting",
  LEAD_REPORTING = "lead_reporting", 
  LEAD_SPAM_FLAGGED = "lead_spam_flagged"
}