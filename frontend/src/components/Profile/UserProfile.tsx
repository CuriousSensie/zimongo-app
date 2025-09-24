"use client";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { onboarding } from "@/constant/onboarding";
import { toast } from "sonner";
import Api from "@/lib/api";
import useUser from "@/hooks/useUser";
import { IProfile } from "@/types/profile";
import { Tooltip } from "../ui/tooltip";
import { locationService } from "@/utils/country-state-city";
import Image from "next/image";
import { NEXT_PUBLIC_S3_BASE_URL } from "@/constant/env";
import ZoomableImage from "../common/ZoomableImage";
import { z } from "zod";
import Avatar from "@/assets/logo.png";

const profileSchema = z.object({
  companyDescription: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  legalStatus: z.string().nonempty("Legal status is required"),
  yearOfEstablishment: z.coerce
    .number()
    .min(1950, { message: "Year must be after 1950" })
    .max(new Date().getFullYear(), {
      message: `Year cannot be later than ${new Date().getFullYear()}`,
    }),
  companySize: z.string().nonempty("Company size is required"),
  businessModel: z.string().nonempty("Business model is required"),

  // Contact details
  address1: z.string().min(3, "Address Line 1 is required"),
  address2: z.string().optional(),
  zip: z.string().min(4, "ZIP/Postal code is invalid"),
  mobile: z.string().min(8, "Mobile number is required"),
  landline: z.string().optional(),
  email: z.email("Invalid email address"),
  website: z.url("Invalid website"),

  // Socials (optional)
  facebook: z.url("Invalid URL for Facebook").optional().or(z.literal("")),
  insta: z.url("Invalid URL for Instagram").optional().or(z.literal("")),
  linkedin: z.url("Invalid URL for Linkedin").optional().or(z.literal("")),
  twitter: z.url("Invalid URL for Twitter").optional().or(z.literal("")),
  youtube: z.url("Invalid URL for YouTube").optional().or(z.literal("")),
  tiktok: z.url("Invalid URL for TikTok").optional().or(z.literal("")),
});

