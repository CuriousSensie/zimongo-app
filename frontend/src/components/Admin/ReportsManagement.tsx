"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, AlertTriangle, RefreshCw, Trash2 } from "lucide-react";
import ReportCard from "./ReportCard";
import { toast } from "sonner";
import Api from "@/lib/api";
import { ReportData } from "@/types/report";



interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalReports: number;
  limit: number;
}

interface ReportsResponse {
  reports: ReportData[];
  pagination: PaginationData;
}

interface ReportStats {
  totalReports: number;
  userReports: number;
  leadReports: number;
  spamFlags: number;
  recentReports: number;
}

const ReportsManagement: React.FC = () => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [stats, setStats] = useState<ReportStats>({
    totalReports: 0,
    userReports: 0,
    leadReports: 0,
    spamFlags: 0,
    recentReports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalReports: 0,
    limit: 10,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const fetchReports = async (page: number = 1) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter && typeFilter !== "all" && { type: typeFilter }),
      });

      const response = await Api.getReportsForAdmin(queryParams.toString());

      if (!response.status || response.status !== 200) {
        throw new Error("Failed to fetch reports");
      }

      const data: ReportsResponse = await response.data;
      setReports(data.reports);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to fetch reports", {
        duration: 4000,
        action: {
          label: "Close",
          onClick: () => toast.dismiss(),
        },
        richColors: true,
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await Api.getReportStats();
      if (response.status === 200) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching report stats:", error);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const response = await Api.deleteReport(reportId);

      if (!response.status || response.status !== 200) {
        throw new Error("Failed to delete report");
      }

      // Remove report from local state
      setReports((prevReports) =>
        prevReports.filter((report) => report._id !== reportId)
      );

      // Update stats
      fetchStats();

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
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report", {
        duration: 4000,
        action: {
          label: "Close",
          onClick: () => toast.dismiss(),
        },
        richColors: true,
        position: "top-center",
      });
    }
  };

  const handleSearch = () => {
    fetchReports(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    // Reset to page 1 and fetch
    setTimeout(() => fetchReports(1), 100);
  };

  const handlePageChange = (page: number) => {
    fetchReports(page);
  };

  useEffect(() => {
    fetchReports(1);
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Reports & Spam Management
            </h1>
            <p className="text-gray-600">Manage user and lead reports</p>
          </div>
        </div>
        <Button
          onClick={() => {
            fetchReports(pagination.currentPage);
            fetchStats();
          }}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>


      {/* Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by reporter, reported user, lead title, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="user_reporting">User Reports</SelectItem>
                <SelectItem value="lead_reporting">Lead Reports</SelectItem>
                <SelectItem value="lead_spam_flagged">Spam Flags</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleSearch} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Button onClick={handleClearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        </div>

        <div className="flex gap-2"></div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalReports}
            </div>
            <div className="text-sm text-gray-600">Total Reports</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.userReports}
            </div>
            <div className="text-sm text-gray-600">User Reports</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.leadReports}
            </div>
            <div className="text-sm text-gray-600">Lead Reports</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.spamFlags}
            </div>
            <div className="text-sm text-gray-600">Spam Flags</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.recentReports}
            </div>
            <div className="text-sm text-gray-600">Recent (7 days)</div>
          </div>
        </Card>
      </div>
      
      {/* Reports List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No reports found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or filters.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => (
            <ReportCard
              key={report._id}
              report={report}
              onDelete={handleDeleteReport}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {reports.length} of {pagination.totalReports} reports
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>

              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                  if (pageNum > pagination.totalPages) return null;

                  return (
                    <Button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      variant={
                        pageNum === pagination.currentPage
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                    >
                      {pageNum}
                    </Button>
                  );
                }
              )}

              <Button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReportsManagement;
