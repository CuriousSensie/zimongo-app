"use client";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  FileText,
  Calendar,
  Mail,
  ExternalLink,
  Users,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReportData } from "@/types/report";

interface ReportCardProps {
  report: ReportData;
  onDelete: (reportId: string) => Promise<void>;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onDelete }) => {
  const [isLoading, setIsLoading] = useState(false);

  const [hostWithoutSubdomain, setHostWithoutSubdomain] = useState<string>("");

  const host = window.location.host || "zimongo.com";

  // Safe window access
  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.host;
      const subdomain = host.split(".")[0];
      const cleanedHost = host.replace(`${subdomain}.`, "");
      console.log(host, subdomain, cleanedHost);
      setHostWithoutSubdomain(cleanedHost);
    }
  }, []);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(report._id);
      toast.success("Report deleted successfully", {
        duration: 4000,
        action: {
          label: "Close",
          onClick: () => toast.dismiss(),
        },
        richColors: true,
        position: "top-center",
      });
    } catch (error) {
      toast.error("Failed to delete report", {
        duration: 4000,
        action: {
          label: "Close",
          onClick: () => toast.dismiss(),
        },
        richColors: true,
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeBadge = () => {
    switch (report.type) {
      case "user_reporting":
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 text-purple-600 border-purple-600"
          >
            <User className="h-3 w-3" />
            User Report
          </Badge>
        );
      case "lead_reporting":
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 text-green-600 border-green-600"
          >
            <FileText className="h-3 w-3" />
            Lead Report
          </Badge>
        );
      case "lead_spam_flagged":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Spam Flag
          </Badge>
        );
      default:
        return <Badge variant="secondary">{report.type}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewPublicProfile = () => {
    if (report.reportedUserId) {
      // Navigate to user profile or user management filtered by this user
      const userUrl =
        host.includes("localhost") || host.includes("127.0.0.1")
          ? `http://${hostWithoutSubdomain}/profiles/${report.reportedUserId?.profileSlug}`
          : `https://${hostWithoutSubdomain}/profiles/${report.reportedUserId?.profileSlug}}`;
      window.open(userUrl, "_blank");
    }
  };

  const handleViewPublicLead = () => {
    if (report.reportedLeadId) {
      const leadUrl = `${window.location.origin}/browse/${report.reportedLeadId._id}`;
      window.open(leadUrl, "_blank");
    }
  };

  const handleManageProfile = () => {
    if (report.reportedUserId) {
      // Navigate to users tab filtered for this profile
      const manageUrl = `/users?search=${encodeURIComponent(report.reportedUserId.email)}`;
      window.location.href = manageUrl;
    }
  };

  const handleManageLead = () => {
    if (report.reportedLeadId) {
      // Navigate to leads tab filtered for this lead
      const manageUrl = `/leads?search=${encodeURIComponent(report.reportedLeadId.title)}`;
      window.location.href = manageUrl;
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col space-y-4">
        {/* Header with Type and Date */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            {getTypeBadge()}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Reported {formatDate(report.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Reporter Information */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-sm text-gray-700 mb-2">
            Reported by:
          </h4>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{report.reporterId.name}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {report.reporterId.email}
            </span>
          </div>
        </div>

        <div className="border-t pt-4 flex gap-6">
          {/* Container for Reported User */}
          {report.type === "user_reporting" && report.reportedUserId && (
            <div className="flex-1 min-h-[120px] overflow-auto">
              <h4 className="font-medium text-sm text-gray-700 mb-2">
                Reported User:
              </h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">
                    {report.reportedUserId.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {report.reportedUserId.email}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Container for Reported Lead */}
          {(report.type === "lead_reporting" ||
            report.type === "lead_spam_flagged") &&
            report.reportedLeadId && (
              <div className="flex-1 min-h-[120px] overflow-auto">
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  Reported Lead:
                </h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="font-medium line-clamp-1">
                      {report.reportedLeadId.title}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {report.reportedLeadId.description}
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {report.reportedLeadId.leadIntent.toUpperCase()}{" "}
                      {report.reportedLeadId.leadType.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Reason */}
        {report.reason && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Reason:</h4>
            <p
              className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md overflow-y-auto"
              style={{
                maxHeight: "4.5em", // ~3 lines * 1.5em line height
                minHeight: "4.5em",
                lineHeight: "1.5em",
              }}
            >
              {report.reason}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {report.type === "user_reporting" && report.reportedUserId && (
            <>
              <Button
                onClick={handleViewPublicProfile}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Profile
              </Button>
              <Button
                onClick={handleManageProfile}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Manage User
              </Button>
            </>
          )}

          {(report.type === "lead_reporting" ||
            report.type === "lead_spam_flagged") &&
            report.reportedLeadId && (
              <>
                <Button
                  onClick={handleViewPublicLead}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Lead
                </Button>
                <Button
                  onClick={handleManageLead}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Manage Lead
                </Button>
              </>
            )}

          {/* Dialog for deleting a report */}
          <Dialog>
            <DialogTrigger>
              <Button
                variant="outline"
                className="px-8 py-2 min-w-[120px] text-red-600 border-red-600 hover:bg-red-50"
              >
                Delete Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action is not editable!
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-between w-full">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  type="button"
                  onClick={handleDelete}
                  // disabled={!validateStep() || loading}
                  className="px-8 py-2 min-w-[120px]"
                >
                  Delete Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* <Button
            onClick={handleDelete}
            disabled={isLoading}
            variant="destructive"
            size="sm"
            className="flex items-center gap-2 ml-auto"
          >
            <Trash2 className="h-4 w-4" />
            Delete Report
          </Button> */}
        </div>
      </div>
    </Card>
  );
};

export default ReportCard;
