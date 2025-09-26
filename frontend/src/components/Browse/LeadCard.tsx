"use client";

import React from "react";
import { ILead, LeadType } from "@/types/lead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Eye,
  Building2,
  Package,
  Wrench,
  Clock,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { NEXT_PUBLIC_S3_BASE_URL } from "@/constant/env";
import ZoomableImage from "../common/ZoomableImage";
import { FaMoneyBill } from "react-icons/fa6";
import { useViewTracking } from "@/hooks/useViewTracking";
import { useState, useEffect } from "react";
import Api from "@/lib/api";
import { toast } from "sonner";
import { Bookmark, BookmarkCheck, ThumbsUp } from "lucide-react";
import useUser from "@/hooks/useUser";
import { useRouter } from "next/navigation";

interface LeadCardProps {
  lead: ILead;
  viewMode: "grid" | "list";
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, viewMode }) => {
  const router = useRouter();
  const { me, isAuthenticated } = useUser();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(lead.upvotes || 0);

  // Track views when at least 50% of the card is visible
  const { ref: viewTrackingRef } = useViewTracking({
    leadId: lead._id as string,
    threshold: 0.5,
    debounceMs: 1000,
  });

  // Check if lead is saved and upvoted when component mounts
  useEffect(() => {
    const checkLeadStatus = async () => {
      if (isAuthenticated && lead._id) {
        try {
          const [savedResponse, upvoteResponse] = await Promise.all([
            Api.checkIfLeadIsSaved(lead._id),
            Api.checkUpvoteStatus(lead._id),
          ]);

          setIsSaved(savedResponse.data.isSaved);
          setHasUpvoted(upvoteResponse.data.data.hasUpvoted);
        } catch (error) {
          // Silently fail
          console.error("Error checking lead status:", error);
        }
      }
    };

    checkLeadStatus();
  }, [isAuthenticated, lead._id]);

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      toast.warning("Cannot save lead", {
        description: "Pease login to save leads",
        position: "top-center",
        richColors: true,
        action: {
          label: "Close",
          onClick: () => window.location.reload(),
        },
      });
      return;
    }

    if (!me?.profileSlug || me?.profileSlug?.length === 0) {
      toast.warning("Cannot save lead", {
        description: "Please create a profile to save leads",
        position: "top-center",
        richColors: true,
        action: {
          label: "Close",
          onClick: () => window.location.reload(),
        },
      });
      return;
    }

    if (!lead._id) return;

    setIsLoading(true);
    try {
      if (isSaved) {
        await Api.unsaveLead(lead._id);
        setIsSaved(false);
        toast.success("Lead removed from saved", {
          duration: 3000,
          position: "top-center",
          richColors: true,
          action: {
            label: "Close",
            onClick: () => window.location.reload(),
          },
        });
      } else {
        await Api.saveLead(lead._id);
        setIsSaved(true);
        toast.success("Lead saved to your dashboard", {
          duration: 3000,
          position: "top-center",
          richColors: true,
          action: {
            label: "Close",
            onClick: () => window.location.reload(),
          },
        });
      }
    } catch (error: any) {
      console.error("Error saving lead:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to save lead";
      toast.error(errorMessage, {
        duration: 5000,
        position: "top-center",
        richColors: true,
        action: {
          label: "Close",
          onClick: () => window.location.reload(),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactClick = async () => {
    if (!isAuthenticated) {
      toast.warning("Cannot view profile details", {
        description: "Please login to view profile details",
        position: "top-center",
        richColors: true,
        action: {
          label: "Close",
          onClick: () => window.location.reload(),
        },
      });
      return;
    }

    if (isAuthenticated && lead._id) {
      try {
        await Api.trackInteraction(
          lead._id,
          "view_profile",
          "User viewed your profile through this Lead."
        );

        router.push(`/profiles/${(lead.profileId as any).slug}`);
      } catch (error) {
        console.error("Error tracking contact interaction:", error);
      }
    }
  };

  const handleViewDetailsClick = async () => {
    if (!isAuthenticated) {
      toast.warning("Cannot view lead details", {
        description: "Please login to view lead details",
        position: "top-center",
        richColors: true,
        action: {
          label: "Close",
          onClick: () => window.location.reload(),
        },
      });
      return;
    }

    if (isAuthenticated && lead._id) {
      try {
        await Api.trackInteraction(
          lead._id,
          "view_details",
          "User viewed the details of this lead."
        );
        router.push(`/browse/${lead._id}`);
      } catch (error) {
        console.error("Error tracking view details interaction:", error);
      }
    }
  };

  const handleUpvoteToggle = async () => {
    if (!isAuthenticated) {
      toast.warning("Cannot upvote lead", {
        description: "Please login to upvote leads",
        position: "top-center",
        richColors: true,
      });
      return;
    }

    if (!lead._id) return;

    try {
      if (hasUpvoted) {
        // Remove upvote
        await Api.removeUpvote(lead._id);
        setHasUpvoted(false);
        setUpvoteCount((prev) => prev - 1);
        toast.success("Upvote removed!", {
          duration: 2000,
          position: "top-center",
          richColors: true,
        });
      } else {
        // Add upvote
        await Api.addUpvote(lead._id);
        setHasUpvoted(true);
        setUpvoteCount((prev) => prev + 1);
        toast.success("Lead upvoted!", {
          duration: 2000,
          position: "top-center",
          richColors: true,
        });
      }
    } catch (error: any) {
      console.error("Error toggling upvote:", error);

      // Handle specific error cases
      if (error.response?.data?.code === "ALREADY_UPVOTED") {
        setHasUpvoted(true);
        toast.warning("Already upvoted", {
          description: "You have already upvoted this lead",
          position: "top-center",
          richColors: true,
        });
      } else if (error.response?.data?.code === "NOT_UPVOTED") {
        setHasUpvoted(false);
        toast.warning("Not upvoted", {
          description: "You haven't upvoted this lead yet",
          position: "top-center",
          richColors: true,
        });
      } else {
        toast.error(
          `Failed to ${hasUpvoted ? "remove upvote" : "upvote lead"}`,
          {
            description: error.response?.data?.message || "An error occurred",
            position: "top-center",
            richColors: true,
          }
        );
      }
    }
  };

  const formatBudget = (budget?: number, currency = "USD") => {
    if (!budget) return "Not specified";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budget);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:text-yellow-900";
      case "closed":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900";
      case "expired":
        return "bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900";
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900";
      case "high":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200 hover:text-orange-900";
      case "medium":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900";
      case "low":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900";
    }
  };

  const getLeadTypeInfo = () => {
    if (lead.leadType === LeadType.PRODUCT && lead.productInfo) {
      return {
        icon: <Package className="h-4 w-4" />,
        category: lead.productInfo.productCategory,
        name: lead.productInfo.productName,
        details: `Min. Order: ${lead.productInfo.minimumOrderQuantity} ${lead.productInfo.unitOfMeasurement}`,
      };
    } else if (lead.leadType === LeadType.SERVICE && lead.serviceInfo) {
      return {
        icon: <Wrench className="h-4 w-4" />,
        category: lead.serviceInfo.serviceCategory,
        name: lead.serviceInfo.serviceName,
        details: `Type: ${lead.serviceInfo.typeOfService}`,
      };
    }
    return {
      icon: <Package className="h-4 w-4" />,
      category: "General",
      name: lead.title,
      details: "",
    };
  };

  const typeInfo = getLeadTypeInfo();

  // helper functions
  function capitalizeFirstLetter(str: string) {
    if (str.length === 0) {
      return "";
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function capitalizeEachWord(sentence: string) {
    return sentence
      .split(" ")
      .map((word) => capitalizeFirstLetter(word)) // Using the function from above
      .join(" ");
  }

  function cleanText(text: string) {
    return capitalizeEachWord(text.replace("_", " "));
  }

  // Service cards are shown in list view
  if (lead.leadType === LeadType.SERVICE) {
    return (
      <div
        ref={viewTrackingRef}
        className="flex flex-col md:flex-row mx-auto w-full gap-4 justify-between items-center bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors p-6"
      >
        <div className="flex flex-col items-start justify-between">
          <div className="flex items-center gap-3 mb-3">
            {lead.profileId && (
              <div className="flex items-center gap-2 text-xs text-purple-500 bg-purple-200 rounded-full px-2 py-1">
                <Building2 className="h-3 w-3" />
                <span>
                  by {(lead.profileId as any)?.companyName || "Company"}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              {typeInfo.icon}
              <Badge variant="outline" className="text-xs">
                {cleanText(typeInfo.category)}
              </Badge>
            </div>

            <div className="flex gap-1 items-center text-sm font-thin">
              Urgency:
              <Badge className={`text-xs ${getPriorityColor(lead.priority)}`}>
                {lead.priority}
              </Badge>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 max-w-[70vw]">
            {lead.title}
          </h3>

          <p className="text-gray-600 mb-3 line-clamp-2 max-w-[80vw] md:max-w-[60vw] ">
            {lead.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>
                {lead.location.city}, {lead.location.state}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <FaMoneyBill className="h-4 w-4" />
              <span>{formatBudget(lead.budget, lead.currency)}</span>
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDistanceToNow(new Date(lead.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{lead.views} views</span>
            </div>

            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span>{upvoteCount} upvotes</span>
            </div>
          </div>
        </div>

        <div className="flex flex-row md:flex-col gap-2 w-full md:w-[15vw] mt-4 md:mt-0 justify-center">
          <div className="flex gap-1" onClick={handleViewDetailsClick}>
            <Button className="w-full" size="sm">
              <ExternalLink className="h-4 w-4" />
              View Details
            </Button>
          </div>
          {lead.profileId && (lead.profileId as any)?.slug ? (
            <div onClick={handleContactClick}>
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white w-full flex gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Contact
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Contact
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveToggle}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            {isSaved ? "Saved" : "Save"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUpvoteToggle}
            disabled={!isAuthenticated}
            className={`flex items-center gap-1 ${hasUpvoted ? "bg-orange-50 text-orange-600 border-orange-200" : ""}`}
          >
            <ThumbsUp className="h-4 w-4" />
            {hasUpvoted ? "Upvoted" : "Upvote"}
          </Button>
        </div>
      </div>
    );
  }

  // Product cards
  return (
    <div
      ref={viewTrackingRef}
      className="flex flex-col justify-between bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
    >
      {/* Product Image */}
      {lead.leadType === LeadType.PRODUCT && (
        <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
          {lead.productInfo?.productFiles &&
          lead.productInfo.productFiles.length > 0 ? (
            <ZoomableImage
              src={`${NEXT_PUBLIC_S3_BASE_URL}/${lead?.productInfo?.productFiles[0]?.path}`}
              alt={lead.productInfo?.productFiles[0]?.originalName}
              className="w-full h-full object-cover"
            />
          ) : (
            // <Image
            //   src={`${NEXT_PUBLIC_S3_BASE_URL}/${lead.productInfo.productFiles[0].path}`}
            //   alt={lead.productInfo.productFiles[0].originalName}
            //   className="w-full h-full object-cover"
            //   fill
            //   objectFit="cover"
            // />
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          )}
          {/* Lead Intent Badge */}
          <div className="absolute top-3 left-3">
            {lead.profileId && (
              <div className="flex items-center gap-2 text-xs text-purple-500 bg-purple-200 rounded-full px-2 py-1">
                <Building2 className="h-3 w-3" />
                <span>
                  by {(lead.profileId as any)?.companyName || "Company"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* title and desc */}
      <div className="p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
          {typeInfo.name}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2">{lead.description}</p>
      </div>

      <div className="p-6 border-t border-gray-100 ">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {typeInfo.icon}
            <Badge variant="outline" className="text-xs">
              {cleanText(typeInfo.category)}
            </Badge>
          </div>
          <div className="flex gap-2 text-sm">
            Urgency:
            <Badge className={`text-xs ${getPriorityColor(lead.priority)}`}>
              {lead.priority}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>
              {lead.location.city}, {lead.location.state}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FaMoneyBill className="h-4 w-4" />
            <span>{formatBudget(lead.budget, lead.currency)}</span>
          </div>

          {typeInfo.details && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Package className="h-4 w-4" />
              <span>{typeInfo.details}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(lead.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{lead.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              <span>{upvoteCount}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <div className="flex-1" onClick={handleViewDetailsClick}>
            <Button size="sm" className="w-full">
              View Details
            </Button>
          </div>
          {lead.profileId && (lead.profileId as any)?.slug ? (
            <div onClick={handleContactClick}>
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white w-full"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Contact
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveToggle}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUpvoteToggle}
            className={`flex items-center gap-1 ${hasUpvoted ? "bg-orange-50 text-orange-600 border-orange-200" : ""}`}
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeadCard;
