"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { LeadType } from "@/types/lead";
import { X, RotateCcw } from "lucide-react";

interface BrowseFilters {
  search: string;
  leadIntent: string;
  leadType: LeadType;
  category: string;
  minBudget: string;
  maxBudget: string;
  country: string;
  state: string;
  city: string;
  sortBy: string;
  sortOrder: string;
}

interface FilterPanelProps {
  filters: BrowseFilters;
  onFilterChange: (key: keyof BrowseFilters, value: string) => void;
  onClearFilters: () => void;
  leadType: LeadType;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  leadType,
}) => {
  // Product categories
  const productCategories = [
    "Electronics & Technology",
    "Machinery & Equipment",
    "Automotive & Transportation",
    "Construction & Building Materials",
    "Textiles & Apparel",
    "Food & Beverages",
    "Chemicals & Materials",
    "Medical & Healthcare",
    "Agriculture & Farming",
    "Energy & Environment",
    "Sports & Recreation",
    "Home & Garden",
    "Office & Business",
    "Industrial Supplies",
    "Raw Materials",
    "Packaging & Printing",
    "Safety & Security",
    "Tools & Hardware",
    "Furniture & Fixtures",
    "Other Products",
  ];

  // Service categories
  const serviceCategories = [
    "IT & Software Development",
    "Digital Marketing & SEO",
    "Consulting & Business Services",
    "Design & Creative Services",
    "Manufacturing & Production",
    "Logistics & Transportation",
    "Construction & Engineering",
    "Financial & Legal Services",
    "Healthcare & Medical",
    "Education & Training",
    "Maintenance & Repair",
    "Research & Development",
    "Quality Assurance & Testing",
    "Installation & Setup",
    "Customer Support",
    "Data Entry & Processing",
    "Translation & Language",
    "Event Management",
    "Cleaning & Facility Management",
    "Other Services",
  ];

  const categories = leadType === LeadType.PRODUCT ? productCategories : serviceCategories;

  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Germany",
    "France",
    "Australia",
    "India",
    "China",
    "Japan",
    "Brazil",
    "Mexico",
    "South Africa",
    "Nigeria",
    "Egypt",
    "UAE",
    "Singapore",
    "South Korea",
    "Italy",
    "Spain",
    "Netherlands",
  ];

  const budgetRanges = [
    { label: "Under $1,000", min: "0", max: "1000" },
    { label: "$1,000 - $5,000", min: "1000", max: "5000" },
    { label: "$5,000 - $10,000", min: "5000", max: "10000" },
    { label: "$10,000 - $50,000", min: "10000", max: "50000" },
    { label: "$50,000 - $100,000", min: "50000", max: "100000" },
    { label: "$100,000+", min: "100000", max: "" },
  ];

  const handleBudgetRangeSelect = (min: string, max: string) => {
    onFilterChange("minBudget", min);
    onFilterChange("maxBudget", max);
  };

  const hasActiveFilters = [
    filters.category,
    filters.minBudget,
    filters.maxBudget,
    filters.country,
    filters.state,
    filters.city,
  ].some(Boolean);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit sticky top-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Category
          </Label>
          <Select
            value={filters.category}
            onValueChange={(value) => onFilterChange("category", value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>

        {/* Budget Filter */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Budget Range
          </Label>
          <div className="space-y-2 mb-3">
            {budgetRanges.map((range) => (
              <button
                key={range.label}
                onClick={() => handleBudgetRangeSelect(range.min, range.max)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md border transition-colors ${
                  filters.minBudget === range.min && filters.maxBudget === range.max
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-gray-500">Custom Range</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minBudget}
                onChange={(e) => onFilterChange("minBudget", e.target.value)}
                className="text-sm"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxBudget}
                onChange={(e) => onFilterChange("maxBudget", e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Location Filter */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Location
          </Label>
          <div className="space-y-3">
            <Select
              value={filters.country}
              onValueChange={(value) => onFilterChange("country", value)}
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>

            <Input
              type="text"
              placeholder="State/Province"
              value={filters.state}
              onChange={(e) => onFilterChange("state", e.target.value)}
              className="text-sm"
            />

            <Input
              type="text"
              placeholder="City"
              value={filters.city}
              onChange={(e) => onFilterChange("city", e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Sort By
          </Label>
          <div className="space-y-2">
            <Select
              value={filters.sortBy}
              onValueChange={(value) => onFilterChange("sortBy", value)}
            >
              <option value="createdAt">Date Created</option>
              <option value="budget">Budget</option>
              <option value="title">Title</option>
              <option value="views">Views</option>
              <option value="priority">Priority</option>
            </Select>

            <Select
              value={filters.sortOrder}
              onValueChange={(value) => onFilterChange("sortOrder", value)}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </Select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Active Filters
            </Label>
            <div className="space-y-1">
              {filters.category && (
                <div className="flex items-center justify-between text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  <span>Category: {filters.category}</span>
                  <button
                    onClick={() => onFilterChange("category", "")}
                    className="hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {(filters.minBudget || filters.maxBudget) && (
                <div className="flex items-center justify-between text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  <span>
                    Budget: {filters.minBudget || "0"} - {filters.maxBudget || "∞"}
                  </span>
                  <button
                    onClick={() => {
                      onFilterChange("minBudget", "");
                      onFilterChange("maxBudget", "");
                    }}
                    className="hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {filters.country && (
                <div className="flex items-center justify-between text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  <span>Country: {filters.country}</span>
                  <button
                    onClick={() => onFilterChange("country", "")}
                    className="hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {filters.state && (
                <div className="flex items-center justify-between text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  <span>State: {filters.state}</span>
                  <button
                    onClick={() => onFilterChange("state", "")}
                    className="hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {filters.city && (
                <div className="flex items-center justify-between text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  <span>City: {filters.city}</span>
                  <button
                    onClick={() => onFilterChange("city", "")}
                    className="hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;