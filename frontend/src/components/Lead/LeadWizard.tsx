"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Api from "@/lib/api";
import { LeadType, CreateLeadFormData, LeadIntent } from "@/types/lead";
import { leadSchema } from "@/schema/lead.schema";
import BuySellStep from "./steps/BuySellStep";
import TypeSelectionStep from "./steps/TypeSelectionStep";
import BasicDetailsStep from "./steps/BasicDetailsStep";
import ProductServiceStep from "./steps/ProductServiceStep";
import FinalDetailsStep from "./steps/FinalDetailsStep";
import useUser from "@/hooks/useUser";
import { IProfile } from "@/types/profile";

const LeadWizard = () => {
  const { me } = useUser();
  const [profile, setProfile] = useState<IProfile>();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // get profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await Api.getProfileByUserId(me?._id);
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
      }
    };
    fetchProfile();
  }, []);

  const [wizardData, setWizardData] = useState<Partial<CreateLeadFormData>>({
    leadIntent: LeadIntent.BUY,
    leadType: LeadType.PRODUCT,
    title: "",
    description: "",
    currency: "USD",
    location: {
      country: profile?.country || "",
      state: profile?.state || "",
      city: profile?.city || "",
      address: "",
      zipCode: "",
    },
    priority: "medium",
    isPublic: true,
  });

  const totalSteps = 5;

  const stepTitles = [
    "What do you want to do?",
    "What type of lead?",
    "Basic Information",
    wizardData.leadType === LeadType.PRODUCT
      ? "Product Details"
      : "Service Details",
    "Budget & Location",
  ];

  const updateWizardData = (data: Partial<CreateLeadFormData>) => {
    setWizardData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Validate the form data
      const validation = leadSchema.safeParse(wizardData);

      if (!validation.success) {
        const errors = validation.error.issues;
        const errorMessage = errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        toast.error(`Validation failed!`, {
          position: "top-center",
          richColors: true,
          description: errorMessage,
          action: {
            label: "Close",
            onClick: () => window.location.reload(),
          },
        });
        setLoading(false);
        return;
      }

      // Submit the lead
      const res = await Api.createLead(validation.data);

      if (res.status === 201) {
        toast.success("Lead created successfully!", {
          position: "top-center",
          richColors: true,
          action: {
            label: "Close",
            onClick: () => window.location.reload(),
          },
        });
        // Reset wizard or redirect
        window.location.href = "/leads";
      } else {
        toast.error(res.data?.message || "Failed to create lead", {
          position: "top-center",
          richColors: true,
          action: {
            label: "Close",
            onClick: () => window.location.reload(),
          },
        });
      }
    } catch (error: any) {
      console.error("Error creating lead:", error);
      toast.error(error.response?.data?.message || "Failed to create lead", {
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BuySellStep
            leadIntent={wizardData.leadIntent!}
            onUpdate={updateWizardData}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <TypeSelectionStep
            leadType={wizardData.leadType!}
            intent={wizardData.leadIntent!}
            onUpdate={updateWizardData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <BasicDetailsStep
            data={wizardData}
            onUpdate={updateWizardData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <ProductServiceStep
            data={wizardData}
            onUpdate={updateWizardData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 5:
        return (
          <FinalDetailsStep
            data={wizardData}
            onUpdate={updateWizardData}
            onSubmit={handleSubmit}
            onPrev={prevStep}
            loading={loading}
            profile={profile}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Create New Lead</h1>
          <span className="text-sm text-gray-500">
            Step {currentStep} of {totalSteps}
          </span>
        </div>

        {/* Progress Steps */}
        {/* <div className="flex items-center space-x-4 mb-4">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div key={step} className="w-full mx-auto md:w-4/5 lg:w/2/3 flex items-center justify-between overflow-hidden">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? "bg-slate-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {step}
              </div>
              {step < totalSteps && (
                <div
                  className={`w-16 h-1 mx-2 hidden md:flex ${
                    step < currentStep ? "bg-slate-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))} */}
        {/* </div> */}

        {/* Step Title */}
        <h2 className="text-lg font-semibold text-gray-700">
          {stepTitles[currentStep - 1]}
        </h2>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-slate-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {renderStep()}
      </div>
    </div>
  );
};

export default LeadWizard;
