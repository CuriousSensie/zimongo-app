"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { locationService } from "@/utils/country-state-city";
import { toast } from "sonner";
import { LeadType } from "@/types/lead";
import { IProfile } from "@/types/profile";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FinalDetailsStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onSubmit: () => void;
  onPrev: () => void;
  loading: boolean;
  profile: IProfile | undefined;
}

const FinalDetailsStep: React.FC<FinalDetailsStepProps> = ({
  data,
  onUpdate,
  onSubmit,
  onPrev,
  loading,
  profile,
}) => {
  const [country, setCountry] = useState();
  const [state, setState] = useState();

  useEffect(() => {
    const getLocationFromProfile = async () => {
      if (!profile) return;
      const profCountry = await locationService.getCountryFromCode(
        profile.country
      );
      if (profCountry) setCountry(profCountry.name);
      const profState = await locationService.getStateFromCode(
        profile.country,
        profile.state
      );
      if (profState) setState(profState.name);
      onUpdate({
        location: {
          country: profCountry?.iso2,
          state: profState?.iso2,
          city: profile?.city,
        },
      });
      // handleChange("location.city", profile?.city);
    };

    getLocationFromProfile();
  }, []);

  const handleChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      onUpdate({
        [parent]: {
          ...data[parent],
          [child]: value,
        },
      });
    } else {
      onUpdate({ [field]: value });
    }
  };

  console.log(data);

  const validateStep = () => {
    return data.location.city && data.location?.state && data.location?.city;
  };

  const handleSubmit = () => {
    if (validateStep()) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold mb-2">Final Details</h3>
        <p className="text-gray-600">
          Add budget information, location, and additional settings to complete
          your lead
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Budget Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Budget Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700">Budget</Label>
              <Input
                type="number"
                className="bg-white"
                value={data.budget || ""}
                onChange={(e) =>
                  handleChange(
                    "budget",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                placeholder="Enter your budget"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Currency</Label>
              <Select
                value={data.currency || "USD"}
                onValueChange={(value) => handleChange("currency", value)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Location *</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700">Country *</Label>
              <Input
                type="text"
                className="bg-white"
                // value={country}
                disabled
                placeholder={country}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">State *</Label>
              <Input
                type="text"
                className="bg-white"
                // value={state}
                disabled
                placeholder={state}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">City *</Label>
              <Input
                type="text"
                className="bg-white"
                value={profile?.city}
                placeholder={profile?.city}
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700">Address</Label>
              <Input
                className="bg-white"
                value={data.location?.address || ""}
                onChange={(e) =>
                  handleChange("location.address", e.target.value)
                }
                placeholder="Street address (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">ZIP Code</Label>
              <Input
                className="bg-white"
                value={data.location?.zipCode || ""}
                onChange={(e) =>
                  handleChange("location.zipCode", e.target.value)
                }
                placeholder="ZIP/Postal code (optional)"
              />
            </div>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Additional Settings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700">Priority</Label>
              <Select
                value={data.priority || "medium"}
                onValueChange={(value) => handleChange("priority", value)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Expiry Date</Label>
              <Input
                type="date"
                className="bg-white"
                value={data.expiryDate || ""}
                onChange={(e) => handleChange("expiryDate", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={data.isPublic !== false}
              onChange={(e) => handleChange("isPublic", e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="isPublic" className="text-slate-700">
              Make this lead publicly visible
            </Label>
          </div>
        </div>

        {/* Validation Messages */}
        {!validateStep() && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              Please select country, state, and city to create your lead.
            </p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={loading}
          className="px-8 py-2"
        >
          Back
        </Button>
        <Dialog>
          <DialogTrigger>
            <Button className="px-8 py-2 min-w-[120px]">Create Lead </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                Once the leads are created, their content cannot be edited.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-between w-full">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!validateStep() || loading}
                className="px-8 py-2 min-w-[120px]"
              >
                Yes! Create Lead
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FinalDetailsStep;
