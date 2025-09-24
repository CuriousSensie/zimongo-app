"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ILead } from "@/types/lead";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Eye,
  DollarSign,
  Package,
  Settings,
  Clock,
  User,
  Building,
  Handshake,
  Share2,
  Heart,
  MessageCircle,
  Phone,
  Mail,
  Bookmark,
  BookmarkCheck,
  ThumbsUp,
} from "lucide-react";
import { locationService } from "@/utils/country-state-city";
import ImageCarousel from "@/components/common/ImageCarousel";
import SiteHeader from "@/components/common/Headers/SiteHeader";
import Api from "@/lib/api";
import { markLeadAsViewed } from "@/hooks/useViewTracking";
import useUser from "@/hooks/useUser";

const BrowseLeadDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<ILead | null>(null);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<string | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const { me, isAuthenticated } = useUser();

  const leadId = params.leadId as string;

  useEffect(() => {
    const fetchLead = async () => {
      try {
        if (!isAuthenticated || !leadId) {
          return;
        }
        setLoading(true);
        const response = await Api.getLeadById(leadId);

        if (response.status === 200) {
          setLead(response.data.data);
          // Increment view count when lead details are successfully loaded
          await markLeadAsViewed(leadId);

          // Check if lead is saved by current user
          if (isAuthenticated && me) {
            try {
              const savedResponse = await Api.checkIfLeadIsSaved(leadId);
              setIsSaved(savedResponse.data.isSaved);
            } catch (error) {
              // silently fail
            }
          }
        }
      } catch (error) {
        console.error("Error fetching lead:", error);
        toast.error("Failed to fetch lead details", {
          position: "top-center",
          richColors: true,
          description: (error as Error).message,
        });
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: lead?.title,
          text: lead?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? "Removed from favorites" : "Added to favorites");
  };

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save leads", {
        position: "top-center",
        richColors: true,
        action: { label: "Sign In", onClick: () => router.push("/signin") },
        duration: 5000,
      });
      return;
    }

    if (!leadId) return;

    setSaveLoading(true);
    try {
      if (isSaved) {
        await Api.unsaveLead(leadId);
        setIsSaved(false);
        toast.success("Lead removed from saved");
      } else {
        await Api.saveLead(leadId);
        setIsSaved(true);
        toast.success("Lead saved to your dashboard");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to save lead";
      toast.error(errorMessage);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleContact = () => {
    if (lead?.profileId && (lead.profileId as any)?.slug) {
      window.location.href = `/profiles/${(lead.profileId as any).slug}`;
    } else {
      toast.info("Contact information not available!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SiteHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading lead details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SiteHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">
              Sign in to view lead details.
            </p>
            <Button onClick={() => router.push("/signin")} className="mt-4">
              Sign in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SiteHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">Lead not found</p>
            <Button onClick={() => router.push("/browse")} className="mt-4">
              Back to Browse
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/browse")}
            className="text-slate-600 hover:text-slate-900 p-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge
                  variant="outline"
                  className="bg-purple-50 text-purple-700 border-purple-200 font-medium"
                >
                  {lead?.leadIntent?.toUpperCase()}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 font-medium"
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

              <h1 className="text-4xl font-bold text-slate-900 mb-4">
                {lead?.title}
              </h1>

              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                {lead?.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleContact}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Seller
                </Button>
                <Button variant="outline" onClick={handleLike}>
                  <Heart
                    className={`w-4 h-4 mr-2 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
                  />
                  {isLiked ? "Saved" : "Save"}
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Product Images */}
            {lead.leadType === "product" &&
              lead.productInfo?.productFiles &&
              lead.productInfo.productFiles.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-8">
                  <ImageCarousel
                    images={lead.productInfo.productFiles}
                    className="w-full"
                    showImageDetails={false}
                  />
                </div>
              )}

            {/* Product Details */}
            {lead.leadType === "product" && lead.productInfo && (
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center">
                  <Package className="w-6 h-6 mr-3 text-blue-500" />
                  Product Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-4 text-lg">
                        Basic Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">
                            Product Name
                          </p>
                          <p className="text-slate-900 font-medium">
                            {lead.productInfo.productName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">
                            Category
                          </p>
                          <p className="text-slate-900">
                            {lead.productInfo.productCategory}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">
                            Description
                          </p>
                          <p className="text-slate-900">
                            {lead.productInfo.productDescription}
                          </p>
                        </div>
                        {lead.productInfo.brandOrModel && (
                          <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">
                              Brand/Model
                            </p>
                            <p className="text-slate-900">
                              {lead.productInfo.brandOrModel}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-4 text-lg">
                        Specifications
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">
                            Minimum Order Quantity
                          </p>
                          <p className="text-slate-900 font-medium">
                            {lead.productInfo.minimumOrderQuantity}{" "}
                            {lead.productInfo.unitOfMeasurement}
                          </p>
                        </div>
                        {lead.productInfo.budgetPerUnit && (
                          <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">
                              Budget per Unit
                            </p>
                            <p className="text-slate-900 font-semibold">
                              {lead.currency} {lead.productInfo.budgetPerUnit}
                            </p>
                          </div>
                        )}
                        {lead.productInfo.expectedDeliveryDate && (
                          <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">
                              Expected Delivery
                            </p>
                            <p className="text-slate-900">
                              {formatDate(
                                lead.productInfo.expectedDeliveryDate
                              )}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">
                            Delivery Location
                          </p>
                          <p className="text-slate-900">
                            {lead.productInfo.deliveryLocation}
                          </p>
                        </div>
                        {lead.productInfo.dimensions && (
                          <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">
                              Dimensions
                            </p>
                            {lead.productInfo.dimensions.length ? (
                              <p className="text-slate-900">
                                {lead.productInfo.dimensions.length} ×{" "}
                                {lead.productInfo.dimensions.width} ×{" "}
                                {lead.productInfo.dimensions.height}{" "}
                                {lead.productInfo.dimensions.unit}
                              </p>
                            ) : (
                              <p className="text-slate-500">Not Specified</p>
                            )}
                          </div>
                        )}
                        {lead.productInfo.weight && (
                          <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">
                              Weight
                            </p>
                            <p className="text-slate-900">
                              {lead.productInfo.weight.value}{" "}
                              {lead.productInfo.weight.unit}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {lead.productInfo.additionalNotes && (
                  <div className="mt-8 pt-6 border-t">
                    <h3 className="font-semibold text-slate-900 mb-3 text-lg">
                      Additional Notes
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      {lead.productInfo.additionalNotes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Service Details */}
            {lead.leadType === "service" && lead.serviceInfo && (
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center">
                  <Settings className="w-6 h-6 mr-3 text-green-500" />
                  Service Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-4 text-lg">
                        Service Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">
                            Service Name
                          </p>
                          <p className="text-slate-900 font-medium">
                            {lead.serviceInfo.serviceName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">
                            Category
                          </p>
                          <p className="text-slate-900">
                            {lead.serviceInfo.serviceCategory}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">
                            Description
                          </p>
                          <p className="text-slate-900">
                            {lead.serviceInfo.serviceDescription}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">
                            Type of Service
                          </p>
                          <p className="text-slate-900">
                            {lead.serviceInfo.typeOfService}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">
                            Location
                          </p>
                          <p className="text-slate-900">
                            {lead.serviceInfo.locationOfService}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">
                            Remote Service
                          </p>
                          <p className="text-slate-900">
                            {lead.serviceInfo.isRemote ? "Yes" : "No"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-4 text-lg">
                        Timeline & Budget
                      </h3>
                      <div className="space-y-4">
                        {lead.serviceInfo.startDate && (
                          <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">
                              Start Date
                            </p>
                            <p className="text-slate-900">
                              {formatDate(lead.serviceInfo.startDate)}
                            </p>
                          </div>
                        )}
                        {lead.serviceInfo.endDate && (
                          <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">
                              End Date
                            </p>
                            <p className="text-slate-900">
                              {formatDate(lead.serviceInfo.endDate)}
                            </p>
                          </div>
                        )}
                        {lead.serviceInfo.serviceFrequency && (
                          <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">
                              Frequency
                            </p>
                            <p className="text-slate-900">
                              {lead.serviceInfo.serviceFrequency}
                            </p>
                          </div>
                        )}
                        {lead.serviceInfo.budgetEstimate && (
                          <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">
                              Budget Estimate
                            </p>
                            <p className="text-slate-900 font-semibold ">
                              {lead.currency}{" "}
                              {lead.serviceInfo.budgetEstimate.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {lead.serviceInfo.skillsOrExpertiseNeeded && (
                          <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">
                              Required Skills
                            </p>
                            <p className="text-slate-900">
                              {lead.serviceInfo.skillsOrExpertiseNeeded}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {lead.serviceInfo.scopeOfWork && (
                  <div className="mt-8 pt-6 border-t">
                    <h3 className="font-semibold text-slate-900 mb-3 text-lg">
                      Scope of Work
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      {lead.serviceInfo.scopeOfWork}
                    </p>
                  </div>
                )}

                {lead.serviceInfo.additionalNotes && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-slate-900 mb-3 text-lg">
                      Additional Notes
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      {lead.serviceInfo.additionalNotes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-slate-600">
                    <Eye className="w-4 h-4 mr-2" />
                    <span className="text-sm">Views</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {lead.views}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-slate-600">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    <span className="text-sm">Upvotes</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {lead.upvotes || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-slate-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">Posted</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {formatDate(lead.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Budget Information */}
            {lead.budget && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Budget
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {lead.currency} {lead.budget.toLocaleString()}
                </p>
              </div>
            )}

            {/* Location Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-red-500" />
                Location
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-500">Country</p>
                  <p className="font-medium text-slate-900">{country}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">State</p>
                  <p className="font-medium text-slate-900">{state}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">City</p>
                  <p className="font-medium text-slate-900">
                    {lead.location.city}
                  </p>
                </div>
                {lead.location.zipCode && (
                  <div>
                    <p className="text-sm text-slate-500">ZIP Code</p>
                    <p className="font-medium text-slate-900">
                      {lead.location.zipCode}
                    </p>
                  </div>
                )}
                {lead.location.address && (
                  <div>
                    <p className="text-sm text-slate-500">Address</p>
                    <p className="font-medium text-slate-900">
                      {lead.location.address}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            {lead.expiryDate && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-orange-500" />
                  Additional Info
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-500">Expiry Date</p>
                    <p className="font-medium text-slate-900">
                      {formatDate(lead.expiryDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Last Updated</p>
                    <p className="font-medium text-slate-900">
                      {formatDate(lead.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact CTA */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-3">Interested?</h3>
              <p className="text-sm text-slate-600 mb-4">
                Get in touch with the seller to discuss this opportunity.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveToggle}
                  disabled={saveLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isSaved ? (
                    <BookmarkCheck className="w-4 h-4" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                  {saveLoading ? "Saving..." : isSaved ? "Saved" : "Save"}
                </Button>
                <Button
                  onClick={handleContact}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseLeadDetailPage;
