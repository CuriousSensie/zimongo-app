"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Filter, Grid, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadIntent, LeadType, ILead } from "@/types/lead";
import Api from "@/lib/api";
import { toast } from "sonner";
import LeadCard from "./LeadCard";
import FilterPanel from "./FilterPanel";
import { Badge } from "@/components/ui/badge";
import publicApi from "@/lib/publicApi";
import { defaultFilters, sortingOptions } from "@/constant/lead";

interface BrowseFilters {
  search: string;
  leadIntent: LeadIntent;
  leadType: LeadType;
  category: string;
  minBudget: string;
  maxBudget: string;
  country: string;
  state: string;
  city: string;
  sortBy: string;
  sortOrder: string;
}

const BrowsePage = () => {
  const [leads, setLeads] = useState<ILead[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLeads: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  
  const [filters, setFilters] = useState<BrowseFilters>({
    ...defaultFilters,
    leadIntent: LeadIntent.BUY,
    leadType: LeadType.PRODUCT,
  });
  
  // View mode is now determined by lead type - products use grid, services use list
  const viewMode = filters.leadType === LeadType.PRODUCT ? "grid" : "list";
  
  const fetchLeads = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        leadIntent: filters.leadIntent,
        leadType: filters.leadType,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.minBudget && { minBudget: filters.minBudget }),
        ...(filters.maxBudget && { maxBudget: filters.maxBudget }),
        ...(filters.country && { country: filters.country }),
        ...(filters.state && { state: filters.state }),
        ...(filters.city && { city: filters.city }),
      };

      const response = await publicApi.getLeads(params);
      setLeads(response.data.data.leads);
      setPagination(response.data.data.pagination);
    } catch (error: any) {
      toast.error("Failed to fetch leads", {
        description: error?.message || "An unexpected error occurred",
        position: "top-center",
        richColors: true,
        action: {
          label: "Close",
          onClick: () => window.location.reload(),
        },
      });
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLeads(1);
  }, [fetchLeads]);

  const handleFilterChange = (key: keyof BrowseFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleModeChange = (intent: LeadIntent) => {
    setFilters(prev => ({ ...prev, leadIntent: intent }));
  };

  const handleTypeChange = (type: LeadType) => {
    setFilters(prev => ({ ...prev, leadType: type }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads(1);
  };

  const clearFilters = () => {
    setFilters({
      ...defaultFilters,
      leadIntent: filters.leadIntent,
      leadType: filters.leadType,
    });
  };

  const activeFiltersCount = [
    filters.search,
    filters.category,
    filters.minBudget,
    filters.maxBudget,
    filters.country,
    filters.state,
    filters.city,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-zimongo-bg border-b">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Browse Leads</h1>
              <p className="text-slate-600 mt-1">
                Discover business opportunities and connect with potential partners
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-2 rounded-lg mx-auto md:mx-0">
              <div className="flex bg-slate-100 rounded-lg p-1 flex-1 mx-auto">
                <Button
                  variant={filters.leadIntent === LeadIntent.BUY ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleModeChange(LeadIntent.BUY)}
                  className="rounded-md w-full"
                >
                  Looking to Buy
                </Button>
                <Button
                  variant={filters.leadIntent === LeadIntent.SELL ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleModeChange(LeadIntent.SELL)}
                  className="rounded-md w-full"
                >
                  Looking to Sell
                </Button>
              </div>

              {/* Type Toggle */}
              <div className="flex bg-slate-100 rounded-lg p-1 flex-1">
                <Button
                  variant={filters.leadType === LeadType.PRODUCT ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleTypeChange(LeadType.PRODUCT)}
                  className="rounded-md w-full"
                >
                  Products
                </Button>
                <Button
                  variant={filters.leadType === LeadType.SERVICE ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleTypeChange(LeadType.SERVICE)}
                  className="rounded-md w-full"
                >
                  Services
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder={`Search ${filters.leadType}s...`}
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>

            {/* Filter Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              {/* Sort */}
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange("sortBy", value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  {sortingOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Filter Panel - Desktop Sidebar */}
          {showFilters && (
            <>
              {/* Desktop Sidebar */}
              <div className="hidden lg:block w-80 flex-shrink-0">
                <FilterPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearFilters}
                  leadType={filters.leadType}
                />
              </div>

              {/* Mobile/Tablet Popup Overlay */}
              <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
                <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-lg overflow-y-auto">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                      className="p-1"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <FilterPanel
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      onClearFilters={clearFilters}
                      leadType={filters.leadType}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-slate-600">
                  {pagination.totalLeads} {filters.leadType}s found
                  {filters.leadIntent === LeadIntent.BUY ? " for buying" : " for selling"}
                </p>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* No Results */}
            {!loading && leads.length === 0 && (
              <div className="text-center py-12">
                <div className="text-slate-400 mb-4">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No leads found
                </h3>
                <p className="text-slate-600 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Results Grid/List */}
            {!loading && leads.length > 0 && (
              <>
                <div
                  className={
                    filters.leadType === LeadType.PRODUCT
                      ? `grid grid-cols-1 md:grid-cols-2 ${showFilters ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-6`
                      : "space-y-4 flex flex-col gap-2  mx-auto"
                  }
                >
                  {leads.map((lead) => (
                    <LeadCard
                      key={lead._id}
                      lead={lead}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      disabled={!pagination.hasPrevPage}
                      onClick={() => fetchLeads(pagination.currentPage - 1)}
                    >
                      Previous
                    </Button>
                    
                    <span className="px-4 py-2 text-sm text-slate-600">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      disabled={!pagination.hasNextPage}
                      onClick={() => fetchLeads(pagination.currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowsePage;