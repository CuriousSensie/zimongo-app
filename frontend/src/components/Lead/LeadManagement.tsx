"use client";
import React, { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Api from "@/lib/api";
import useUser from "@/hooks/useUser";
import { ILead, LeadIntent, LeadType } from "@/types/lead";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

const LeadManagement = () => {
  const { me } = useUser();
  const [leads, setLeads] = useState<ILead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    leadIntent: "buy",
    leadType: "all",
    status: "all",
    page: 1,
    limit: 5,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLeads: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [debounceSearch, setDebounceSearch] = useState("");

  // handle search input change with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: debounceSearch,
        page: 1,
      }));
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [debounceSearch]);

  // Fetch user's leads
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await Api.getMyLeads(filters);

      if (response.status === 200) {
        setLeads(response.data.data.leads);
        setPagination(response.data.data.pagination);
      }
    } catch (error: any) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to fetch leads", {
        position: "top-center",
        richColors: true,
        description: (error as Error).message,
        action: {
          label: "Close",
          onClick: () => window.location.reload(),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const response = await Api.updateLeadStatus(leadId, newStatus);

      if (response.status === 200) {
        toast.success("Lead status updated successfully", {
          position: "top-center",
          richColors: true,
          action: {
            label: "Close",
            onClick: () => window.location.reload(),
          },
        });
        fetchLeads(); // Refresh the list
      }
    } catch (error: any) {
      console.error("Error updating lead status:", error);
      toast.error("Failed to update lead status", {
        position: "top-center",
        richColors: true,
        description: (error as Error).message,
        action: {
          label: "Close",
          onClick: () => window.location.reload(),
        },
      });
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      const response = await Api.deleteLead(leadId);

      if (response.status === 200) {
        toast.success("Lead deleted successfully", {
          position: "top-center",
          richColors: true,
          action: {
            label: "Close",
            onClick: () => window.location.reload(),
          },
        });
        fetchLeads();
      }
    } catch (error: any) {
      console.error("Error deleting lead:", error);
      toast.error("Failed to delete lead", {
        position: "top-center",
        richColors: true,
        description: (error as Error).message,
        action: {
          label: "Close",
          onClick: () => window.location.reload(),
        },
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
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

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Leads</h1>
          <p className="text-gray-600">Manage your lead postings</p>
        </div>
        <Link href="/post-lead" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Create New Lead</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center bg-slate-50 p-4 rounded-lg justify-between">
        <Input
          placeholder="Search by title or description"
          value={debounceSearch || ""}
          onChange={(e) => setDebounceSearch(e.target.value)}
          className="w-full bg-white placeholder:text-black"
        />

        <Select
          value={filters.leadIntent}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, leadIntent: value, page: 1 }))
          }
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Buy Leads" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={LeadIntent.BUY}>Buy Leads</SelectItem>
            <SelectItem value={LeadIntent.SELL}>Sell Leads</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.leadType}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, leadType: value, page: 1 }))
          }
        >
          <SelectTrigger className="w-full  bg-white">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value={LeadType.PRODUCT}>Product</SelectItem>
            <SelectItem value={LeadType.SERVICE}>Service</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, status: value, page: 1 }))
          }
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads List */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Loading leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No leads found</p>
          </div>
        ) : (
          leads.map((lead) => (
            <div
              key={lead._id}
              className="bg-white border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-none">
                      {lead.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className={getStatusBadgeColor(lead.status)}
                    >
                      {lead.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={getPriorityBadgeColor(lead.priority)}
                    >
                      {lead.priority}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-300 text-white">
                      {lead.leadType}
                    </Badge>
                  </div>

                  <p className="text-gray-600 mb-3 max-w-[400px] truncate text-slate-600">
                    {lead.description}
                  </p>

                  <div className="flex flex-wrap gap-2 text-sm text-gray-500 justify-between">
                    <span>📍 {lead.location.city}</span>
                    <span>👁️ {lead.views} views</span>
                    <span>💬 {lead.responses} responses</span>
                    {lead.budget && (
                      <span>
                        💰 {lead.currency} {lead.budget}
                      </span>
                    )}
                    <span>
                      📅 {new Date(lead.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
                  <Select
                    value={lead.status}
                    onValueChange={(value) =>
                      handleStatusChange(lead._id!, value)
                    }
                  >
                    <SelectTrigger className="w-full md:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>

                  <Link
                    href={`/leads/${lead._id}`}
                    className="w-full md:w-auto"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full md:w-auto"
                    >
                      View
                    </Button>
                  </Link>

                  <Dialog>
                    <DialogTrigger className="w-full md:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full md:w-auto text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action is irreversible.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="flex justify-between w-full">
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                          type="button"
                          onClick={() => handleDeleteLead(lead._id!)}
                          className="px-8 py-2 min-w-[120px]"
                        >
                          Confirm
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
          <Button
            variant="outline"
            disabled={!pagination.hasPrevPage}
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
            }
            className="w-full sm:w-auto"
          >
            Previous
          </Button>

          <span className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            disabled={!pagination.hasNextPage}
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
            }
            className="w-full sm:w-auto"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default LeadManagement;
