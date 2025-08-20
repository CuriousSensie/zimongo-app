"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { LeadIntent } from "@/types/lead";

interface BuySellStepProps {
  leadIntent: LeadIntent;
  onUpdate: (data: { leadIntent: LeadIntent }) => void;
  onNext: () => void;
}

const BuySellStep: React.FC<BuySellStepProps> = ({ leadIntent, onUpdate, onNext }) => {
  const handleSelection = (selectedIntent: LeadIntent) => {
    onUpdate({ leadIntent: selectedIntent });
  };

  const handleNext = () => {
    if (leadIntent) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold mb-2">What do you want to do?</h3>
        <p className="text-gray-600">
          Choose whether you're looking to buy something or sell something
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Buy Option */}
        <div
          className={`p-8 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
            leadIntent === LeadIntent.BUY
              ? "border-blue-500 bg-blue-50 shadow-md"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => handleSelection(LeadIntent.BUY)}
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🛒</span>
            </div>
            <h4 className="text-lg font-semibold mb-2">I want to BUY</h4>
            <p className="text-gray-600 text-sm">
              I'm looking for products or services to purchase
            </p>
            <div className="mt-4 text-xs text-gray-500">
              • Find suppliers and vendors
              <br />
              • Get quotes and proposals
              <br />
              • Compare options
            </div>
          </div>
        </div>

        {/* Sell Option */}
        <div
          className={`p-8 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
            leadIntent === LeadIntent.SELL
              ? "border-blue-500 bg-blue-50 shadow-md"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => handleSelection(LeadIntent.SELL)}
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💼</span>
            </div>
            <h4 className="text-lg font-semibold mb-2">I want to SELL</h4>
            <p className="text-gray-600 text-sm">
              I have products or services to offer
            </p>
            <div className="mt-4 text-xs text-gray-500">
              • Showcase your offerings
              <br />
              • Reach potential buyers
              <br />
              • Generate leads
            </div>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-center mt-8">
        <Button
          onClick={handleNext}
          disabled={!leadIntent}
          className="px-8 py-2"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default BuySellStep;