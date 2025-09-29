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
import { Search, Filter, FileText, RefreshCw } from "lucide-react";
import LeadCard from "./LeadCard";
import { toast } from "sonner";
import Api from "@/lib/api";
import { locationService } from "@/utils/country-state-city";

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

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalLeads: number;
  limit: number;
}

interface LeadsResponse {
  leads: LeadData[];
  pagination: PaginationData;
}

const LeadManagement: React.FC = () => {
  const getInitialFilters = () => {
    if (typeof window === "undefined") {
      return {
        search: "",
        leadIntent: "",
        leadType: "",
        status: "",
        verification: "",
        priority: "",
        country: "",
      };
    }
    const params = new URLSearchParams(window.location.search);
    return {
      search: params.get("search") || "",
      leadType: params.get("leadType") || "",
      leadIntent: params.get("leadIntent") || "",
      status: params.get("status") || "",
      verification: params.get("verification") || "",
      priority: params.get("priority") || "",
      country: params.get("country") || "",
    };
  };

  const initialFilters = getInitialFilters();

  const [leads, setLeads] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalLeads: 0,
    limit: 10,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState(initialFilters.search);
  const [leadIntentFilter, setLeadIntentFilter] = useState(
    initialFilters.leadIntent
  );
  const [leadTypeFilter, setLeadTypeFilter] = useState(initialFilters.leadType);
  const [statusFilter, setStatusFilter] = useState(initialFilters.status);
  const [verificationFilter, setVerificationFilter] = useState(
    initialFilters.verification
  );
  const [priorityFilter, setPriorityFilter] = useState(initialFilters.priority);
  const [countryFilter, setCountryFilter] = useState(initialFilters.country);

  // Options for filters
  const [countries, setCountries] = useState<{ name: string; iso2: string }[]>(
    []
  );

  const fetchLeads = async (page: number = 1) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(leadIntentFilter &&
          leadIntentFilter !== "all" && { leadIntent: leadIntentFilter }),
        ...(leadTypeFilter &&
          leadTypeFilter !== "all" && { leadType: leadTypeFilter }),
        ...(statusFilter && statusFilter !== "all" && { status: statusFilter }),
        ...(verificationFilter &&
          verificationFilter !== "all" && { isVerified: verificationFilter }),
        ...(priorityFilter &&
          priorityFilter !== "all" && { priority: priorityFilter }),
        ...(countryFilter &&
          countryFilter !== "all" && { country: countryFilter }),
      });

      const response = await Api.getLeadsForAdmin(queryParams.toString());

      if (!response.status || response.status !== 200) {
        throw new Error("Failed to fetch leads");
      }

      const data: LeadsResponse = await response.data;
      setLeads(data.leads);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestVerification = async (leadId: string, reason?: string) => {
    try {
      const response = await Api.requestLeadVerification(leadId, reason);

      if (!response.status || response.status !== 200) {
        throw new Error("Failed to request verification");
      }

      // Update lead in local state
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead._id === leadId
            ? { ...lead, isVerified: false, status: "inactive" as const }
            : lead
        )
      );

      toast.success("Verification requested successfully");
    } catch (error) {
      console.error("Error requesting verification:", error);
      toast.error("Failed to request verification");
    }
  };

  const handleToggleBlock = async (leadId: string, reason?: string) => {
    try {
      const response = await Api.toggleLeadBlock(leadId, reason);

      if (!response.status || response.status !== 200) {
        throw new Error("Failed to toggle block status");
      }

      const { data } = response.data;

      // Update lead in local state
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead._id === leadId ? { ...lead, status: data.status } : lead
        )
      );      
    } catch (error) {
      console.error("Error toggling block status:", error);
      toast.error("Failed to update lead status");
    }
  };

  const handleSearch = () => {
    fetchLeads(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setLeadIntentFilter("");
    setLeadTypeFilter("");
    setStatusFilter("");
    setVerificationFilter("");
    setPriorityFilter("");
    setCountryFilter("");
    // Reset to page 1 and fetch
    setTimeout(() => fetchLeads(1), 100);
  };

  const handlePageChange = (page: number) => {
    fetchLeads(page);
  };

  const loadCountries = async () => {
    try {
      const countriesList = await locationService.getCountries();
      setCountries(countriesList);
    } catch (error) {
      console.error("Error loading countries:", error);
    }
  };

  useEffect(() => {
    fetchLeads(1);
    loadCountries();
  }, []);

  // Remove URL params once on mount (to avoid repeated URL resets)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const newUrl = new URL(window.location.href);
      newUrl.search = "";
      window.history.replaceState({}, document.title, newUrl.toString());
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Lead Management
            </h1>
            <p className="text-gray-600">Manage and monitor user leads</p>
          </div>
        </div>
        <Button
          onClick={() => fetchLeads(pagination.currentPage)}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
            <div className="xl:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title, description, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>

            <Select
              value={leadIntentFilter}
              onValueChange={setLeadIntentFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Intent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Intents</SelectItem>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>

            <Select value={leadTypeFilter} onValueChange={setLeadTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="service">Service</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {["inactive", "active", "closed", "expired", "blocked"].map(
                  (status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            <Select
              value={verificationFilter}
              onValueChange={setVerificationFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Verified</SelectItem>
                <SelectItem value="false">Unverified</SelectItem>
              </SelectContent>
            </Select>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country.iso2} value={country.name}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Button onClick={handleClearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {pagination.totalLeads}
            </div>
            <div className="text-sm text-gray-600">Total Leads</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {leads.filter((l) => l.status === "active").length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {leads.filter((l) => l.status === "inactive").length}
            </div>
            <div className="text-sm text-gray-600">Inactive</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {leads.filter((l) => l.status === "blocked").length}
            </div>
            <div className="text-sm text-gray-600">Blocked</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {leads.filter((l) => !l.isVerified).length}
            </div>
            <div className="text-sm text-gray-600">Unverified</div>
          </div>
        </Card>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      ) : leads.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No leads found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or filters.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {leads.map((lead) => (
            <LeadCard
              key={lead._id}
              lead={lead}
              onRequestVerification={handleRequestVerification}
              onToggleBlock={handleToggleBlock}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {leads.length} of {pagination.totalLeads} leads
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

export default LeadManagement;
