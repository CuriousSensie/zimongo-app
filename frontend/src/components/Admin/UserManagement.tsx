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
import { Search, Filter, Users, RefreshCw } from "lucide-react";
import UserCard from "./UserCard";
import { toast } from "sonner";
import Api from "@/lib/api";
import { onboarding } from "@/constant/onboarding";
import { locationService } from "@/utils/country-state-city";
import { IProfile } from "@/types/profile";

interface UserData {
  _id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  reportedCount: number;
  isDeactivated: boolean;
  isEmailVerified: boolean;
  picture?: {
    path: string;
    originalName: string;
  };
  createdAt: string;
  profile: IProfile | null;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalForThisPage: number;
  limit: number;
}

interface totalCountsData {
  total: number;
  active: number;
  deactivated: number;
  reported: number;
}

interface UsersResponse {
  users: UserData[];
  pagination: PaginationData;
  totalCounts: totalCountsData;
}

const UserManagement: React.FC = () => {
  // Parse URL params once at initialization, outside of component state hooks
  const getInitialFilters = () => {
    if (typeof window === "undefined") {
      return {
        search: "",
        role: "",
        status: "",
        country: "",
      };
    }
    const params = new URLSearchParams(window.location.search);
    return {
      search: params.get("search") || "",
      role: params.get("role") || "",
      status: params.get("status") || "",
      country: params.get("country") || "",
    };
  };

  const initialFilters = getInitialFilters();

  // Filters initialized from URL params
  const [searchTerm, setSearchTerm] = useState(initialFilters.search);
  const [roleFilter, setRoleFilter] = useState(initialFilters.role);
  const [statusFilter, setStatusFilter] = useState(initialFilters.status);
  const [countryFilter, setCountryFilter] = useState(initialFilters.country);

  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalForThisPage: 0,
    limit: 10,
  });
  const [totalCounts, setTotalCounts] = useState<totalCountsData>({
    total: 0,
    active: 0,
    deactivated: 0,
    reported: 0,
  });
  const [countries, setCountries] = useState<{ name: string; iso2: string }[]>(
    []
  );

  // Remove URL params once on mount (to avoid repeated URL resets)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const newUrl = new URL(window.location.href);
      newUrl.search = "";
      window.history.replaceState({}, document.title, newUrl.toString());
    }
  }, []);

  // Load countries once on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countriesList = await locationService.getCountries();
        setCountries(countriesList);
      } catch (error) {
        console.error("Error loading countries:", error);
      }
    };
    loadCountries();
  }, []);

  // Fetch users whenever filters or pagination.currentPage changes
  useEffect(() => {
    fetchUsers(pagination.currentPage);
  }, [
    searchTerm,
    roleFilter,
    statusFilter,
    countryFilter,
    pagination.currentPage,
  ]);

  const fetchUsers = async (page: number = 1) => {
    setLoading(true);
    try {
      const paramsObj: Record<string, string> = {
        page: page.toString(),
        limit: pagination.limit.toString(),
      };

      if (searchTerm && searchTerm !== "") paramsObj.search = searchTerm;
      if (roleFilter && roleFilter !== "" && roleFilter !== "all")
        paramsObj.role = roleFilter;
      if (statusFilter && statusFilter !== "" && statusFilter !== "all")
        paramsObj.status = statusFilter;
      if (countryFilter && countryFilter !== "" && countryFilter !== "all")
        paramsObj.country = countryFilter;

      const queryParams = new URLSearchParams(paramsObj);

      const response = await Api.getUsersForAdmin(queryParams.toString());

      if (!response.status || response.status !== 200) {
        throw new Error("Failed to fetch users");
      }

      const data: UsersResponse = await response.data;
      setUsers(data.users);
      setPagination(data.pagination);
      setTotalCounts(data.totalCounts);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users", {
        description: "Please try again later.",
        duration: 4000,
        action: {
          label: "Retry",
          onClick: () => fetchUsers(page),
        },
        position: "top-center",
        richColors: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // On Search button click: reset to page 1 so effect triggers fetch
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setStatusFilter("");
    setCountryFilter("");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Pagination controls
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleStatusChange = async (
    userId: string,
    action: "activate" | "deactivate"
  ) => {
    try {
      const response = await Api.toggleActivationDeactivationOfUser(userId);

      if (!response.status || response.status !== 200) {
        throw new Error(`Failed to ${action} user`);
      }

      // Update user in local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId
            ? { ...user, isDeactivated: action === "deactivate" }
            : user
        )
      );

      return Promise.resolve();
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      return Promise.reject(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-gray-600">Manage and monitor user accounts</p>
          </div>
        </div>
        <Button
          onClick={() => fetchUsers(pagination.currentPage)}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <div className="xl:col-span-2">
              <div className="relative ">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Business Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {onboarding.businessRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country.iso2} value={country.iso2}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              onClick={handleSearch}
              className="flex items-center gap-2 w-full md:w-auto"
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Button
              className="w-full md:w-auto"
              onClick={handleClearFilters}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {totalCounts.total}
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {totalCounts.active}
            </div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {totalCounts.deactivated}
            </div>
            <div className="text-sm text-gray-600">Deactivated</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {totalCounts.reported}
            </div>
            <div className="text-sm text-gray-600">Reported</div>
          </div>
        </Card>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No users found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or filters.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {users.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {users.length} of {pagination.totalForThisPage} users
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

export default UserManagement;
