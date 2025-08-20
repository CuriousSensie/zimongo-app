"use client";
import React, { useState, useEffect } from "react";
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
import { ILead, LeadType } from "@/types/lead";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const LeadManagement = () => {
  const { me } = useUser();
  const [leads, setLeads] = useState<ILead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    leadType: "",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLeads: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

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
      toast.error("Failed to fetch leads");
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
        toast.success("Lead status updated successfully");
        fetchLeads(); // Refresh the list
      }
    } catch (error: any) {
      console.error("Error updating lead status:", error);
      toast.error("Failed to update lead status");
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) {
      return;
    }

    try {
      const response = await Api.deleteLead(leadId);
      
      if (response.status === 200) {
        toast.success("Lead deleted successfully");
        fetchLeads(); // Refresh the list
      }
    } catch (error: any) {
      console.error("Error deleting lead:", error);
      toast.error("Failed to delete lead");
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Leads</h1>
          <p className="text-gray-600">Manage your lead postings</p>
        </div>
        <Link href="/post-lead">
          <Button>Create New Lead</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.leadType}
          onValueChange={(value) => setFilters(prev => ({ ...prev, leadType: value, page: 1 }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value={LeadType.PRODUCT}>Product</SelectItem>
            <SelectItem value={LeadType.SERVICE}>Service</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {leads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No leads found</p>
            <Link href="/post-lead">
              <Button>Create Your First Lead</Button>
            </Link>
          </div>
        ) : (
          leads.map((lead) => (
            <div
              key={lead._id}
              className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{lead.title}</h3>
                    <Badge className={getStatusBadgeColor(lead.status)}>
                      {lead.status}
                    </Badge>
                    <Badge className={getPriorityBadgeColor(lead.priority)}>
                      {lead.priority}
                    </Badge>
                    <Badge variant="outline">
                      {lead.leadType}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {lead.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>📍 {lead.location.city}, {lead.location.state}</span>
                    <span>👁️ {lead.views} views</span>
                    <span>💬 {lead.responses} responses</span>
                    {lead.budget && (
                      <span>💰 {lead.currency} {lead.budget}</span>
                    )}
                    <span>📅 {new Date(lead.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Select
                    value={lead.status}
                    onValueChange={(value) => handleStatusChange(lead._id!, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Link href={`/lead/${lead._id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteLead(lead._id!)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            disabled={!pagination.hasPrevPage}
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            disabled={!pagination.hasNextPage}
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default LeadManagement;