import mongoose, { Schema, model, Document, Types } from "mongoose";

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
interface LeadFile {
  type: string;
  path: string;
  originalName: string;
  size: number;
}

interface Interactions {
  type: string;
  interactorId: Types.ObjectId;
  timestamp: Date;
  content: string;
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
  expectedDeliveryDate?: Date;
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
  startDate?: Date;
  endDate?: Date;
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
export interface ILead extends Document {
  userId: Types.ObjectId;
  profileId?: Types.ObjectId;
  leadIntent: LeadIntent;
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
  status: string; // inactive active, flagged, closed, expired
  priority: string; // low, medium, high, urgent
  expiryDate?: Date;
  
  // Engagement tracking
  views: number;
  upvotes: number;
  interactions: Interactions[];
  isPublic: boolean;
  isFeatured: boolean;

  isVerified: boolean;
  otp: number | undefined;
  otpExpiry: Date | undefined;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Instance Methods
  incrementViews(): Promise<ILead>;
  addInteractions(interactionData: Interactions): Promise<ILead>;
  isExpired(): boolean;
}

// Product Info Schema
const ProductInfoSchema = new Schema<ProductInfo>({
  productName: { type: String, required: true },
  productCategory: { type: String, required: true },
  productDescription: { type: String, required: true },
  specifications: { type: String },
  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number },
    unit: { type: String, enum: Object.values(DimensionUnit), default: DimensionUnit.CM }
  },
  weight: {
    value: { type: Number },
    unit: { type: String, enum: Object.values(WeightUnit), default: WeightUnit.KG }
  },
  volumeCapacity: { type: String },
  material: { type: String },
  colors: [{ type: String }],
  packagingType: { type: String },
  unitsPerPackage: { type: Number },
  minimumOrderQuantity: { type: Number, required: true },
  brandOrModel: { type: String },
  unitOfMeasurement: { 
    type: String, 
    enum: Object.values(UnitOfMeasurement), 
    required: true,
    default: UnitOfMeasurement.PIECES 
  },
  budgetPerUnit: { type: Number },
  expectedDeliveryDate: { type: Date },
  deliveryLocation: { type: String, required: true },
  isOneTimePurchase: { type: Boolean, required: true, default: true },
  recurringFrequency: { 
    type: String, 
    enum: Object.values(ServiceFrequency),
    required: function(this: ProductInfo) { return !this.isOneTimePurchase; }
  },
  additionalNotes: { type: String },
  productFiles: [{
    type: { type: String },
    path: { type: String },
    originalName: { type: String },
    size: { type: Number }
  }]
}, { _id: false });

// Service Info Schema
const ServiceInfoSchema = new Schema<ServiceInfo>({
  serviceName: { type: String, required: true },
  serviceCategory: { type: String, required: true },
  serviceDescription: { type: String, required: true },
  scopeOfWork: { type: String, required: true },
  typeOfService: { 
    type: String, 
    enum: Object.values(ServiceType), 
    required: true 
  },
  startDate: { type: Date },
  endDate: { type: Date },
  serviceFrequency: { 
    type: String, 
    enum: Object.values(ServiceFrequency),
    required: function(this: ServiceInfo) { 
      return this.typeOfService === ServiceType.RECURRING; 
    }
  },
  locationOfService: { type: String, required: true },
  isRemote: { type: Boolean, required: true, default: false },
  requiredToolsOrResources: { type: String },
  skillsOrExpertiseNeeded: { type: String },
  budgetEstimate: { type: Number },
  regulatoryOrComplianceNeeds: { type: String },
  additionalNotes: { type: String },
  serviceDocuments: [{
    type: { type: String },
    path: { type: String },
    originalName: { type: String },
    size: { type: Number }
  }]
}, { _id: false });

// Main Lead Schema
const LeadSchema = new Schema<ILead>({
  userId: { 
    type: Schema.Types.ObjectId, 
    required: true, 
    ref: "User" 
  },
  profileId: { 
    type: Schema.Types.ObjectId, 
    ref: "Profile" 
  },
  leadIntent: {
    type: String,
    enum: Object.values(LeadIntent),
    required: true
  },
  leadType: { 
    type: String, 
    enum: Object.values(LeadType), 
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    maxlength: 200
  },
  description: { 
    type: String, 
    required: true,
    maxlength: 2000
  },
  
  // Conditional schemas based on lead type
  productInfo: {
    type: ProductInfoSchema,
    required: function(this: ILead) { 
      return this.leadType === LeadType.PRODUCT; 
    }
  },
  serviceInfo: {
    type: ServiceInfoSchema,
    required: function(this: ILead) { 
      return this.leadType === LeadType.SERVICE; 
    }
  },
  
  // Common fields
  budget: { type: Number },
  currency: { type: String, default: "USD" },
  location: {
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String },
    zipCode: { type: String }
  },
  
  // Lead status and metadata
  status: { 
    type: String, 
    enum: ["inactive", "active", "closed", "expired"], 
    default: "inactive" 
  },
  priority: { 
    type: String, 
    enum: ["low", "medium", "high", "urgent"], 
    default: "low" 
  },
  expiryDate: { type: Date },
  
  // Engagement tracking
  views: { type: Number, default: 0 },
  upvotes: { type: Number, default: 0 },
  interactions: [{
    type: { type: String },
    interactorId: { type: Schema.Types.ObjectId, ref: "User" },
    timestamp: { type: Date },
    content: { type: String }
  }],
  isPublic: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  otp: { type: Number },
  otpExpiry: { type: Date }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Indexes for better query performance
LeadSchema.index({ userId: 1, createdAt: -1 });
LeadSchema.index({ leadType: 1, status: 1 });
LeadSchema.index({ "location.country": 1, "location.state": 1, "location.city": 1 });
LeadSchema.index({ status: 1, isPublic: 1, expiryDate: 1 });

// Pre-save middleware for validation and auto-population
LeadSchema.pre<ILead>("save", async function (next) {
  // Auto-set expiry date if not provided (30 days from creation)
  if (!this.expiryDate && this.isNew) {
    this.expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  }
  
  // Validate that either productInfo or serviceInfo is provided based on leadType
  if (this.leadType === LeadType.PRODUCT && !this.productInfo) {
    throw new Error("Product information is required for product leads");
  }
  
  if (this.leadType === LeadType.SERVICE && !this.serviceInfo) {
    throw new Error("Service information is required for service leads");
  }
  
  next();
});

// Instance methods
LeadSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

LeadSchema.methods.addInteractions = function(interactionData: Interactions) {
  this.interactions.push(interactionData);
  return this.save();
};

LeadSchema.methods.isExpired = function() {
  return this.expiryDate && this.expiryDate < new Date();
};

// Static methods
LeadSchema.statics.findActiveLeads = function() {
  return this.find({
    status: "active",
    isPublic: true,
    $or: [
      { expiryDate: { $gt: new Date() } },
      { expiryDate: null }
    ]
  });
};

LeadSchema.statics.findByLocation = function(country: string, state?: string, city?: string) {
  const query: any = { "location.country": country };
  if (state) query["location.state"] = state;
  if (city) query["location.city"] = city;
  
  return this.find(query);
};

// Export the model
const Lead = model<ILead>("Lead", LeadSchema);
export default Lead;