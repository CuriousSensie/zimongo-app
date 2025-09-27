"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadType } from "@/types/lead";
import { X, RotateCcw, Clock, DollarSign, Eye, ThumbsUp } from "lucide-react";
import { 
  productCategories, 
  serviceCategories, 
  sortingOptions,
  sortOrderOptions,
  budgetRanges,
  locationFilters 
} from "@/constant/lead";

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
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "clock": return <Clock className="h-4 w-4" />;
      case "dollar-sign": return <DollarSign className="h-4 w-4" />;
      case "eye": return <Eye className="h-4 w-4" />;
      case "thumbs-up": return <ThumbsUp className="h-4 w-4" />;
      default: return null;
    }
  };

  const currentCategories = leadType === LeadType.PRODUCT ? productCategories : serviceCategories;

  const handleBudgetRange = (min: string, max: string) => {
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
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {currentCategories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
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
                onClick={() => handleBudgetRange(range.min, range.max)}
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
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                
              </SelectContent>
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
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                {sortingOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {getIconComponent(option.icon)}
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.sortOrder}
              onValueChange={(value) => onFilterChange("sortOrder", value)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Order..." />
              </SelectTrigger>
              <SelectContent>
                {sortOrderOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
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