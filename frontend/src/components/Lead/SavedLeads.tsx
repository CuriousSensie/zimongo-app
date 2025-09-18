"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";
import { Bookmark, BookmarkCheck, Trash2, Eye, Calendar } from "lucide-react";
import { LuMapPin } from "react-icons/lu";
import { FaMoneyBill } from "react-icons/fa6";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Api from "@/lib/api";
import useUser from "@/hooks/useUser";

import { ILead } from "@/types/lead";

interface SavedLeadData {
  _id: string;
  leadId: ILead;
  savedAt: string;
}

interface SavedLeadsResponse {
  savedLeads: SavedLeadData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalSavedLeads: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const SavedLeadsComp: React.FC = () => {
  const { isAuthenticated } = useUser();
  const [savedLeads, setSavedLeads] = useState<SavedLeadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<
    SavedLeadsResponse["pagination"] | null
  >(null);
  const [unsaving, setUnsaving] = useState<string | null>(null);
  const [hostWithoutSubdomain, setHostWithoutSubdomain] = useState<string>("");

  // Safe window access
  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.host;
      const subdomain = host.split(".")[0];
      const cleanedHost = host.replace(`${subdomain}.`, "");
      setHostWithoutSubdomain(cleanedHost);
    }
  }, []);

  const fetchSavedLeads = useCallback(
    async (page: number = 1) => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        const response = await Api.getSavedLeads({ page, limit: 10 });
        const { savedLeads, pagination } = response.data.data;
        setSavedLeads(savedLeads);
        setPagination(pagination);
      } catch (error: any) {
        toast.error("Failed to fetch saved leads");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    fetchSavedLeads(currentPage);
  }, [isAuthenticated, currentPage, fetchSavedLeads]);

  const handleUnsave = async (leadId: string) => {
    if (!leadId) return;

    setUnsaving(leadId);
    try {
      await Api.unsaveLead(leadId);
      setSavedLeads((prev) =>
        prev.filter((saved) => saved.leadId._id !== leadId)
      );
      toast.success("Lead removed from saved");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to unsave lead";
      toast.error(message);
    } finally {
      setUnsaving(null);
    }
  };

  const formatBudget = (budget?: number, currency = "USD") => {
    if (!budget) return "Not specified";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budget);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-slate-100 text-gray-800";
      case "closed":
        return "bg-blue-100 text-blue-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sign In Required
          </h2>
          <p className="text-gray-600">
            Please sign in to view your saved leads.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your saved leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Bookmark className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Saved Leads</h1>
        </div>
        <p className="text-gray-600">
          Manage your saved leads and find opportunities you're interested in.
        </p>
      </div>

      {savedLeads.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No saved leads
          </h3>
          <p className="text-gray-600 mb-4">
            Start saving leads from the browse page to keep track of
            opportunities.
          </p>
          <Link target="_blank" href={`https://${hostWithoutSubdomain}/browse`}>
            <Button>Browse Leads</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {savedLeads.map((savedLead) => {
              const lead = savedLead.leadId;
              if (!lead) return null;

              return (
                <div
                  key={savedLead._id}
                  className="bg-white border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-none">
                          {lead.title}
                        </h3>
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                        <Badge className={getPriorityColor(lead.priority)}>
                          {lead.priority}
                        </Badge>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                          {lead.leadType}
                        </Badge>
                        {lead.profileId && (
                          <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                            by{" "}
                            {(lead.profileId as any)?.companyName || "Company"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3 max-w-[400px] truncate">
                        {lead.description}
                      </p>

                      <div className="flex flex-wrap gap-2 text-sm text-gray-500 justify-between">
                        <span className="flex items-center gap-1">
                          <LuMapPin className="h-4 w-4" />
                          {lead.location?.city}, {lead.location?.state}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" /> {lead.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Bookmark className="h-4 w-4" />
                          Saved{" "}
                          {formatDistanceToNow(new Date(savedLead.savedAt), {
                            addSuffix: true,
                          })}
                        </span>
                        {lead.budget && (
                          <span className="flex items-center gap-1">
                            <FaMoneyBill className="h-4 w-4 mr-1" />
                            {formatBudget(lead.budget, lead.currency)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 items-center">
                      <Link
                        className="w-full md:w-1/2 lg:w-auto"
                        target="_blank"
                        href={`https://${hostWithoutSubdomain}/browse/${lead._id}`}
                      >
                        <Button size="sm" className="w-full">View Details</Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnsave(lead._id!)}
                        disabled={unsaving === lead._id}
                        className="flex items-center gap-2 w-full md:w-1/2 lg:w-auto text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        {unsaving === lead._id ? "Removing..." : "Remove"}
                      </Button>

                      {lead.profileId && (lead.profileId as any)?.slug && (
                        <Link
                          target="_blank"
                          href={`https://${hostWithoutSubdomain}/profiles/${(lead.profileId as any).slug}`}
                          className="w-full md:w-1/2 lg:w-auto"
                        >
                          <Button variant="outline" size="sm" className="w-full">
                            Contact
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages} (
                {pagination.totalSavedLeads} saved)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SavedLeadsComp;
