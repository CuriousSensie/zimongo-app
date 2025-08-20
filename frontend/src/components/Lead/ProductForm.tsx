"use client";
import React, { useState, useRef } from "react";
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
import { Button } from "@/components/ui/button";
import {
  ProductInfo,
  DimensionUnit,
  WeightUnit,
  UnitOfMeasurement,
  ServiceFrequency,
  LeadFile,
} from "@/types/lead";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cleanupSingleFile } from "@/utils/fileCleanup";
import Api from "@/lib/api";
import { NEXT_PUBLIC_S3_BASE_URL } from "@/constant/env";

interface ProductFormProps {
  productInfo?: Partial<ProductInfo>;
  onChange: (field: string, value: any) => void;
  onFilesChange?: (files: LeadFile[]) => void; // Callback to track uploaded files for cleanup
  onCleanupRequest?: () => Promise<void>; // Callback to request cleanup from parent
}

const ProductForm: React.FC<ProductFormProps> = ({
  productInfo = {},
  onChange,
  onFilesChange,
}) => {
  const [uploadedImages, setUploadedImages] = useState<LeadFile[]>(
    productInfo.productFiles || []
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync uploaded images with productInfo when it changes
  React.useEffect(() => {
    if (productInfo.productFiles) {
      setUploadedImages(productInfo.productFiles);
    }
  }, [productInfo.productFiles]);

  // Notify parent component of file changes for cleanup tracking
  React.useEffect(() => {
    if (onFilesChange) {
      onFilesChange(uploadedImages);
    }
  }, [uploadedImages, onFilesChange]);

  const handleChange = (field: string, value: any) => {
    onChange(field, value);
  };

  const handleDimensionChange = (dimension: string, value: any) => {
    const currentDimensions = productInfo.dimensions || {
      unit: DimensionUnit.CM,
    };
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
    const colors = value
      .split(",")
      .map((color) => color.trim())
      .filter(Boolean);
    onChange("colors", colors);
  };

  const handleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    // Validate file types and sizes
    const validFiles: File[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!allowedTypes.includes(file.type)) {
        toast.error(
          `${file.name} is not a valid image format. Please use JPEG, PNG, GIF, or WebP.`,
          {
            position: "top-center",
            richColors: true,
            action: {
              label: "Close",
              onClick: () => window.location.reload(),
            },
          }
        );
        continue;
      }

      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Check total number of images (max 5)
    if (uploadedImages.length + validFiles.length > 5) {
      toast.error("You can upload a maximum of 5 images per product.", {
        position: "top-center",
        richColors: true,
        action: {
          label: "Close",
          onClick: () => window.location.reload(),
        },
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      validFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await Api.uploadFiles(formData);

      if (!response.status || response.status !== 200) {
        throw new Error("Failed to upload images");
      }

      // Process uploaded files
      if (response.data.success && response.data.data?.files) {
        const newImages: LeadFile[] = response.data.data.files.map(
          (file: any) => ({
            type: file.type,
            path: file.path,
            originalName: file.originalName,
            size: file.size,
          })
        );

        const updatedImages = [...uploadedImages, ...newImages];
        setUploadedImages(updatedImages);
        onChange("productFiles", updatedImages);

        toast.success(`${newImages.length} image(s) uploaded successfully!`, {
          position: "top-center",
          richColors: true,
          action: {
            label: "Close",
            onClick: () => window.location.reload(),
          },
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images. Please try again.", {
        position: "top-center",
        richColors: true,
        action: {
          label: "Close",
          onClick: () => window.location.reload(),
        },
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = uploadedImages[index];

    try {
      // Delete from S3 using cleanup utility
      const success = await cleanupSingleFile(imageToRemove.path);

      if (!success) {
        throw new Error("Failed to delete image from server");
      }

      // Remove from local state
      const updatedImages = uploadedImages.filter((_, i) => i !== index);
      setUploadedImages(updatedImages);
      onChange("productFiles", updatedImages);
      toast.success("Image removed successfully", {
        position: "top-center",
        richColors: true,
        action: {
          label: "Close",
          onClick: () => window.location.reload(),
        },
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image. Please try again.", {
        position: "top-center",
        richColors: true,
        action: {
          label: "Close",
          onClick: () => window.location.reload(),
        },
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
              <SelectItem value="construction">
                Construction Materials
              </SelectItem>
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
            onChange={(e) =>
              handleDimensionChange(
                "length",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            placeholder="Length"
          />
          <Input
            type="number"
            className="bg-white"
            value={productInfo.dimensions?.width || ""}
            onChange={(e) =>
              handleDimensionChange(
                "width",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            placeholder="Width"
          />
          <Input
            type="number"
            className="bg-white"
            value={productInfo.dimensions?.height || ""}
            onChange={(e) =>
              handleDimensionChange(
                "height",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
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
            onChange={(e) =>
              handleWeightChange(
                "value",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
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
            onChange={(e) =>
              handleChange(
                "unitsPerPackage",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            placeholder="Number of items per package"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-slate-700">Minimum Order Quantity *</Label>
          <Input
            type="number"
            className="bg-white"
            value={productInfo.minimumOrderQuantity || ""}
            onChange={(e) =>
              handleChange(
                "minimumOrderQuantity",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
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
              <SelectItem value={UnitOfMeasurement.KILOGRAMS}>
                Kilograms
              </SelectItem>
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
            onChange={(e) =>
              handleChange(
                "budgetPerUnit",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            placeholder="Estimated cost per item"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-slate-700">Expected Delivery Date</Label>
          <Input
            type="date"
            className="bg-white"
            value={productInfo.expectedDeliveryDate || ""}
            onChange={(e) =>
              handleChange("expectedDeliveryDate", e.target.value)
            }
            min={new Date().toISOString().split("T")[0]}
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
              onValueChange={(value) =>
                handleChange("recurringFrequency", value)
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ServiceFrequency.DAILY}>Daily</SelectItem>
                <SelectItem value={ServiceFrequency.WEEKLY}>Weekly</SelectItem>
                <SelectItem value={ServiceFrequency.MONTHLY}>
                  Monthly
                </SelectItem>
                <SelectItem value={ServiceFrequency.QUARTERLY}>
                  Quarterly
                </SelectItem>
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

      {/* Product Images */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-slate-700">Product Images</Label>
          <span className="text-sm text-gray-500">
            {uploadedImages.length}/5 images uploaded
          </span>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
          className="hidden"
        />

        {/* Upload button */}
        <div className="flex flex-col gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={triggerFileInput}
            disabled={isUploading || uploadedImages.length >= 5}
            className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center gap-2">
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-gray-600">
                    {uploadedImages.length >= 5
                      ? "Maximum 5 images reached"
                      : "Click to upload product images"}
                  </span>
                  <span className="text-xs text-gray-500">
                    JPEG, PNG, GIF, WebP (max 10MB each)
                  </span>
                </>
              )}
            </div>
          </Button>

          {/* Image preview grid */}
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                    <img
                      src={`${NEXT_PUBLIC_S3_BASE_URL}/${image.path}`}
                      alt={image.originalName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/avatar.png"; // fallback image
                      }}
                    />
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* Image info */}
                  <div className="mt-1 text-xs text-gray-500 truncate">
                    {image.originalName}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500">
          Add high-quality images of your product to attract more buyers. You
          can upload up to 5 images.
        </p>
      </div>
    </div>
  );
};

export default ProductForm;
