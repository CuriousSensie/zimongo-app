"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { LeadType } from "@/types/lead";
import { LeadIntent } from "../LeadWizard";

interface TypeSelectionStepProps {
  leadType: LeadType;
  intent: LeadIntent;
  onUpdate: (data: { leadType: LeadType }) => void;
  onNext: () => void;
  onPrev: () => void;
}

const TypeSelectionStep: React.FC<TypeSelectionStepProps> = ({ 
  leadType, 
  intent, 
  onUpdate, 
  onNext, 
  onPrev 
}) => {
  const handleSelection = (selectedType: LeadType) => {
    onUpdate({ leadType: selectedType });
  };

  const handleNext = () => {
    if (leadType) {
      onNext();
    }
  };

  const getIntentText = () => {
    return intent === "buy" ? "looking for" : "offering";
  };

  const getProductDescription = () => {
    return intent === "buy" 
      ? "I need physical products, materials, or goods"
      : "I have physical products, materials, or goods to sell";
  };

  const getServiceDescription = () => {
    return intent === "buy"
      ? "I need services, expertise, or professional help"
      : "I provide services, expertise, or professional help";
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold mb-2">
          What type of {intent === "buy" ? "purchase" : "offering"} is this?
        </h3>
        <p className="text-gray-600">
          Choose whether you're {getIntentText()} products or services
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Product Option */}
        <div
          className={`p-8 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
            leadType === LeadType.PRODUCT
              ? "border-blue-500 bg-blue-50 shadow-md"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => handleSelection(LeadType.PRODUCT)}
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <h4 className="text-lg font-semibold mb-2">Products</h4>
            <p className="text-gray-600 text-sm mb-4">
              {getProductDescription()}
            </p>
            <div className="text-xs text-gray-500">
              Examples:
              <br />
              • Electronics & Equipment
              <br />
              • Construction Materials
              <br />
              • Machinery & Tools
              <br />
              • Raw Materials
            </div>
          </div>
        </div>

        {/* Service Option */}
        <div
          className={`p-8 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
            leadType === LeadType.SERVICE
              ? "border-blue-500 bg-blue-50 shadow-md"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => handleSelection(LeadType.SERVICE)}
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔧</span>
            </div>
            <h4 className="text-lg font-semibold mb-2">Services</h4>
            <p className="text-gray-600 text-sm mb-4">
              {getServiceDescription()}
            </p>
            <div className="text-xs text-gray-500">
              Examples:
              <br />
              • IT & Technology
              <br />
              • Consulting & Advisory
              <br />
              • Maintenance & Repair
              <br />
              • Professional Services
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={onPrev}
          className="px-8 py-2"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!leadType}
          className="px-8 py-2"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default TypeSelectionStep;