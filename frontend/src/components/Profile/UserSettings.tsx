"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield,
  ShieldCheck,
  ShieldX,
  User,
  Mail,
  Calendar,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import useUser from "@/hooks/useUser";
import Api from "@/lib/api";
import { signOut } from "next-auth/react";

interface UserSettings {
  _id: string;
  email: string;
  name: string;
  is2FA: boolean;
  isEmailVerified: boolean;
  profileSlug: string;
  picture?: {
    type: string;
    path: string;
    originalName: string;
  };
  createdAt: string;
  updatedAt: string;
  knownIps: string[];
  knownLocation: string[];
}

export default function SettingsPageComp() {
  const { me } = useUser();
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<boolean | null>(null);

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      setLoading(true);
      const response = await Api.getUserSettings();
      setUserSettings(response.data.user);
    } catch (error) {
      console.error("Failed to fetch user settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = (newValue: boolean) => {
    setPendingToggle(newValue);
    setShowConfirmation(true);
  };

  const confirmToggle2FA = async () => {
    if (pendingToggle === null) return;

    try {
      setUpdating(true);
      const response = await Api.updateUserSettings(pendingToggle);

      setUserSettings(response.data.user);
      // TODO: Refresh user data in the hook

      toast.success(
        `Two-factor authentication ${pendingToggle ? "enabled" : "disabled"} successfully`,
        {
          duration: 5000,
          action: {
            label: "Close",
            onClick: () => toast.dismiss(),
          },
          richColors: true,
          position: "top-center",
        }
      );
      setShowConfirmation(false);
      setPendingToggle(null);
    } catch (error) {
      console.error("Failed to update 2FA setting:", error);
      toast.error("Failed to update 2FA setting", {
        duration: 5000,
        action: {
          label: "Retry",
          onClick: () => confirmToggle2FA(),
        },
        richColors: true,
        position: "top-center",
      });
    } finally {
      setUpdating(false);
    }
  };

  const cancelToggle2FA = () => {
    setShowConfirmation(false);
    setPendingToggle(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userSettings) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Failed to load settings
          </h2>
          <p className="text-gray-600 mt-2">Please try refreshing the page</p>
          <Button onClick={fetchUserSettings} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 ">
      <div className="space-y-6">
        {/* User Information Section */}
        <div className="bg-white shadow rounded-lg p-6  max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {userSettings.name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="flex items-center mt-1">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <p className="text-sm text-gray-900">{userSettings.email}</p>
                  {userSettings.isEmailVerified ? (
                    <ShieldCheck className="w-4 h-4 ml-2 text-green-500" />
                  ) : (
                    <ShieldX className="w-4 h-4 ml-2 text-red-500" />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Profile Slug
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {userSettings.profileSlug || "Not set"}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Member Since
                </label>
                <div className="flex items-center mt-1">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <p className="text-sm text-gray-900">
                    {formatDate(userSettings.createdAt)}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Updated
                </label>
                <div className="flex items-center mt-1">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(userSettings.updatedAt)}
                  </p>
                </div>
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700">
                  Known Locations
                </label>
                <div className="flex items-start mt-1">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                  <div className="text-sm text-gray-900">
                    {userSettings.knownLocation?.length > 0 ? (
                      <ul className="space-y-1">
                        {userSettings.knownLocation
                          .slice(0, 3)
                          .map((location, index) => (
                            <li key={index}>{location}</li>
                          ))}
                        {userSettings.knownLocation?.length > 3 && (
                          <li className="text-gray-500">
                            +{userSettings.knownLocation?.length - 3} more
                          </li>
                        )}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No known locations</p>
                    )}
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Security Settings Section */}
        <div className="bg-white shadow rounded-lg p-6  max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Security Settings
          </h2>

          {/* 2FA Toggle */}
          <div className="border border-gray-200 rounded-lg p-4 mb-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center mt-2">
                  <div className="flex flex-col md:flex-row justify-between gap-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      Two-Factor Authentication
                    </h3>
                    {userSettings.is2FA ? (
                      <div className="flex items-center">
                        <ShieldCheck className="w-4 h-4 mr-2 text-green-500" />
                        <span className="text-sm font-medium text-green-700">
                          Enabled
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <ShieldX className="w-4 h-4 mr-2 text-red-500" />
                        <span className="text-sm font-medium text-red-700">
                          Disabled
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-1">
                  Add an extra layer of security to your account by requiring a
                  verification code in addition to your password.
                </p>
              </div>
              <div className="w-full md:w-auto md:ml-4">
                <Button
                  variant={userSettings.is2FA ? "destructive" : "default"}
                  onClick={() => handleToggle2FA(!userSettings.is2FA)}
                  disabled={updating}
                  className="w-full md:w-auto min-w-32"
                >
                  {userSettings.is2FA ? "Disable 2FA" : "Enable 2FA"}
                </Button>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row gap-2 items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">
                Sign out of your account
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                You’ll be securely logged out from this device. You can log back
                in anytime.
              </p>
            </div>
            <div className="w-full md:w-auto md:ml-4">
              <Button
                variant="destructive"
                className="w-full md:w-auto min-w-32"
                onClick={() => {
                  const callbackUrl = "/";

                  signOut({ callbackUrl }).then(() => {
                    window.location.href = callbackUrl;
                    toast.success("You have been Logout", {
                      position: "top-center",
                      richColors: true,
                      duration: 3000,
                      action: {
                        label: "Close",
                        onClick: () => toast.dismiss(),
                      },
                    });
                  });
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingToggle ? "Enable" : "Disable"} Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              {pendingToggle ? (
                <>
                  Are you sure you want to enable two-factor authentication? You
                  will need to verify your identity with an OTP code sent to
                  your email each time you log in.
                </>
              ) : (
                <>
                  Are you sure you want to disable two-factor authentication?
                  This will make your account less secure as you won't need to
                  verify your identity with an OTP code.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelToggle2FA}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              variant={pendingToggle ? "default" : "destructive"}
              onClick={confirmToggle2FA}
              disabled={updating}
            >
              {updating
                ? "Updating..."
                : pendingToggle
                  ? "Enable 2FA"
                  : "Disable 2FA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
