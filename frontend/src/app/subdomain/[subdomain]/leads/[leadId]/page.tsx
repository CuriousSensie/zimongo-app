"use client";
import React, { useState, useEffect, use } from "react";
import { useParams, useRouter } from "next/navigation";
import UserLayout from "@/components/layouts/UserLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Api from "@/lib/api";
import { ILead } from "@/types/lead";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Eye,
  MessageCircle,
  DollarSign,
  Package,
  Settings,
  Clock,
  User,
  Building,
  Handshake,
} from "lucide-react";
import { locationService } from "@/utils/country-state-city";

const LeadDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<ILead | null>(null);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<string | null>(null);
  const [state, setState] = useState<string | null>(null);

  const leadId = params.leadId as string;

  useEffect(() => {
    const fetchLead = async () => {
      try {
        setLoading(true);
        const response = await Api.getLeadById(leadId);

        if (response.status === 200) {
          setLead(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching lead:", error);
        toast.error("Failed to fetch lead details", {
          position: "top-center",
          richColors: true,
          description: (error as Error).message,
        });
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (leadId) {
      fetchLead();
    }
  }, [leadId, router]);

  useEffect(() => {
    const fetchLocation = async () => {
      if (lead && lead.location) {
        try {
          const country = await locationService.getCountryFromCode(
            lead.location.country
          );
          const state = await locationService.getStateFromCode(
            lead.location.country,
            lead.location.state
          );
          setCountry(country?.name);
          setState(state?.name);
        } catch (error) {
          console.error("Error fetching location data:", error);
          toast.error("Failed to fetch location data", {
            position: "top-center",
            richColors: true,
            description: (error as Error).message,
          });
        }
      }
    };
    fetchLocation();
  }, [lead]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "closed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "expired":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading lead details...</p>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (!lead) {
    return (
      <UserLayout>
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">Lead not found</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leads
          </Button>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700 border-purple-200"
                  >
                    {lead?.leadIntent?.toUpperCase()}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {lead?.leadType?.toUpperCase()}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`${getPriorityBadgeColor(lead.priority)} font-medium`}
                  >
                    {lead?.priority?.toUpperCase()}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`${getStatusBadgeColor(lead.status)} font-medium`}
                  >
                    {lead?.status?.toUpperCase()}
                  </Badge>
                </div>

                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {lead?.title}
                </h1>

                <p className="text-slate-600 text-lg leading-relaxed">
                  {lead?.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-4 text-center">
            <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">{lead.views}</p>
            <p className="text-sm text-slate-600">Views</p>
          </div>

          <div className="bg-white rounded-lg border p-4 text-center">
            <Handshake className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">
              {lead.interactions.length}
            </p>
            <p className="text-sm text-slate-600">Interactions</p>
          </div>

          <div className="bg-white rounded-lg border p-4 text-center">
            <DollarSign className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">
              {lead.currency && lead.budget
                ? `${lead.currency} ${lead.budget}`
                : "N/A"}
            </p>
            <p className="text-sm text-slate-600">Budget</p>
          </div>

          <div className="bg-white rounded-lg border p-4 text-center justify-between flex flex-col">
            <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-md font-semibold text-slate-900">
              {formatDate(lead.createdAt)}
            </p>
            <p className="text-sm text-slate-600">Posted</p>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-red-500" />
            Location Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-800 mb-1">Country</p>
              <p className="font-medium text-slate-600">{country}</p>
            </div>
            <div>
              <p className="text-sm text-slate-800 mb-1">State</p>
              <p className="font-medium text-slate-600">{state}</p>
            </div>
            <div>
              <p className="text-sm text-slate-800 mb-1">City</p>
              <p className="font-medium text-slate-600">{lead.location.city}</p>
            </div>
            {lead.location.zipCode && (
              <div>
                <p className="text-sm text-slate-800 mb-1">ZIP Code</p>
                <p className="font-medium text-slate-600">
                  {lead.location.zipCode}
                </p>
              </div>
            )}
            {lead.location.address && (
              <div className="md:col-span-2">
                <p className="text-sm text-slate-800 mb-1">Address</p>
                <p className="font-medium text-slate-600">
                  {lead.location.address}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Product/Service Specific Information */}
        {lead.leadType === "product" && lead.productInfo && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-blue-500" />
              Product Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600">Product Name</p>
                    <p className="font-medium text-sm text-slate-400">
                      {lead.productInfo.productName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Category</p>
                    <p className="font-medium text-slate-400">
                      {lead.productInfo.productCategory}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Description</p>
                    <p className="font-medium text-slate-400">
                      {lead.productInfo.productDescription}
                    </p>
                  </div>
                  {lead.productInfo.brandOrModel && (
                    <div>
                      <p className="text-sm text-slate-600">Brand/Model</p>
                      <p className="font-medium text-slate-400">
                        {lead.productInfo.brandOrModel}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-3">
                  Specifications
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600">
                      Minimum Order Quantity
                    </p>
                    <p className="font-medium text-slate-400">
                      {lead.productInfo.minimumOrderQuantity}{" "}
                      {lead.productInfo.unitOfMeasurement}
                    </p>
                  </div>
                  {lead.productInfo.budgetPerUnit && (
                    <div>
                      <p className="text-sm text-slate-600">Budget per Unit</p>
                      <p className="font-medium text-slate-400">
                        {lead.currency} {lead.productInfo.budgetPerUnit}
                      </p>
                    </div>
                  )}
                  {lead.productInfo.expectedDeliveryDate && (
                    <div>
                      <p className="text-sm text-slate-600">
                        Expected Delivery
                      </p>
                      <p className="font-medium text-slate-400">
                        {formatDate(lead.productInfo.expectedDeliveryDate)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-600">Delivery Location</p>
                    <p className="font-medium text-slate-400">
                      {lead.productInfo.deliveryLocation}
                    </p>
                  </div>
                  {lead.productInfo.dimensions && (
                    <div>
                      <p className="text-sm text-slate-600">Dimensions</p>
                      {lead.productInfo.dimensions.length ? <p className="font-medium text-slate-400">
                        {lead.productInfo.dimensions.length} ×{" "}
                        {lead.productInfo.dimensions.width} ×{" "}
                        {lead.productInfo.dimensions.height}{" "}
                        {lead.productInfo.dimensions.unit}
                      </p> : <div className="font-medium text-slate-400">Not Specified</div>}
                    </div>
                  )}
                  {lead.productInfo.weight && (
                    <div>
                      <p className="text-sm text-slate-600">Weight</p>
                      <p className="font-medium text-slate-400">
                        {lead.productInfo.weight.value}{" "}
                        {lead.productInfo.weight.unit}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {lead.productInfo.additionalNotes && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Additional Notes
                </h3>
                <p className="text-slate-700">
                  {lead.productInfo.additionalNotes}
                </p>
              </div>
            )}
          </div>
        )}

        {lead.leadType === "service" && lead.serviceInfo && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-green-500" />
              Service Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">
                  Service Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600">Service Name</p>
                    <p className="font-medium text-slate-400">
                      {lead.serviceInfo.serviceName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Category</p>
                    <p className="font-medium text-slate-400">
                      {lead.serviceInfo.serviceCategory}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Description</p>
                    <p className="font-medium text-slate-400">
                      {lead.serviceInfo.serviceDescription}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Type of Service</p>
                    <p className="font-medium text-slate-400">
                      {lead.serviceInfo.typeOfService}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Location</p>
                    <p className="font-medium text-slate-400">
                      {lead.serviceInfo.locationOfService}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Remote Service</p>
                    <p className="font-medium text-slate-400">
                      {lead.serviceInfo.isRemote ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-3">
                  Timeline & Budget
                </h3>
                <div className="space-y-3">
                  {lead.serviceInfo.startDate && (
                    <div>
                      <p className="text-sm text-slate-600">Start Date</p>
                      <p className="font-medium text-slate-400">
                        {formatDate(lead.serviceInfo.startDate)}
                      </p>
                    </div>
                  )}
                  {lead.serviceInfo.endDate && (
                    <div>
                      <p className="text-sm text-slate-600">End Date</p>
                      <p className="font-medium text-slate-400">
                        {formatDate(lead.serviceInfo.endDate)}
                      </p>
                    </div>
                  )}
                  {lead.serviceInfo.serviceFrequency && (
                    <div>
                      <p className="text-sm text-slate-600">Frequency</p>
                      <p className="font-medium text-slate-400">
                        {lead.serviceInfo.serviceFrequency}
                      </p>
                    </div>
                  )}
                  {lead.serviceInfo.budgetEstimate && (
                    <div>
                      <p className="text-sm text-slate-600">Budget Estimate</p>
                      <p className="font-medium text-slate-400">
                        {lead.currency}{" "}
                        {lead.serviceInfo.budgetEstimate.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {lead.serviceInfo.skillsOrExpertiseNeeded && (
                    <div>
                      <p className="text-sm text-slate-600">Required Skills</p>
                      <p className="font-medium text-slate-400">
                        {lead.serviceInfo.skillsOrExpertiseNeeded}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {lead.serviceInfo.scopeOfWork && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Scope of Work
                </h3>
                <p className="text-slate-700">{lead.serviceInfo.scopeOfWork}</p>
              </div>
            )}

            {lead.serviceInfo.additionalNotes && (
              <div className="mt-4">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Additional Notes
                </h3>
                <p className="text-slate-700">
                  {lead.serviceInfo.additionalNotes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Additional Information */}
        {lead.expiryDate && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-500" />
              Additional Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Expiry Date</p>
                <p className="font-medium text-slate-900">
                  {formatDate(lead.expiryDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Public Listing</p>
                <p className="font-medium text-slate-900">
                  {lead.isPublic ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Featured</p>
                <p className="font-medium text-slate-900">
                  {lead.isFeatured ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Last Updated</p>
                <p className="font-medium text-slate-900">
                  {formatDate(lead.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default LeadDetailPage;
