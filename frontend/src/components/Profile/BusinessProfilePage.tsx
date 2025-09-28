"use client";

import React, { useState } from "react";
import { IProfile } from "@/types/profile";
import { ILead, LeadType } from "@/types/lead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  Building2,
  Award,
  ExternalLink,
  MessageCircle,
  Star,
  Clock,
  Package,
  Wrench,
  Flag,
} from "lucide-react";
import { NEXT_PUBLIC_S3_BASE_URL } from "@/constant/env";
import Image from "next/image";
import Link from "next/link";
import { categories } from "@/constant/profile";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Api from "@/lib/api";
import { toast } from "sonner";

interface BusinessProfilePageProps {
  profile: IProfile;
  recentLeads: ILead[];
}

const BusinessProfilePage: React.FC<BusinessProfilePageProps> = ({
  profile,
  recentLeads,
}) => {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getProfileCategory = (role: string) => {
    if (categories.category1.includes(role)) return 1;
    if (categories.category2.includes(role)) return 2;
    if (categories.category3.includes(role)) return 3;
    return 1;
  };

  const profileCategory = getProfileCategory(profile.role);

  const handleContact = () => {
    console.log("Contact profile:", profile._id);
  };

  const handleReportProfile = async () => {
    try {
      setSubmitting(true);

      const response = await Api.reportUser(profile.userId, reason);

      if (response.status === 200 || response.status === 201) {
        toast.success("Profile reported successfully", {
          duration: 4000,
          description:
            "Thank you for helping us keep the community safe. Our team will review the report shortly.",
          action: {
            label: "Close",
            onClick: () => toast.dismiss(),
          },
          richColors: true,
        });
      }
      setShowReportDialog(false);
      setReason("");
    } catch (err) {
      console.error("Report failed:", err);
      toast.error(
        (err as any).response.data.message ||
          "An error occurred while reporting the profile",
        {
          duration: 4000,
          position: "top-center",
          action: {
            label: "Close",
            onClick: () => toast.dismiss(),
          },
          richColors: true,
        }
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
        <div className="relative px-6 pb-6">
          {/* Company Logo */}
          <div className="absolute -top-16 left-6">
            <div className="w-24 h-24 bg-white rounded-lg shadow-lg border-4 border-white overflow-hidden">
              {profile.logoFile ? (
                <Image
                  src={`${NEXT_PUBLIC_S3_BASE_URL}/${profile.logoFile.path}`}
                  alt={profile.companyName}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          <div className="pt-12 flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.companyName}
                </h1>
                <Badge variant="outline" className="text-xs">
                  {profile.role.replace("-", " ").toUpperCase()}
                </Badge>
                {profile.status === "active" && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {profile.city}, {profile.state}, {profile.country}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Est. {profile.yearOfEstablishment}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{profile.companySize} employees</span>
                </div>
              </div>

              <p className="text-gray-700 mb-4 max-w-3xl">
                {profile.companyDescription}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{profile.businessCategory}</Badge>
                <Badge variant="secondary">{profile.businessSubcategory}</Badge>
                <Badge variant="secondary">{profile.legalStatus}</Badge>
                {profile.businessModel && (
                  <Badge variant="secondary">{profile.businessModel}</Badge>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-6 lg:mt-0 lg:ml-6">
              <Button
                onClick={handleContact}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Business
              </Button>

              {profile.website && profile.website !== "" && (
                <Button variant="outline" asChild>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}

              {/* Report Dialog */}
              <Dialog
                open={showReportDialog}
                onOpenChange={setShowReportDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                    <Flag className="h-4 w-4 mr-2" />
                    Report Profile
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Report This Business</DialogTitle>
                    <DialogDescription>
                      Please provide a reason for reporting this profile. Our
                      moderation team will review the report.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="report-reason">Reason</Label>
                      <Input
                        id="report-reason"
                        placeholder="Describe the reason..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowReportDialog(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="outline" className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={handleReportProfile}
                      disabled={submitting || !reason.trim()}
                    >
                      {submitting ? "Reporting..." : "Report Profile"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Business Capabilities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Business Capabilities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileCategory === 1 && (
                <Capability
                  icon={<Package className="h-6 w-6 text-blue-600" />}
                  title="Product Sales"
                  text="Can sell physical products"
                  bg="bg-blue-50"
                />
              )}
              {profileCategory === 2 && (
                <>
                  <Capability
                    icon={<Package className="h-6 w-6 text-blue-600" />}
                    title="Product Sales"
                    text="Can sell physical products"
                    bg="bg-blue-50"
                  />
                  <Capability
                    icon={<Wrench className="h-6 w-6 text-green-600" />}
                    title="Service Provision"
                    text="Can provide services"
                    bg="bg-green-50"
                  />
                </>
              )}
              {profileCategory === 3 && (
                <Capability
                  icon={<Wrench className="h-6 w-6 text-green-600" />}
                  title="Service Provision"
                  text="Can provide services"
                  bg="bg-green-50"
                />
              )}
            </div>
          </div>

          {/* Recent Leads */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Leads
              </h2>
              <Badge variant="outline">{recentLeads.length} active leads</Badge>
            </div>

            {recentLeads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentLeads.map((lead) => (
                  <div
                    key={lead._id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {lead.leadType === LeadType.PRODUCT ? (
                        <Package className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Wrench className="h-4 w-4 text-green-600" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {lead.leadType}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {lead.leadIntent}
                      </Badge>
                    </div>

                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                      {lead.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {lead.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{lead.location.city}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(lead.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Link href={`/browse/${lead._id}`}>
                        <Button size="sm" variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Recent Leads
                </h3>
                <p className="text-gray-600">
                  This business hasn't posted any leads recently.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar profile={profile} />
      </div>
    </div>
  );
};

/* ---------- Helpers ---------- */
const Capability = ({
  icon,
  title,
  text,
  bg,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  bg: string;
}) => (
  <div className={`flex items-center gap-3 p-4 ${bg} rounded-lg`}>
    {icon}
    <div>
      <h3 className="font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  </div>
);

const Sidebar = ({ profile }: { profile: IProfile }) => (
  <div className="space-y-6">
    {/* Contact */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Contact Information
      </h3>
      <div className="space-y-3">
        <Info
          icon={<Phone className="h-4 w-4 text-gray-400" />}
          text={profile.mobile}
        />
        {profile.landline && (
          <Info
            icon={<Phone className="h-4 w-4 text-gray-400" />}
            text={profile.landline}
          />
        )}
        <Info
          icon={<Mail className="h-4 w-4 text-gray-400" />}
          text={profile.email}
        />
        {profile.website && profile.website !== "" && (
          <Info
            icon={<Globe className="h-4 w-4 text-gray-400" />}
            text={
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                {profile.website}
              </a>
            }
          />
        )}
      </div>
    </div>

    {/* Address */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Business Address
      </h3>
      <div className="text-sm text-gray-700 space-y-1">
        <p>{profile.address1}</p>
        {profile.address2 && <p>{profile.address2}</p>}
        <p>
          {profile.city}, {profile.state} {profile.zip}
        </p>
        <p>{profile.country}</p>
      </div>
    </div>

    {/* Certifications */}
    {profile.certifications && (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <Award className="h-5 w-5 inline mr-2" />
          Certifications
        </h3>
        <p className="text-sm text-gray-700">{profile.certifications}</p>
      </div>
    )}

    {/* Socials */}
    {profile.socials && Object.keys(profile.socials).length > 0 && (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Social Media
        </h3>
        <div className="space-y-2">
          {Object.entries(profile.socials).map(
            ([platform, url]) =>
              url && (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-3 w-3" />
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </a>
              )
          )}
        </div>
      </div>
    )}
  </div>
);

const Info = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: React.ReactNode;
}) => (
  <div className="flex items-center gap-3 text-sm text-gray-700">
    {icon}
    {text}
  </div>
);

export default BusinessProfilePage;
