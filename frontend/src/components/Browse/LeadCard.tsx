"use client";

import React from "react";
import { ILead, LeadIntent, LeadType } from "@/types/lead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Eye,
  Building2,
  Package,
  Wrench,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { NEXT_PUBLIC_S3_BASE_URL } from "@/constant/env";
import Image from "next/image";
import ZoomableImage from "../common/ZoomableImage";
import { FaMoneyBill } from "react-icons/fa6";

interface LeadCardProps {
  lead: ILead;
  viewMode: "grid" | "list";
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, viewMode }) => {
  // TODO: increment view count when component mount

  const formatBudget = (budget?: number, currency = "USD") => {
    if (!budget) return "Not specified";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budget);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:text-yellow-900";
      case "closed":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900";
      case "expired":
        return "bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900";
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900";
      case "high":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200 hover:text-orange-900";
      case "medium":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900";
      case "low":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900";
    }
  };

  const getLeadTypeInfo = () => {
    if (lead.leadType === LeadType.PRODUCT && lead.productInfo) {
      return {
        icon: <Package className="h-4 w-4" />,
        category: lead.productInfo.productCategory,
        name: lead.productInfo.productName,
        details: `Min. Order: ${lead.productInfo.minimumOrderQuantity} ${lead.productInfo.unitOfMeasurement}`,
      };
    } else if (lead.leadType === LeadType.SERVICE && lead.serviceInfo) {
      return {
        icon: <Wrench className="h-4 w-4" />,
        category: lead.serviceInfo.serviceCategory,
        name: lead.serviceInfo.serviceName,
        details: `Type: ${lead.serviceInfo.typeOfService}`,
      };
    }
    return {
      icon: <Package className="h-4 w-4" />,
      category: "General",
      name: lead.title,
      details: "",
    };
  };

  const typeInfo = getLeadTypeInfo();

  // Service cards are shown in list view
  if (lead.leadType === LeadType.SERVICE) {
    return (
      <div className="flex flex-col md:flex-row mx-auto w-full gap-4 justify-between items-center bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors p-6">
        <div className="flex flex-col items-start justify-between">
          <div className="flex items-center gap-3 mb-3">
            {lead.profileId && (
              <div className="flex items-center gap-2 text-xs text-purple-500 bg-purple-200 rounded-full px-2 py-1">
                <Building2 className="h-3 w-3" />
                <span>
                  by {(lead.profileId as any)?.companyName || "Company"}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              {typeInfo.icon}
              <Badge variant="outline" className="text-xs">
                {typeInfo.category}
              </Badge>
            </div>

            <div className="flex gap-1 items-center text-sm font-thin">
              Urgency:
              <Badge className={`text-xs ${getPriorityColor(lead.priority)}`}>
                {lead.priority}
              </Badge>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 max-w-[70vw]">
            {lead.title}
          </h3>

          <p className="text-gray-600 mb-3 line-clamp-2 max-w-[80vw] md:max-w-[60vw] ">
            {lead.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>
                {lead.location.city}, {lead.location.state}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <FaMoneyBill className="h-4 w-4" />
              <span>{formatBudget(lead.budget, lead.currency)}</span>
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDistanceToNow(new Date(lead.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{lead.views} views</span>
            </div>
          </div>
        </div>

        <div className=" flex md:flex-col gap-2 w-full md:w-[15vw] mt-4 md:mt-0">
          <Link href={`/browse/${lead._id}`} className="flex-1">
            <Button className="w-full" size="sm">
              View Details
            </Button>
          </Link>
          {lead.profileId && (lead.profileId as any)?.slug ? (
            <Link href={`/profiles/${(lead.profileId as any).slug}`}>
              <Button variant="outline" size="sm">
                Contact
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Contact
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Product cards
  return (
    <div className="flex flex-col justify-between bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
      {/* Product Image */}
      {lead.leadType === LeadType.PRODUCT && (
        <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
          {lead.productInfo?.productFiles &&
          lead.productInfo.productFiles.length > 0 ? (
            <ZoomableImage
              src={`${NEXT_PUBLIC_S3_BASE_URL}/${lead.productInfo.productFiles[0].path}`}
              alt={lead.productInfo.productFiles[0].originalName}
              className="w-full h-full object-cover"
            />
          ) : (
            // <Image
            //   src={`${NEXT_PUBLIC_S3_BASE_URL}/${lead.productInfo.productFiles[0].path}`}
            //   alt={lead.productInfo.productFiles[0].originalName}
            //   className="w-full h-full object-cover"
            //   fill
            //   objectFit="cover"
            // />
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          )}
          {/* Lead Intent Badge */}
          <div className="absolute top-3 left-3">
            {lead.profileId && (
              <div className="flex items-center gap-2 text-xs text-purple-500 bg-purple-200 rounded-full px-2 py-1">
                <Building2 className="h-3 w-3" />
                <span>
                  by {(lead.profileId as any)?.companyName || "Company"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* title and desc */}
      <div className="p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
          {typeInfo.name}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2">{lead.description}</p>
      </div>

      <div className="p-6 border-t border-gray-100 ">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {typeInfo.icon}
            <Badge variant="outline" className="text-xs">
              {typeInfo.category}
            </Badge>
          </div>
          <div className="flex gap-2 text-sm">
            Urgency:
            <Badge className={`text-xs ${getPriorityColor(lead.priority)}`}>
              {lead.priority}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>
              {lead.location.city}, {lead.location.state}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FaMoneyBill className="h-4 w-4" />
            <span>{formatBudget(lead.budget, lead.currency)}</span>
          </div>

          {typeInfo.details && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Package className="h-4 w-4" />
              <span>{typeInfo.details}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(lead.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{lead.views}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Link href={`/browse/${lead._id}`} className="flex-1">
            <Button size="sm" className="w-full">
              View Details
            </Button>
          </Link>
          {lead.profileId && (lead.profileId as any)?.slug ? (
            <Link href={`/profiles/${(lead.profileId as any).slug}`}>
              <Button variant="outline" size="sm">
                Contact
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Contact
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadCard;
