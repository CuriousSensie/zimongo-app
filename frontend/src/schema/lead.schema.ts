import { z } from "zod";
import { 
  LeadType, 
  ServiceType, 
  ServiceFrequency, 
  DimensionUnit, 
  WeightUnit, 
  UnitOfMeasurement, 
  LeadIntent
} from "@/types/lead";

// Common validation schemas
const title = z
  .string({ error: "Title is required" })
  .min(5, "Title must be at least 5 characters long")
  .max(200, "Title must be at most 200 characters long");

const description = z
  .string({ error: "Description is required" })
  .min(20, "Description must be at least 20 characters long")
  .max(2000, "Description must be at most 2000 characters long");

const budget = z
  .number()
  .positive("Budget must be a positive number")
  .optional();

const location = z.object({
  country: z.string({ error: "Country is required" }),
  state: z.string({ error: "State is required" }),
  city: z.string({ error: "City is required" }),
  address: z.string().optional(),
  zipCode: z.string().optional(),
});

// Product Information Schema
const productInfoSchema = z.object({
  productName: z
    .string({ error: "Product name is required" })
    .min(2, "Product name must be at least 2 characters long"),
  productCategory: z
    .string({ error: "Product category is required" }),
  productDescription: z
    .string({ error: "Product description is required" })
    .min(10, "Product description must be at least 10 characters long"),
  specifications: z.string().optional(),
  dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    unit: z.enum(DimensionUnit).default(DimensionUnit.CM),
  }).optional(),
  weight: z.object({
    value: z.number().positive(),
    unit: z.enum(WeightUnit).default(WeightUnit.KG),
  }).optional(),
  volumeCapacity: z.string().optional(),
  material: z.string().optional(),
  colors: z.array(z.string()).optional(),
  packagingType: z.string().optional(),
  unitsPerPackage: z.number().positive().optional(),
  minimumOrderQuantity: z
    .number({ error: "Minimum order quantity is required" })
    .positive("Minimum order quantity must be positive"),
  brandOrModel: z.string().optional(),
  unitOfMeasurement: z
    .enum(UnitOfMeasurement)
    .default(UnitOfMeasurement.PIECES),
  budgetPerUnit: z.number().positive().optional(),
  expectedDeliveryDate: z.string().optional(),
  deliveryLocation: z
    .string({ error: "Delivery location is required" }),
  isOneTimePurchase: z.boolean().default(true),
  recurringFrequency: z.nativeEnum(ServiceFrequency).optional(),
  additionalNotes: z.string().optional(),
});

// Service Information Schema
const serviceInfoSchema = z.object({
  serviceName: z
    .string({ error: "Service name is required" })
    .min(2, "Service name must be at least 2 characters long"),
  serviceCategory: z
    .string({ error: "Service category is required" }),
  serviceDescription: z
    .string({ error: "Service description is required" })
    .min(10, "Service description must be at least 10 characters long"),
  scopeOfWork: z
    .string({ error: "Scope of work is required" })
    .min(10, "Scope of work must be at least 10 characters long"),
  typeOfService: z
    .enum(ServiceType, { error: "Type of service is required" }),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  serviceFrequency: z.enum(ServiceFrequency).optional(),
  locationOfService: z
    .string({ error: "Location of service is required" }),
  isRemote: z.boolean().default(false),
  requiredToolsOrResources: z.string().optional(),
  skillsOrExpertiseNeeded: z.string().optional(),
  budgetEstimate: z.number().positive().optional(),
  regulatoryOrComplianceNeeds: z.string().optional(),
  additionalNotes: z.string().optional(),
});

// Main Lead Schema
export const leadSchema = z.object({
  leadIntent: z.enum(LeadIntent, { error: "Lead intent is required" }),
  leadType: z.enum(LeadType, { error: "Lead type is required" }),
  title,
  description,
  budget,
  currency: z.string().default("USD"),
  location,
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  expiryDate: z.string().optional(),
  isPublic: z.boolean().default(true),
}).and(
  z.discriminatedUnion("leadType", [
    z.object({
      leadType: z.literal(LeadType.PRODUCT),
      productInfo: productInfoSchema,
    }),
    z.object({
      leadType: z.literal(LeadType.SERVICE),
      serviceInfo: serviceInfoSchema,
    }),
  ])
);

// Schema for product leads only
export const productLeadSchema = z.object({
  leadType: z.literal(LeadType.PRODUCT),
  title,
  description,
  productInfo: productInfoSchema,
  budget,
  currency: z.string().default("USD"),
  location,
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  expiryDate: z.string().optional(),
  isPublic: z.boolean().default(true),
});

// Schema for service leads only
export const serviceLeadSchema = z.object({
  leadType: z.literal(LeadType.SERVICE),
  title,
  description,
  serviceInfo: serviceInfoSchema,
  budget,
  currency: z.string().default("USD"),
  location,
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  expiryDate: z.string().optional(),
  isPublic: z.boolean().default(true),
});

export type LeadFormData = z.infer<typeof leadSchema>;
export type ProductLeadFormData = z.infer<typeof productLeadSchema>;
export type ServiceLeadFormData = z.infer<typeof serviceLeadSchema>;