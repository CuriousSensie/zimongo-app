"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { LeadType } from "@/types/lead";
import ProductForm from "../ProductForm";
import ServiceForm from "../ServiceForm";

interface ProductServiceStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const ProductServiceStep: React.FC<ProductServiceStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrev,
}) => {
  const handleProductInfoChange = (field: string, value: any) => {
    onUpdate({
      productInfo: {
        ...data.productInfo,
        [field]: value,
      },
    });
  };

  const handleServiceInfoChange = (field: string, value: any) => {
    onUpdate({
      serviceInfo: {
        ...data.serviceInfo,
        [field]: value,
      },
    });
  };

  const validateStep = () => {
    if (data.leadType === LeadType.PRODUCT) {
      const productInfo = data.productInfo || {};
      return (
        productInfo.productName &&
        productInfo.productCategory &&
        productInfo.productDescription &&
        productInfo.minimumOrderQuantity &&
        productInfo.deliveryLocation &&
        productInfo.unitOfMeasurement
      );
    } else {
      const serviceInfo = data.serviceInfo || {};
      return (
        serviceInfo.serviceName &&
        serviceInfo.serviceCategory &&
        serviceInfo.serviceDescription &&
        serviceInfo.scopeOfWork &&
        serviceInfo.typeOfService &&
        serviceInfo.locationOfService
      );
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold mb-2">
          {data.leadType === LeadType.PRODUCT ? "Product" : "Service"} Details
        </h3>
        <p className="text-gray-600">
          Provide detailed information about the{" "}
          {data.leadType === LeadType.PRODUCT ? "product" : "service"} you're{" "}
          {data.intent === "buy" ? "looking for" : "offering"}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {data.leadType === LeadType.PRODUCT ? (
          <ProductForm
            productInfo={data.productInfo}
            onChange={handleProductInfoChange}
          />
        ) : (
          <ServiceForm
            serviceInfo={data.serviceInfo}
            onChange={handleServiceInfoChange}
          />
        )}
      </div>

      {/* Validation Messages */}
      {!validateStep() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-4xl mx-auto">
          <p className="text-yellow-800 text-sm">
            Please fill in all required fields marked with * to continue.
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onPrev} className="px-8 py-2">
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!validateStep()}
          className="px-8 py-2"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ProductServiceStep;
