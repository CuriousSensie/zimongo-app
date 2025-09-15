"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LeadType } from "@/types/lead";

interface BasicDetailsStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const BasicDetailsStep: React.FC<BasicDetailsStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrev,
}) => {
  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleNext = () => {
    if (data.title && data.description) {
      onNext();
    }
  };

  const getPlaceholderTitle = () => {
    const action = data.intent === "buy" ? "Looking for" : "Offering";
    const type = data.leadType === LeadType.PRODUCT ? "Product" : "Service";
    return `${action} ${type} - Enter a clear, descriptive title`;
  };

  const getPlaceholderDescription = () => {
    if (data.intent === "buy") {
      return data.leadType === LeadType.PRODUCT
        ? "Describe what product you need, its purpose, and any specific requirements..."
        : "Describe what service you need, the scope of work, and your expectations...";
    } else {
      return data.leadType === LeadType.PRODUCT
        ? "Describe what product you're offering, its benefits, and key features..."
        : "Describe what service you're offering, your expertise, and what clients can expect...";
    }
  };

  const isValid =
    data.title &&
    data.title.length >= 5 &&
    data.description &&
    data.description.length >= 20;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold mb-2">Tell us about your lead</h3>
        <p className="text-gray-600">
          Provide basic information that will help others understand what you're{" "}
          {data.intent === "buy" ? "looking for" : "offering"}
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">Title *</Label>
          <Input
            className="bg-white"
            value={data.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder={getPlaceholderTitle()}
            required
          />
          <p className="text-xs text-gray-500">
            Minimum 5 characters. Be specific and clear.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">Description *</Label>
          <Textarea
            className="bg-white min-h-[120px]"
            value={data.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder={getPlaceholderDescription()}
            required
          />
          <p className="text-xs text-gray-500">
            Minimum 20 characters. Provide detailed information to attract the
            right responses.
          </p>
        </div>

        {/* Validation Messages */}
        {data.title && data.title.length < 5 && (
          <p className="text-red-500 text-sm">
            Title must be at least 5 characters long
          </p>
        )}
        {data.description && data.description.length < 20 && (
          <p className="text-red-500 text-sm">
            Description must be at least 20 characters long
          </p>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onPrev} className="px-8 py-2">
          Back
        </Button>
        <Button onClick={handleNext} disabled={!isValid} className="px-8 py-2">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default BasicDetailsStep;
