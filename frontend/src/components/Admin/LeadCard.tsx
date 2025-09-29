"use client";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Building2,
  MapPin,
  Calendar,
  Mail,
  User,
  DollarSign,
  ThumbsUp,
  ExternalLink,
  ShieldAlert,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flag,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface LeadData {
  _id: string;
  title: string;
  description: string;
  leadIntent: "buy" | "sell";
  leadType: "product" | "service";
  status: "inactive" | "active" | "closed" | "expired" | "flagged" | "blocked";
  priority: "low" | "medium" | "high" | "urgent";
  isVerified: boolean;
  views: number;
  upvotes: number;
  budget?: number;
  currency: string;
  location: {
    country: string;
    state: string;
    city: string;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  profileId?: {
    _id: string;
    companyName: string;
    slug: string;
  };
  productInfo?: {
    productName: string;
    productCategory: string;
  };
  serviceInfo?: {
    serviceName: string;
    serviceCategory: string;
  };
  createdAt: string;
  expiryDate?: string;
}

interface LeadCardProps {
  lead: LeadData;
  onRequestVerification: (leadId: string, reason?: string) => Promise<void>;
  onToggleBlock: (leadId: string, reason?: string) => Promise<void>;
}

const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onRequestVerification,
  onToggleBlock,
}) => {
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

  const [isLoading, setIsLoading] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRequestVerification = async () => {
    setIsLoading(true);
    try {
      await onRequestVerification(lead._id, reason);
      toast.success("Verification requested successfully", {
        description: "The lead owner will be notified.",
        duration: 4000,
        action: { label: "OK", onClick: () => toast.dismiss() },
        position: "top-center",
        richColors: true,
      });
    } catch (error) {
      toast.error("Failed to request verification", {
        description: "Please try again later.",
        duration: 4000,
        action: { label: "OK", onClick: () => toast.dismiss() },
        position: "top-center",
        richColors: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBlock = async () => {
    const action = lead.status === "blocked" ? "unblock" : "block";

    setIsLoading(true);
    try {
      await onToggleBlock(lead._id, reason || undefined);
      toast.success(`Lead ${action}ed successfully`, {
        duration: 4000,
        position: "top-center",
        action: { label: "OK", onClick: () => toast.dismiss() },
        richColors: true,
      });
      setShowBlockDialog(false); // Close dialog after blocking
      setReason(""); // Clear reason
    } catch (error) {
      toast.error(`Failed to ${action} lead`, {
        description: "Please try again later.",
        duration: 4000,
        position: "top-center",
        action: { label: "OK", onClick: () => toast.dismiss() },
        richColors: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (lead.status) {
      case "active":
        return (
          <Badge
            variant="default"
            className="flex items-center gap-1 bg-green-100 text-green-800"
          >
            <CheckCircle className="h-3 w-3" />
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Inactive
          </Badge>
        );
      case "closed":
        return (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 text-gray-600  "
          >
            <XCircle className="h-3 w-3" />
            Closed
          </Badge>
        );
      case "blocked":
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 text-red-400 border-red-400 hover:bg-red-100 hover:text-red-800"
          >
            <Ban className="h-3 w-3" />
            Blocked
          </Badge>
        );
      case "expired":
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 text-orange-600 border-orange-600"
          >
            <AlertTriangle className="h-3 w-3" />
            Expired
          </Badge>
        );
      default:
        return <Badge variant="secondary">{lead.status}</Badge>;
    }
  };

  const getPriorityBadge = () => {
    const priorityColors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={`${priorityColors[lead.priority]} border-0`}>
        {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}{" "}
        Priority
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  const handleViewLead = () => {
    const leadUrl =
      host.includes("localhost") || host.includes("127.0.0.1")
        ? `http://${hostWithoutSubdomain}/browse/${lead._id}`
        : `https://${hostWithoutSubdomain}/browse/${lead._id}`;
    window.open(leadUrl, "_blank");
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col space-y-4">
        {/* Header with Title and Status */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg line-clamp-1">
                {lead.title}
              </h3>
              <Badge variant="outline" className="text-xs">
                {lead.leadIntent.toUpperCase()} {lead.leadType.toUpperCase()}
              </Badge>
            </div>
            <p className="text-gray-600 text-sm line-clamp-2 mb-2">
              {lead.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {getStatusBadge()}
              {getPriorityBadge()}
              {!lead.isVerified && (
                <Badge
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-800"
                >
                  Unverified
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Lead Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{lead.userId.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{lead.userId.email}</span>
            </div>
            {lead.profileId && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{lead.profileId.companyName}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {lead.location.city}, {lead.location.country}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {lead.budget && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">
                  {formatCurrency(lead.budget, lead.currency)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{lead.views} views</span>
            </div>
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{lead.upvotes} upvotes</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                Created {formatDate(lead.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Product/Service Specific Info */}
        {(lead.productInfo || lead.serviceInfo) && (
          <div className="pt-4 border-t">
            {lead.productInfo && (
              <div>
                <p className="text-sm font-medium">
                  {lead.productInfo.productName}
                </p>
                <p className="text-xs text-gray-500">
                  {lead.productInfo.productCategory}
                </p>
              </div>
            )}
            {lead.serviceInfo && (
              <div>
                <p className="text-sm font-medium">
                  {lead.serviceInfo.serviceName}
                </p>
                <p className="text-xs text-gray-500">
                  {lead.serviceInfo.serviceCategory}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button
            onClick={handleViewLead}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View Lead
          </Button>

          {lead.isVerified && (
            <Button
              onClick={handleRequestVerification}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ShieldAlert className="h-4 w-4" />
              Request Verification
            </Button>
          )}

          {lead.status === "blocked" ? (
            <Button
              onClick={handleToggleBlock}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900"
            >
              <CheckCircle className="h-4 w-4" />
              Unblock
            </Button>
          ) : (
            <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setShowBlockDialog(true)}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50 hover:text-red-800"
                >
                  <Ban className="h-4 w-4" />
                  Block
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Block This Lead</DialogTitle>
                  <DialogDescription>
                    Please provide a reason for blocking this lead.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="block-reason">Reason</Label>
                    <Input
                      id="block-reason"
                      placeholder="Describe the reason..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowBlockDialog(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleToggleBlock}
                    disabled={isLoading || !reason.trim()}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50 hover:text-red-800"
                  >
                    <Ban className="h-4 w-4" />
                    {isLoading ? "Blocking..." : "Block"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </Card>
  );
};

export default LeadCard;
