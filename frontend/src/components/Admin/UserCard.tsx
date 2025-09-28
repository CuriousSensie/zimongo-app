"use client";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Building2,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Globe,
  Shield,
  ShieldOff,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  _id: string;
  slug: string;
  role: string;
  companyName: string;
  businessCategory: string;
  country: string;
  city: string;
  mobile: string;
  website: string;
  logoFile?: {
    path: string;
    originalName: string;
  };
  status: string;
  createdAt: string;
}

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
  profile: UserProfile | null;
}

interface UserCardProps {
  user: UserData;
  onStatusChange: (
    userId: string,
    action: "activate" | "deactivate"
  ) => Promise<void>;
}

const UserCard: React.FC<UserCardProps> = ({ user, onStatusChange }) => {
  const [hostWithoutSubdomain, setHostWithoutSubdomain] = useState<string>("");

  const host = window.location.host || "zimongo.com";

  // Safe window access
  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.host;
      const subdomain = host.split(".")[0];
      const cleanedHost = host.replace(`${subdomain}.`, "");
      console.log(host, subdomain, cleanedHost);
      setHostWithoutSubdomain(cleanedHost);
    }
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (action: "activate" | "deactivate") => {
    setIsLoading(true);
    try {
      await onStatusChange(user._id, action);
      toast.success(`User ${action}d successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (user.isDeactivated) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Deactivated
        </Badge>
      );
    }
    if (user.reportedCount >= 1) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Reported ({user.reportedCount})
        </Badge>
      );
    }
    return (
      <Badge
        variant="default"
        className="flex items-center gap-1 bg-green-100 text-green-800"
      >
        <CheckCircle className="h-3 w-3" />
        Active
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col space-y-4">
        {/* Header with Avatar and Basic Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.picture?.path} alt={user.name} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {user.name?.charAt(0)?.toUpperCase() ||
                  user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">
                  {user.name || "No Name"}
                </h3>
                {user.isAdmin && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
              {!user.isEmailVerified && (
                <Badge variant="destructive" className="mt-1">
                  Email Not Verified
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge()}
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Joined {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* Profile Information */}
        {user.profile ? (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">
                    {user.profile.companyName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{user.profile.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {user.profile.city}, {user.profile.country}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{user.profile.mobile}</span>
                </div>
                {user.profile.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <a
                      href={user.profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {user.profile.website}
                    </a>
                  </div>
                )}
                <Badge variant="outline">{user.profile.businessCategory}</Badge>
                {user.reportedCount > 0 && (
                  <div className="mt-2">
                    <Badge variant="destructive">
                      {user.reportedCount} Report
                      {user.reportedCount !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t pt-4">
            <p className="text-gray-500 italic">
              No profile information available
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {!user.isAdmin && (
          <div className="flex flex-wrap gap-2 pt-2 justify-end ">
            {user.profile?._id && (
              <Button
                onClick={() => {
                  if (user.profile) {
                    const profileUrl =
                      host.includes("localhost") || host.includes("127.0.0.1")
                        ? `http://${hostWithoutSubdomain}/profiles/${user.profile.slug}`
                        : `https://${hostWithoutSubdomain}/profiles/${user.profile.slug}`;
                    window.open(profileUrl, "_blank");
                  }
                }}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Profile
              </Button>
            )}
            {user.isDeactivated ? (
              <Button
                onClick={() => handleStatusChange("activate")}
                disabled={isLoading}
                size="sm"
                className="flex items-center gap-2"
                variant="default"
              >
                <CheckCircle className="h-4 w-4" />
                Activate
              </Button>
            ) : (
              <Button
                onClick={() => handleStatusChange("deactivate")}
                disabled={isLoading}
                size="sm"
                className="flex items-center gap-2"
                variant="destructive"
              >
                <ShieldOff className="h-4 w-4" />
                Deactivate
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default UserCard;
