"use client";
import React, { useState } from "react";
import { Steps, Button, ButtonGroup, Textarea } from "@chakra-ui/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { onboarding } from "@/constant/onboarding";
import OnboardingSteps from "./OnboardingSteps";
import { toast } from "sonner";

const userOnboardingSteps = [
  {
    title: "Business",
    desc: "Add your business information.",
  },
  {
    title: "Personal",
    desc: "Add your personal information.",
  },
  {
    title: "Contact",
    desc: "Add your contact information.",
  },
  {
    title: "Social",
    desc: "Add your socials here.",
  },
];

const Onboarding = () => {
  const [role, setRole] = useState("");

  return (
    <div className="p-6 md:w-5/6 lg:w-3/4 mx-auto h-[92vh] flex flex-col">
      {role === "" ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center space-y-6 gap-6">
          <div>
            <h1 className="text-2xl font-semibold">
              Welcome to Your Profile Setup
            </h1>
            <p className="text-muted-foreground mt-2">
              Let’s start by selecting your primary business role so we can
              customize your onboarding experience.
            </p>
          </div>

          <div className="w-full max-w-sm">
            <Label htmlFor="business-role" className="mb-2 block">
              Primary Business Role
            </Label>
            <Select
              onValueChange={(role) => {
                setRole(role);
                toast.success("Success", {
                  description: `Business Role Selected: ${role}`,
                  position: "top-center",
                  richColors: true,
                  action: {
                    label: "Close",
                    onClick: () => null,
                  },
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {onboarding.businessRoles.map((role) => (
                  <SelectItem value={role.value} key={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <OnboardingSteps
          role={role}
          setRole={setRole}
          steps={userOnboardingSteps}
        />
      )}
    </div>
  );
};

export default Onboarding;
