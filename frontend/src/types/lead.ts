// Enums for better type safety
export enum LeadIntent {
  BUY = "buy",
  SELL = "sell"
}

export enum LeadType {
  PRODUCT = "product",
  SERVICE = "service"
}

export enum ServiceType {
  ONE_TIME = "one-time",
  RECURRING = "recurring",
  CONTRACT_BASED = "contract-based",
  ON_DEMAND = "on-demand"
}

export enum ServiceFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  YEARLY = "yearly"
}

export enum DimensionUnit {
  MM = "mm",
  CM = "cm",
  METERS = "meters",
  INCHES = "inches"
}

export enum WeightUnit {
  KG = "kg",
  LBS = "lbs",
  GRAMS = "grams",
  TONS = "tons"
}

export enum UnitOfMeasurement {
  PIECES = "pieces",
  SETS = "sets",
  METERS = "meters",
  LITERS = "liters",
  KILOGRAMS = "kilograms"
}

// Interface for file uploads
export interface LeadFile {
  type: string;
  path: string;
  originalName: string;
  size: number;
}

// Interface for Product Information
export interface ProductInfo {
  productName: string;
  productCategory: string;
  productDescription: string;
  specifications?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit: DimensionUnit;
  };
  weight?: {
    value: number;
    unit: WeightUnit;
  };
  volumeCapacity?: string;
  material?: string;
  colors?: string[];
  packagingType?: string;
  unitsPerPackage?: number;
  minimumOrderQuantity: number;
  brandOrModel?: string;
  unitOfMeasurement: UnitOfMeasurement;
  budgetPerUnit?: number;
  expectedDeliveryDate?: string;
  deliveryLocation: string;
  isOneTimePurchase: boolean;
  recurringFrequency?: ServiceFrequency;
  additionalNotes?: string;
  productFiles?: LeadFile[];
}

// Interface for Service Information
export interface ServiceInfo {
  serviceName: string;
  serviceCategory: string;
  serviceDescription: string;
  scopeOfWork: string;
  typeOfService: ServiceType;
  startDate?: string;
  endDate?: string;
  serviceFrequency?: ServiceFrequency;
  locationOfService: string;
  isRemote: boolean;
  requiredToolsOrResources?: string;
  skillsOrExpertiseNeeded?: string;
  budgetEstimate?: number;
  regulatoryOrComplianceNeeds?: string;
  additionalNotes?: string;
  serviceDocuments?: LeadFile[];
}

// Main Lead interface
export interface ILead {
  _id?: string;
  userId: string;
  profileId?: string;
  LeadIntent: LeadIntent;
  leadType: LeadType;
  title: string;
  description: string;
  
  // Product or Service specific information
  productInfo?: ProductInfo;
  serviceInfo?: ServiceInfo;
  
  // Common fields
  budget?: number;
  currency: string;
  location: {
    country: string;
    state: string;
    city: string;
    address?: string;
    zipCode?: string;
  };
  
  // Lead status and metadata
  status: string; // draft, active, closed, expired
  priority: string; // low, medium, high, urgent
  expiryDate?: string;
  
  // Engagement tracking
  views: number;
  responses: number;
  isPublic: boolean;
  isFeatured: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Form data interface for creating leads
export interface CreateLeadFormData {
  leadIntent: LeadIntent,
  leadType: LeadType;
  title: string;
  description: string;
  productInfo?: Partial<ProductInfo>;
  serviceInfo?: Partial<ServiceInfo>;
  budget?: number;
  currency?: string;
  location: {
    country: string;
    state: string;
    city: string;
    address?: string;
    zipCode?: string;
  };
  priority?: string;
  expiryDate?: string;
  isPublic?: boolean;
}