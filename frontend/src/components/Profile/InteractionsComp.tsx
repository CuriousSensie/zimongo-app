"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  MessageCircle,
  Bookmark,
  BookmarkX,
  ThumbsUp,
  Calendar,
  Package,
  Wrench,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import Api from "@/lib/api";
import { toast } from "sonner";
import useUser from "@/hooks/useUser";
import { Spinner } from "@/components/common/Loader/Spinner";
import { Interaction } from "@/types/lead";

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalInteractions: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const InteractionsComp: React.FC = () => {
  const { isAuthenticated, isLoading: userLoading } = useUser();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalInteractions: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (isAuthenticated) {
      fetchInteractions(currentPage);
    }
  }, [isAuthenticated, currentPage]);

  const fetchInteractions = async (page: number = 1) => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await Api.getUserInteractions({ page, limit: 10 });

      // Handle the response structure from the new API
      if (response.data && response.data.data) {
        const { interactions = [], pagination: paginationData } =
          response.data.data;

        setInteractions(interactions);
        setPagination({
          currentPage: paginationData?.currentPage || 1,
          totalPages: paginationData?.totalPages || 1,
          totalInteractions: paginationData?.totalInteractions || 0,
          hasNextPage: paginationData?.hasNextPage || false,
          hasPrevPage: paginationData?.hasPrevPage || false,
        });
      } else {
        console.warn("Unexpected response structure:", response.data);
        setInteractions([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalInteractions: 0,
          hasNextPage: false,
          hasPrevPage: false,
        });
      }
    } catch (error: any) {
      console.error("Error fetching interactions:", error);
      toast.error("Failed to fetch interactions", {
        description: error.response?.data?.message || "An error occurred",
        position: "top-center",
        richColors: true,
        duration: 5000,
        action: {
          label: "Close",
          onClick: () => toast.dismiss(),
        },
      });

      // Set empty state on error
      setInteractions([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalInteractions: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case "view_details":
        return <Eye className="h-4 w-4 text-blue-500" />;
      case "view_profile":
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case "save":
        return <Bookmark className="h-4 w-4 text-purple-500" />;
      case "unsave":
        return <BookmarkX className="h-4 w-4 text-red-500" />;
      case "upvote":
        return <ThumbsUp className="h-4 w-4 text-orange-500" />;
      default:
        return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case "view_details":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "view_profile":
        return "bg-green-50 text-green-700 border-green-200";
      case "save":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "unsave":
        return "bg-red-50 text-red-700 border-red-200";
      case "upvote":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatInteractionType = (type: string) => {
    switch (type) {
      case "view_details":
        return "Viewed Lead Details";
      case "view_profile":
        return "Viewed Profile";
      case "save":
        return "Saved Lead";
      case "unsave":
        return "Unsaved Lead";
      case "upvote":
        return "Upvoted";
      default:
        return type.replace("_", " ");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Authentication Required
              </h2>
              <p className="text-gray-600 mb-4">
                Please log in to view your interactions.
              </p>
              <Link href="/signin">
                <Button className="w-full">Sign In</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Interactions</h1>
          <p className="text-gray-600">
            View how public interacts with your leads and profile.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : interactions.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No interactions yet
                </h3>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {/* Stats */}
              <div className=" text-left text-sm text-gray-600">
                Showing {interactions.length} of {pagination.totalInteractions}{" "}
                interactions
              </div>

              {interactions
                .map((interaction) => {
                  // Safety check for lead data
                  if (!interaction.leadId) {
                    console.warn("Interaction missing lead data:", interaction);
                    return null;
                  }

                  return (
                    <Card
                      key={interaction._id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="flex-shrink-0">
                              {getInteractionIcon(interaction.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getInteractionColor(interaction.type)}`}
                                >
                                  {formatInteractionType(interaction.type)}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Calendar className="h-3 w-3" />
                                  {formatDistanceToNow(
                                    new Date(interaction.timestamp),
                                    {
                                      addSuffix: true,
                                    }
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  {interaction.leadId.leadType === "product" ? (
                                    <Package className="h-4 w-4" />
                                  ) : (
                                    <Wrench className="h-4 w-4" />
                                  )}
                                  <span className="capitalize">
                                    {interaction.leadId.leadType || "Unknown"}
                                  </span>
                                </div>

                                <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
                                  {interaction.leadId.title || "Untitled Lead"}
                                </h3>
                              </div>

                              {interaction.content && (
                                <p className="text-sm text-gray-500 mt-2">
                                  {interaction.content}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
                .filter(Boolean)}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      const pageNum = Math.max(1, currentPage - 2) + i;
                      if (pageNum > pagination.totalPages) return null;

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pageNum === currentPage ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InteractionsComp;
