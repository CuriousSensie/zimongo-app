"use client";
import React from "react";
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
import { ServiceInfo, ServiceType, ServiceFrequency } from "@/types/lead";
import { serviceCategories, leadDefaults } from "@/constant/lead";

interface ServiceFormProps {
  serviceInfo?: Partial<ServiceInfo>;
  onChange: (field: string, value: any) => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ serviceInfo = {}, onChange }) => {
  const handleChange = (field: string, value: any) => {
    onChange(field, value);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Service Information</h2>
      
      {/* Basic Service Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-slate-700">Service Name *</Label>
          <Input
            className="bg-white"
            value={serviceInfo.serviceName || ""}
            onChange={(e) => handleChange("serviceName", e.target.value)}
            placeholder="e.g., Electrical Maintenance"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-slate-700">Service Category *</Label>
          <Select
            value={serviceInfo.serviceCategory || ""}
            onValueChange={(value) => handleChange("serviceCategory", value)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {serviceCategories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-slate-700">Service Description *</Label>
        <Textarea
          className="bg-white min-h-[80px]"
          value={serviceInfo.serviceDescription || ""}
          onChange={(e) => handleChange("serviceDescription", e.target.value)}
          placeholder="Describe what the service includes"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-slate-700">Scope of Work *</Label>
        <Textarea
          className="bg-white min-h-[80px]"
          value={serviceInfo.scopeOfWork || ""}
          onChange={(e) => handleChange("scopeOfWork", e.target.value)}
          placeholder="List the specific tasks or deliverables needed"
          required
        />
      </div>

      {/* Service Type and Schedule */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-slate-700">Type of Service *</Label>
          <Select
            value={serviceInfo.typeOfService || ""}
            onValueChange={(value) => handleChange("typeOfService", value)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select service type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ServiceType.ONE_TIME}>One-time</SelectItem>
              <SelectItem value={ServiceType.RECURRING}>Recurring</SelectItem>
              <SelectItem value={ServiceType.CONTRACT_BASED}>Contract-based</SelectItem>
              <SelectItem value={ServiceType.ON_DEMAND}>On-demand</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {serviceInfo.typeOfService === ServiceType.RECURRING && (
          <div className="flex flex-col gap-2">
            <Label className="text-slate-700">Service Frequency *</Label>
            <Select
              value={serviceInfo.serviceFrequency || ""}
              onValueChange={(value) => handleChange("serviceFrequency", value)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ServiceFrequency.DAILY}>Daily</SelectItem>
                <SelectItem value={ServiceFrequency.WEEKLY}>Weekly</SelectItem>
                <SelectItem value={ServiceFrequency.MONTHLY}>Monthly</SelectItem>
                <SelectItem value={ServiceFrequency.QUARTERLY}>Quarterly</SelectItem>
                <SelectItem value={ServiceFrequency.YEARLY}>Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-slate-700">Start Date</Label>
          <Input
            type="date"
            className="bg-white"
            value={serviceInfo.startDate || ""}
            onChange={(e) => handleChange("startDate", e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-slate-700">End Date</Label>
          <Input
            type="date"
            className="bg-white"
            value={serviceInfo.endDate || ""}
            onChange={(e) => handleChange("endDate", e.target.value)}
            min={serviceInfo.startDate || new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* Location and Delivery Method */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-slate-700">Location of Service *</Label>
          <Input
            className="bg-white"
            value={serviceInfo.locationOfService || ""}
            onChange={(e) => handleChange("locationOfService", e.target.value)}
            placeholder="Where the service will be performed"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-slate-700">Service Delivery</Label>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="onsite"
                name="serviceDelivery"
                checked={serviceInfo.isRemote === false || serviceInfo.isRemote === undefined}
                onChange={() => handleChange("isRemote", false)}
              />
              <Label htmlFor="onsite">On-site</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="remote"
                name="serviceDelivery"
                checked={serviceInfo.isRemote === true}
                onChange={() => handleChange("isRemote", true)}
              />
              <Label htmlFor="remote">Remote</Label>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements and Skills */}
      <div className="flex flex-col gap-2">
        <Label className="text-slate-700">Required Tools or Resources</Label>
        <Textarea
          className="bg-white min-h-[60px]"
          value={serviceInfo.requiredToolsOrResources || ""}
          onChange={(e) => handleChange("requiredToolsOrResources", e.target.value)}
          placeholder="Will the provider need to bring tools, software, etc.?"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-slate-700">Skills or Expertise Needed</Label>
        <Textarea
          className="bg-white min-h-[60px]"
          value={serviceInfo.skillsOrExpertiseNeeded || ""}
          onChange={(e) => handleChange("skillsOrExpertiseNeeded", e.target.value)}
          placeholder="Any special qualifications or certifications required"
        />
      </div>

      {/* Budget and Compliance */}
        <div className="flex flex-col gap-2">
          <Label className="text-slate-700">Regulatory or Compliance Needs</Label>
          <Textarea
            className="bg-white"
            value={serviceInfo.regulatoryOrComplianceNeeds || ""}
            onChange={(e) => handleChange("regulatoryOrComplianceNeeds", e.target.value)}
            placeholder="Any licenses or certifications required"
          />
        </div>

      <div className="flex flex-col gap-2">
        <Label className="text-slate-700">Additional Notes</Label>
        <Textarea
          className="bg-white min-h-[60px]"
          value={serviceInfo.additionalNotes || ""}
          onChange={(e) => handleChange("additionalNotes", e.target.value)}
          placeholder="Any other important information about the service"
        />
      </div>
    </div>
  );
};

export default ServiceForm;