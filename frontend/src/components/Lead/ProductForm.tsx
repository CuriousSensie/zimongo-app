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
import { ProductInfo, DimensionUnit, WeightUnit, UnitOfMeasurement, ServiceFrequency } from "@/types/lead";

interface ProductFormProps {
  productInfo?: Partial<ProductInfo>;
  onChange: (field: string, value: any) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ productInfo = {}, onChange }) => {
  const handleChange = (field: string, value: any) => {
    onChange(field, value);
  };

  const handleDimensionChange = (dimension: string, value: any) => {
    const currentDimensions = productInfo.dimensions || { unit: DimensionUnit.CM };
    onChange("dimensions", {
      ...currentDimensions,
      [dimension]: value,
    });
  };

  const handleWeightChange = (field: string, value: any) => {
    const currentWeight = productInfo.weight || { unit: WeightUnit.KG };
    onChange("weight", {
      ...currentWeight,
      [field]: value,
    });
  };

  const handleColorsChange = (value: string) => {
    const colors = value.split(",").map(color => color.trim()).filter(Boolean);
    onChange("colors", colors);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Product Information</h2>
      
      {/* Basic Product Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-slate-700">Product Name *</Label>
          <Input
            className="bg-white"
            value={productInfo.productName || ""}
            onChange={(e) => handleChange("productName", e.target.value)}
            placeholder="Enter product name"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-slate-700">Product Category *</Label>
          <Select
            value={productInfo.productCategory || ""}
            onValueChange={(value) => handleChange("productCategory", value)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="construction">Construction Materials</SelectItem>
              <SelectItem value="automotive">Automotive</SelectItem>
              <SelectItem value="textiles">Textiles</SelectItem>
              <SelectItem value="machinery">Machinery</SelectItem>
              <SelectItem value="chemicals">Chemicals</SelectItem>
              <SelectItem value="food">Food & Beverages</SelectItem>
              <SelectItem value="medical">Medical Equipment</SelectItem>
              <SelectItem value="furniture">Furniture</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-slate-700">Product Description *</Label>
        <Textarea
          className="bg-white min-h-[80px]"
          value={productInfo.productDescription || ""}
          onChange={(e) => handleChange("productDescription", e.target.value)}
          placeholder="Describe what the product is and what it should do"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-slate-700">Specifications</Label>
        <Textarea
          className="bg-white min-h-[60px]"
          value={productInfo.specifications || ""}
          onChange={(e) => handleChange("specifications", e.target.value)}
          placeholder="Include technical details like material, finish, or power rating"
        />
      </div>

      {/* Dimensions */}
      <div className="space-y-2">
        <Label className="text-slate-700">Dimensions (L × W × H)</Label>
        <div className="grid grid-cols-4 gap-2">
          <Input
            type="number"
            className="bg-white"
            value={productInfo.dimensions?.length || ""}
            onChange={(e) => handleDimensionChange("length", e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Length"
          />
          <Input
            type="number"
            className="bg-white"
            value={productInfo.dimensions?.width || ""}
            onChange={(e) => handleDimensionChange("width", e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Width"
          />
          <Input
            type="number"
            className="bg-white"
            value={productInfo.dimensions?.height || ""}
            onChange={(e) => handleDimensionChange("height", e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Height"
          />
          <Select
            value={productInfo.dimensions?.unit || DimensionUnit.CM}
            onValueChange={(value) => handleDimensionChange("unit", value)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DimensionUnit.MM}>mm</SelectItem>
              <SelectItem value={DimensionUnit.CM}>cm</SelectItem>
              <SelectItem value={DimensionUnit.METERS}>meters</SelectItem>
              <SelectItem value={DimensionUnit.INCHES}>inches</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Weight */}
      <div className="space-y-2">
        <Label className="text-slate-700">Weight</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            className="bg-white"
            value={productInfo.weight?.value || ""}
            onChange={(e) => handleWeightChange("value", e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Weight value"
          />
          <Select
            value={productInfo.weight?.unit || WeightUnit.KG}
            onValueChange={(value) => handleWeightChange("unit", value)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={WeightUnit.KG}>kg</SelectItem>
              <SelectItem value={WeightUnit.LBS}>lbs</SelectItem>
              <SelectItem value={WeightUnit.GRAMS}>grams</SelectItem>
              <SelectItem value={WeightUnit.TONS}>tons</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Additional Product Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-slate-700">Volume / Capacity</Label>
          <Input
            className="bg-white"
            value={productInfo.volumeCapacity || ""}
            onChange={(e) => handleChange("volumeCapacity", e.target.value)}
            placeholder="e.g., 500ml, 2 liters"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-slate-700">Material</Label>
          <Input
            className="bg-white"
            value={productInfo.material || ""}
            onChange={(e) => handleChange("material", e.target.value)}
            placeholder="e.g., steel, plastic, wood"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-slate-700">Colors</Label>
          <Input
            className="bg-white"
            value={productInfo.colors?.join(", ") || ""}
            onChange={(e) => handleColorsChange(e.target.value)}
            placeholder="e.g., Red, Blue, Green (comma separated)"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-slate-700">Packaging Type</Label>
          <Input
            className="bg-white"
            value={productInfo.packagingType || ""}
            onChange={(e) => handleChange("packagingType", e.target.value)}
            placeholder="e.g., box, bag, drum"
          />
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-slate-700">Units per Package</Label>
          <Input
            type="number"
            className="bg-white"
            value={productInfo.unitsPerPackage || ""}
            onChange={(e) => handleChange("unitsPerPackage", e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Number of items per package"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-slate-700">Minimum Order Quantity *</Label>
          <Input
            type="number"
            className="bg-white"
            value={productInfo.minimumOrderQuantity || ""}
            onChange={(e) => handleChange("minimumOrderQuantity", e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Minimum quantity to order"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-slate-700">Brand or Model</Label>
          <Input
            className="bg-white"
            value={productInfo.brandOrModel || ""}
            onChange={(e) => handleChange("brandOrModel", e.target.value)}
            placeholder="Brand, model, or SKU"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-slate-700">Unit of Measurement *</Label>
          <Select
            value={productInfo.unitOfMeasurement || UnitOfMeasurement.PIECES}
            onValueChange={(value) => handleChange("unitOfMeasurement", value)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UnitOfMeasurement.PIECES}>Pieces</SelectItem>
              <SelectItem value={UnitOfMeasurement.SETS}>Sets</SelectItem>
              <SelectItem value={UnitOfMeasurement.METERS}>Meters</SelectItem>
              <SelectItem value={UnitOfMeasurement.LITERS}>Liters</SelectItem>
              <SelectItem value={UnitOfMeasurement.KILOGRAMS}>Kilograms</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Budget and Delivery */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-slate-700">Budget per Unit</Label>
          <Input
            type="number"
            className="bg-white"
            value={productInfo.budgetPerUnit || ""}
            onChange={(e) => handleChange("budgetPerUnit", e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Estimated cost per item"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-slate-700">Expected Delivery Date</Label>
          <Input
            type="date"
            className="bg-white"
            value={productInfo.expectedDeliveryDate || ""}
            onChange={(e) => handleChange("expectedDeliveryDate", e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-slate-700">Delivery Location *</Label>
        <Input
          className="bg-white"
          value={productInfo.deliveryLocation || ""}
          onChange={(e) => handleChange("deliveryLocation", e.target.value)}
          placeholder="Where should it be delivered?"
          required
        />
      </div>

      {/* Purchase Type */}
      <div className="space-y-2">
        <Label className="text-slate-700">Purchase Type</Label>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="oneTime"
              name="purchaseType"
              checked={productInfo.isOneTimePurchase !== false}
              onChange={() => handleChange("isOneTimePurchase", true)}
            />
            <Label htmlFor="oneTime">One-time purchase</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="recurring"
              name="purchaseType"
              checked={productInfo.isOneTimePurchase === false}
              onChange={() => handleChange("isOneTimePurchase", false)}
            />
            <Label htmlFor="recurring">Recurring purchase</Label>
          </div>
        </div>
        
        {productInfo.isOneTimePurchase === false && (
          <div className="mt-2">
            <Label className="text-slate-700">Frequency</Label>
            <Select
              value={productInfo.recurringFrequency || ""}
              onValueChange={(value) => handleChange("recurringFrequency", value)}
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

      <div className="flex flex-col gap-2">
        <Label className="text-slate-700">Additional Notes</Label>
        <Textarea
          className="bg-white min-h-[60px]"
          value={productInfo.additionalNotes || ""}
          onChange={(e) => handleChange("additionalNotes", e.target.value)}
          placeholder="Any other important information about the product"
        />
      </div>
    </div>
  );
};

export default ProductForm;