const ProfilePage = () => {
  const user = useUser();
  const [profile, setProfile] = useState<IProfile>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [country, setCountry] = useState<string>("");
  const [state, setState] = useState<string>("");

  // fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await Api.getProfileByUserId(user.me?._id);
        if (res.status === 200) {
          setProfile(res.data.data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Profile fetch failed.", {
          description: (err as Error).message,
          position: "top-center",
          richColors: true,
          action: {
            label: "Close",
            onClick: () => window.location.reload(),
          },
        });
      } finally {
        setLoading(false);
      }
    };

    if (user.me?._id) fetchProfile();
  }, [user?.me]);

  useEffect(() => {
    const getLocationNames = async () => {
      if (profile?.country) {
        const country = await locationService.getCountryFromCode(
          profile.country
        );
        if (country) setCountry(country.name);

        const state = await locationService.getStateFromCode(
          profile.country,
          profile.state
        );
        if (state) setState(state.name);
      }
    };

    getLocationNames();
  }, [profile?.country]);

  const handleChange = (field: string, value: any) => {
    if (
      [
        "facebook",
        "insta",
        "linkedin",
        "twitter",
        "youtube",
        "tiktok",
      ].includes(field)
    ) {
      setProfile((prev: any) => ({
        ...prev,
        socials: {
          ...prev.socials,
          [field]: value,
        },
      }));
    } else {
      setProfile((prev: any) => ({ ...prev, [field]: value }));
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    if (e.target.files && e.target.files[0]) {
      handleChange(field, e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (!profile?._id) return;

    const validation = profileSchema.safeParse({
      ...profile,
      ...((profile.socials as any) || {}), // flatten socials
    });

    if (!validation.success) {
      validation.error.issues.forEach((err) => {
        toast.error(err.message, {
          position: "top-center",
          richColors: true,
        });
      });
      return; // stop save if invalid
    }

    setSaving(true);
    try {
      const form = new FormData();

      // Clone profile but remove logoFile (we handle separately)
      const { logoFile, ...rest } = profile;
      form.append("data", JSON.stringify(rest));

      // Only append logoFile as 'file' if user uploaded a new file
      if (logoFile instanceof File) {
        form.append("logoFile", logoFile);
      }

      const res = await Api.updateProfile(profile._id, form);

      if (res.status === 200) {
        setProfile(res.data.data);
        toast.success("Profile updated successfully", {
          position: "top-center",
          richColors: true,
        });
      } else {
        toast.error(res.data.msg || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("Profile updated failed.", {
        description: (err as Error).message,
        position: "top-center",
        richColors: true,
        action: {
          label: "Close",
          onClick: () => window.location.reload(),
        },
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading profile...</div>;
  if (!profile) return <div className="p-6">Profile not found</div>;

  return (
    <>
      <div className="p-6 md:w-5/6 lg:w-3/4 mx-auto flex flex-col gap-6 overflow-y-auto">
        <div className="w-full flex justify-between items-center bg-slate-50 rounded-lg p-3">
          <Tooltip content="Click on the image to zoom.">
            <div className="flex flex-row gap-2 items-center">
              {profile.logoFile?.path ? (
                <div className="w-12 h-12">
                  <ZoomableImage
                    src={`${NEXT_PUBLIC_S3_BASE_URL}/${profile.logoFile?.path}`}
                    alt={profile.logoFile.originalName}
                    className="rounded-full"
                  />
                </div>
              ) : (
                <div className="w-12 h-12">
                  <Image
                    src={Avatar}
                    alt="logo"
                    className="rounded-full object-contain w-full h-full"
                  />
                </div>
              )}
              <h1 className="text-2xl font-semibold text-center">
                {user.me?.name}'s Profile
              </h1>
            </div>
          </Tooltip>

          <Button disabled={saving} onClick={handleSave}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Business Details */}
        <div className="border-b border-slate-300 pb-6 flex flex-col gap-6">
          <h2 className="text-lg font-semibold">Business Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Tooltip content="These fields are not editable">
              <div className="flex flex-col gap-2">
                <Label className="text-slate-700">Business Role</Label>
                <Input className="bg-white" value={profile.role} disabled />
              </div>
            </Tooltip>
            <Tooltip content="These fields are not editable">
              <div className="flex flex-col gap-2">
                <Label className="text-slate-700">Company Name</Label>
                <Input
                  className="bg-white"
                  value={profile.companyName}
                  disabled
                />
              </div>
            </Tooltip>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-slate-700">Company Description</Label>
            <Textarea
              className="bg-white"
              value={profile.companyDescription || ""}
              onChange={(e) =>
                handleChange("companyDescription", e.target.value)
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-slate-700">Legal Status</Label>
              <Select
                value={profile.legalStatus}
                onValueChange={(v) => handleChange("legalStatus", v)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Legal Status" />
                </SelectTrigger>
                <SelectContent>
                  {onboarding.legalStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-slate-700">Year of Establishment</Label>
              <Input
                type="number"
                className="bg-white"
                value={profile.yearOfEstablishment || ""}
                onChange={(e) =>
                  handleChange("yearOfEstablishment", e.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-slate-700">Company Size</Label>
              <Select
                value={profile.companySize}
                onValueChange={(v) => handleChange("companySize", v)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Size" />
                </SelectTrigger>
                <SelectContent>
                  {onboarding.companySizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.Label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 items-center justify-between">
            <Label className="text-slate-700">
              Company Logo / Personal Photo
            </Label>
            <Input
              type="file"
              accept="image/*"
              className="bg-white"
              onChange={(e) => handleFileChange(e, "logoFile")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-slate-700">Business Model</Label>
            <Select
              value={profile.businessModel}
              onValueChange={(v) => handleChange("businessModel", v)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent>
                {onboarding.businessModels.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Contact Details */}
        <div className="flex flex-col gap-6 border-b border-slate-300 pb-6">
          <h2 className="text-lg font-semibold">Contact Details</h2>
          <Tooltip content="These fields are not editable">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-slate-700">Country</Label>
                <Input className="bg-white" value={country} disabled />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-slate-700">State</Label>
                <Input className="bg-white" value={state} disabled />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-slate-700">City</Label>
                <Input className="bg-white" value={profile.city} disabled />
              </div>
            </div>
          </Tooltip>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-slate-700">Address Line 1</Label>
              <Input
                className="bg-white"
                value={profile.address1 || ""}
                onChange={(e) => handleChange("address1", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-slate-700">Address Line 2</Label>
              <Input
                className="bg-white"
                value={profile.address2 || ""}
                onChange={(e) => handleChange("address2", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-slate-700">ZIP / Postal Code</Label>
              <Input
                className="bg-white"
                value={profile.zip || ""}
                onChange={(e) => handleChange("zip", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-slate-700">Mobile Number</Label>
              <Input
                className="bg-white"
                value={profile.mobile || ""}
                onChange={(e) => handleChange("mobile", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-slate-700">Landline</Label>
              <Input
                className="bg-white"
                value={profile.landline || ""}
                onChange={(e) => handleChange("landline", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-slate-700">Email Address</Label>
              <Input
                type="email"
                className="bg-white"
                value={profile.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-slate-700">Website</Label>
              <Input
                className="bg-white"
                value={profile.website || ""}
                onChange={(e) => handleChange("website", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Socials */}
        <h2 className="text-lg font-semibold">Socials</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "facebook", label: "Facebook" },
            { key: "insta", label: "Instagram" },
            { key: "linkedin", label: "LinkedIn" },
            { key: "twitter", label: "Twitter / X" },
            { key: "youtube", label: "YouTube" },
            { key: "tiktok", label: "TikTok" },
          ].map((social) => (
            <div key={social.key} className="flex flex-col gap-2">
              <Label className="text-slate-700">{social.label}</Label>
              <Input
                className="bg-white"
                value={(profile.socials as any)?.[social.key] || ""}
                onChange={(e) => handleChange(social.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
