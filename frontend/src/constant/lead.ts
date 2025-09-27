// Lead Management Constants
// Centralized constants for lead creation, categorization, and management

import { 
  DimensionUnit, 
  WeightUnit, 
  UnitOfMeasurement, 
  ServiceFrequency, 
  ServiceType,
  LeadIntent,
  LeadType
} from "@/types/lead";

// Product Categories with subcategories for better organization
export const productCategories = [
  {
    value: "electronics",
    label: "Electronics",
    subcategories: [
      { value: "consumer-electronics", label: "Consumer Electronics" },
      { value: "industrial-electronics", label: "Industrial Electronics" },
      { value: "electronic-components", label: "Electronic Components" },
      { value: "telecommunications", label: "Telecommunications" },
      { value: "audio-video", label: "Audio & Video Equipment" },
      { value: "computers-accessories", label: "Computers & Accessories" },
      { value: "gaming-electronics", label: "Gaming Electronics" },
    ]
  },
  {
    value: "construction",
    label: "Construction Materials",
    subcategories: [
      { value: "building-materials", label: "Building Materials" },
      { value: "construction-tools", label: "Construction Tools" },
      { value: "roofing-materials", label: "Roofing Materials" },
      { value: "flooring-materials", label: "Flooring Materials" },
      { value: "plumbing-supplies", label: "Plumbing Supplies" },
      { value: "electrical-supplies", label: "Electrical Supplies" },
      { value: "paint-coatings", label: "Paint & Coatings" },
    ]
  },
  {
    value: "automotive",
    label: "Automotive",
    subcategories: [
      { value: "auto-parts", label: "Auto Parts" },
      { value: "automotive-tools", label: "Automotive Tools" },
      { value: "vehicle-accessories", label: "Vehicle Accessories" },
      { value: "automotive-fluids", label: "Automotive Fluids" },
      { value: "car-care", label: "Car Care Products" },
      { value: "commercial-vehicles", label: "Commercial Vehicles" },
      { value: "motorcycles-parts", label: "Motorcycles & Parts" },
    ]
  },
  {
    value: "textiles",
    label: "Textiles & Apparel",
    subcategories: [
      { value: "fabrics", label: "Fabrics & Raw Materials" },
      { value: "clothing", label: "Clothing & Garments" },
      { value: "home-textiles", label: "Home Textiles" },
      { value: "industrial-textiles", label: "Industrial Textiles" },
      { value: "textile-accessories", label: "Textile Accessories" },
      { value: "footwear", label: "Footwear" },
      { value: "bags-luggage", label: "Bags & Luggage" },
    ]
  },
  {
    value: "machinery",
    label: "Machinery & Equipment",
    subcategories: [
      { value: "industrial-machinery", label: "Industrial Machinery" },
      { value: "agricultural-machinery", label: "Agricultural Machinery" },
      { value: "construction-machinery", label: "Construction Machinery" },
      { value: "packaging-machinery", label: "Packaging Machinery" },
      { value: "textile-machinery", label: "Textile Machinery" },
      { value: "food-machinery", label: "Food Processing Machinery" },
      { value: "medical-equipment", label: "Medical Equipment" },
    ]
  },
  {
    value: "chemicals",
    label: "Chemicals & Materials",
    subcategories: [
      { value: "industrial-chemicals", label: "Industrial Chemicals" },
      { value: "petrochemicals", label: "Petrochemicals" },
      { value: "agrochemicals", label: "Agrochemicals" },
      { value: "plastics-polymers", label: "Plastics & Polymers" },
      { value: "rubber-products", label: "Rubber Products" },
      { value: "adhesives-sealants", label: "Adhesives & Sealants" },
      { value: "specialty-chemicals", label: "Specialty Chemicals" },
    ]
  },
  {
    value: "food",
    label: "Food & Beverages",
    subcategories: [
      { value: "processed-food", label: "Processed Food" },
      { value: "beverages", label: "Beverages" },
      { value: "dairy-products", label: "Dairy Products" },
      { value: "meat-poultry", label: "Meat & Poultry" },
      { value: "seafood", label: "Seafood" },
      { value: "fruits-vegetables", label: "Fruits & Vegetables" },
      { value: "grains-cereals", label: "Grains & Cereals" },
      { value: "snacks-confectionery", label: "Snacks & Confectionery" },
    ]
  },
  {
    value: "medical",
    label: "Medical & Healthcare",
    subcategories: [
      { value: "medical-devices", label: "Medical Devices" },
      { value: "pharmaceuticals", label: "Pharmaceuticals" },
      { value: "medical-supplies", label: "Medical Supplies" },
      { value: "diagnostic-equipment", label: "Diagnostic Equipment" },
      { value: "surgical-instruments", label: "Surgical Instruments" },
      { value: "healthcare-furniture", label: "Healthcare Furniture" },
      { value: "wellness-products", label: "Wellness Products" },
    ]
  },
  {
    value: "furniture",
    label: "Furniture & Home Decor",
    subcategories: [
      { value: "office-furniture", label: "Office Furniture" },
      { value: "home-furniture", label: "Home Furniture" },
      { value: "outdoor-furniture", label: "Outdoor Furniture" },
      { value: "kitchen-furniture", label: "Kitchen Furniture" },
      { value: "lighting-fixtures", label: "Lighting Fixtures" },
      { value: "home-decor", label: "Home Decor Items" },
      { value: "storage-solutions", label: "Storage Solutions" },
    ]
  },
  {
    value: "other",
    label: "Other",
    subcategories: [
      { value: "sports-recreation", label: "Sports & Recreation" },
      { value: "toys-games", label: "Toys & Games" },
      { value: "books-stationery", label: "Books & Stationery" },
      { value: "gifts-crafts", label: "Gifts & Crafts" },
      { value: "pet-supplies", label: "Pet Supplies" },
      { value: "security-safety", label: "Security & Safety" },
      { value: "miscellaneous", label: "Miscellaneous" },
    ]
  }
];

// Service Categories with subcategories
export const serviceCategories = [
  {
    value: "it",
    label: "IT & Technology",
    subcategories: [
      { value: "software-development", label: "Software Development" },
      { value: "web-development", label: "Web Development" },
      { value: "mobile-app-development", label: "Mobile App Development" },
      { value: "it-support", label: "IT Support & Maintenance" },
      { value: "cybersecurity", label: "Cybersecurity Services" },
      { value: "cloud-services", label: "Cloud Services" },
      { value: "data-analytics", label: "Data Analytics" },
      { value: "ai-ml-services", label: "AI/ML Services" },
    ]
  },
  {
    value: "cleaning",
    label: "Cleaning Services",
    subcategories: [
      { value: "office-cleaning", label: "Office Cleaning" },
      { value: "residential-cleaning", label: "Residential Cleaning" },
      { value: "industrial-cleaning", label: "Industrial Cleaning" },
      { value: "carpet-cleaning", label: "Carpet Cleaning" },
      { value: "window-cleaning", label: "Window Cleaning" },
      { value: "deep-cleaning", label: "Deep Cleaning" },
      { value: "sanitization", label: "Sanitization Services" },
    ]
  },
  {
    value: "marketing",
    label: "Marketing & Advertising",
    subcategories: [
      { value: "digital-marketing", label: "Digital Marketing" },
      { value: "seo-services", label: "SEO Services" },
      { value: "social-media-marketing", label: "Social Media Marketing" },
      { value: "content-marketing", label: "Content Marketing" },
      { value: "email-marketing", label: "Email Marketing" },
      { value: "print-advertising", label: "Print Advertising" },
      { value: "brand-strategy", label: "Brand Strategy" },
      { value: "market-research", label: "Market Research" },
    ]
  },
  {
    value: "construction",
    label: "Construction & Renovation",
    subcategories: [
      { value: "residential-construction", label: "Residential Construction" },
      { value: "commercial-construction", label: "Commercial Construction" },
      { value: "renovation-remodeling", label: "Renovation & Remodeling" },
      { value: "electrical-work", label: "Electrical Work" },
      { value: "plumbing-services", label: "Plumbing Services" },
      { value: "painting-services", label: "Painting Services" },
      { value: "roofing-services", label: "Roofing Services" },
      { value: "flooring-installation", label: "Flooring Installation" },
    ]
  },
  {
    value: "consulting",
    label: "Business Consulting",
    subcategories: [
      { value: "business-strategy", label: "Business Strategy" },
      { value: "management-consulting", label: "Management Consulting" },
      { value: "financial-consulting", label: "Financial Consulting" },
      { value: "hr-consulting", label: "HR Consulting" },
      { value: "operations-consulting", label: "Operations Consulting" },
      { value: "it-consulting", label: "IT Consulting" },
      { value: "startup-consulting", label: "Startup Consulting" },
      { value: "regulatory-compliance", label: "Regulatory Compliance" },
    ]
  },
  {
    value: "maintenance",
    label: "Maintenance & Repair",
    subcategories: [
      { value: "facility-maintenance", label: "Facility Maintenance" },
      { value: "equipment-repair", label: "Equipment Repair" },
      { value: "hvac-services", label: "HVAC Services" },
      { value: "appliance-repair", label: "Appliance Repair" },
      { value: "automotive-repair", label: "Automotive Repair" },
      { value: "electronics-repair", label: "Electronics Repair" },
      { value: "preventive-maintenance", label: "Preventive Maintenance" },
    ]
  },
  {
    value: "design",
    label: "Design & Creative",
    subcategories: [
      { value: "graphic-design", label: "Graphic Design" },
      { value: "web-design", label: "Web Design" },
      { value: "interior-design", label: "Interior Design" },
      { value: "architectural-design", label: "Architectural Design" },
      { value: "product-design", label: "Product Design" },
      { value: "logo-branding", label: "Logo & Branding" },
      { value: "video-production", label: "Video Production" },
      { value: "photography", label: "Photography" },
    ]
  },
  {
    value: "legal",
    label: "Legal Services",
    subcategories: [
      { value: "corporate-law", label: "Corporate Law" },
      { value: "contract-law", label: "Contract Law" },
      { value: "intellectual-property", label: "Intellectual Property" },
      { value: "employment-law", label: "Employment Law" },
      { value: "tax-law", label: "Tax Law" },
      { value: "real-estate-law", label: "Real Estate Law" },
      { value: "litigation", label: "Litigation" },
      { value: "legal-compliance", label: "Legal Compliance" },
    ]
  },
  {
    value: "accounting",
    label: "Accounting & Finance",
    subcategories: [
      { value: "bookkeeping", label: "Bookkeeping" },
      { value: "tax-preparation", label: "Tax Preparation" },
      { value: "audit-services", label: "Audit Services" },
      { value: "financial-planning", label: "Financial Planning" },
      { value: "payroll-services", label: "Payroll Services" },
      { value: "investment-advisory", label: "Investment Advisory" },
      { value: "financial-analysis", label: "Financial Analysis" },
    ]
  },
  {
    value: "logistics",
    label: "Logistics & Transportation",
    subcategories: [
      { value: "freight-forwarding", label: "Freight Forwarding" },
      { value: "warehousing", label: "Warehousing" },
      { value: "distribution-services", label: "Distribution Services" },
      { value: "courier-services", label: "Courier Services" },
      { value: "supply-chain", label: "Supply Chain Management" },
      { value: "shipping-services", label: "Shipping Services" },
      { value: "customs-clearance", label: "Customs Clearance" },
    ]
  },
  {
    value: "security",
    label: "Security Services",
    subcategories: [
      { value: "physical-security", label: "Physical Security" },
      { value: "cybersecurity", label: "Cybersecurity" },
      { value: "surveillance-systems", label: "Surveillance Systems" },
      { value: "access-control", label: "Access Control" },
      { value: "security-consulting", label: "Security Consulting" },
      { value: "event-security", label: "Event Security" },
      { value: "background-checks", label: "Background Checks" },
    ]
  },
  {
    value: "healthcare",
    label: "Healthcare Services",
    subcategories: [
      { value: "medical-services", label: "Medical Services" },
      { value: "telemedicine", label: "Telemedicine" },
      { value: "healthcare-consulting", label: "Healthcare Consulting" },
      { value: "medical-equipment-services", label: "Medical Equipment Services" },
      { value: "laboratory-services", label: "Laboratory Services" },
      { value: "home-healthcare", label: "Home Healthcare" },
      { value: "wellness-programs", label: "Wellness Programs" },
    ]
  },
  {
    value: "education",
    label: "Education & Training",
    subcategories: [
      { value: "corporate-training", label: "Corporate Training" },
      { value: "technical-training", label: "Technical Training" },
      { value: "language-training", label: "Language Training" },
      { value: "professional-development", label: "Professional Development" },
      { value: "online-courses", label: "Online Courses" },
      { value: "certification-programs", label: "Certification Programs" },
      { value: "educational-consulting", label: "Educational Consulting" },
    ]
  },
  {
    value: "other",
    label: "Other Services",
    subcategories: [
      { value: "event-management", label: "Event Management" },
      { value: "catering-services", label: "Catering Services" },
      { value: "translation-services", label: "Translation Services" },
      { value: "research-services", label: "Research Services" },
      { value: "insurance-services", label: "Insurance Services" },
      { value: "real-estate-services", label: "Real Estate Services" },
      { value: "miscellaneous-services", label: "Miscellaneous Services" },
    ]
  }
];

// Lead Priority Levels
export const priorityLevels = [
  { value: "low", label: "Low", color: "green" },
  { value: "medium", label: "Medium", color: "yellow" },
  { value: "high", label: "High", color: "orange" },
  { value: "urgent", label: "Urgent", color: "red" },
];

// Lead Status Options
export const leadStatuses = [
  { value: "inactive", label: "Inactive (Verification Required)", color: "gray" },
  { value: "active", label: "Active", color: "green" },
  { value: "closed", label: "Closed", color: "blue" },
  { value: "expired", label: "Expired", color: "red" },
];

// Currency Options
export const currencies = [
  { value: "USD", label: "USD ($)", symbol: "$" },
  { value: "EUR", label: "EUR (€)", symbol: "€" },
  { value: "GBP", label: "GBP (£)", symbol: "£" },
  { value: "INR", label: "INR (₹)", symbol: "₹" },
  { value: "JPY", label: "JPY (¥)", symbol: "¥" },
  { value: "CAD", label: "CAD (C$)", symbol: "C$" },
  { value: "AUD", label: "AUD (A$)", symbol: "A$" },
  { value: "CNY", label: "CNY (¥)", symbol: "¥" },
];

// Common Materials for Products
export const commonMaterials = [
  "Steel", "Aluminum", "Plastic", "Wood", "Glass", "Concrete", 
  "Rubber", "Ceramic", "Composite", "Fabric", "Leather", "Paper",
  "Copper", "Brass", "Bronze", "Titanium", "Carbon Fiber", "Other"
];

// Common Packaging Types
export const packagingTypes = [
  "Box", "Bag", "Drum", "Pallet", "Bottle", "Can", "Tube", 
  "Pouch", "Carton", "Crate", "Roll", "Bundle", "Bulk", "Other"
];

// File Upload Constraints
export const fileUploadConfig = {
  maxFiles: 5,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  allowedDocumentTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
};

// Form Validation Messages
export const validationMessages = {
  required: "This field is required",
  invalidEmail: "Please enter a valid email address",
  invalidPhone: "Please enter a valid phone number",
  invalidDate: "Please enter a valid date",
  invalidNumber: "Please enter a valid number",
  minLength: (min: number) => `Minimum ${min} characters required`,
  maxLength: (max: number) => `Maximum ${max} characters allowed`,
  fileSize: "File size must be less than 10MB",
  fileType: "Invalid file type",
  maxFiles: "Maximum 5 files allowed",
};


// Sorting Options for Browse Page
export const sortingOptions = [
  { 
    value: "createdAt", 
    label: "Latest", 
    description: "Most recently posted",
    icon: "clock"
  },
  { 
    value: "budget", 
    label: "Budget", 
    description: "Highest to lowest budget",
    icon: "dollar-sign"
  },
  { 
    value: "views", 
    label: "Most Viewed", 
    description: "Most popular leads",
    icon: "eye"
  },
  { 
    value: "upvotes", 
    label: "Most Upvoted", 
    description: "Highest rated leads",
    icon: "thumbs-up"
  }
];

// Sort Order Options
export const sortOrderOptions = [
  { value: "desc", label: "High to Low" },
  { value: "asc", label: "Low to High" }
];

// Budget Range Presets for Quick Filtering
export const budgetRanges = [
  { label: "Under $1K", min: "0", max: "1000" },
  { label: "$1K - $5K", min: "1000", max: "5000" },
  { label: "$5K - $10K", min: "5000", max: "10000" },
  { label: "$10K - $50K", min: "10000", max: "50000" },
  { label: "$50K+", min: "50000", max: "" },
];

// Location Options (Placeholder for now as requested)
export const locationFilters = {
  countries: [
    { value: "us", label: "United States" },
    { value: "ca", label: "Canada" },
    { value: "uk", label: "United Kingdom" },
    { value: "de", label: "Germany" },
    { value: "fr", label: "France" },
    { value: "in", label: "India" },
    { value: "au", label: "Australia" },
    { value: "jp", label: "Japan" },
  ],
  // States and cities will be populated based on country selection
  states: [],
  cities: []
};

// Filter Reset Configuration
export const defaultFilters = {
  search: "",
  leadIntent: "buy" as LeadIntent,
  leadType: "product" as LeadType,
  category: "",
  minBudget: "",
  maxBudget: "",
  country: "",
  state: "",
  city: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

// Default values for forms
export const leadDefaults = {
  currency: "USD",
  priority: "medium",
  isPublic: true,
  isOneTimePurchase: true,
  isRemote: false,
  dimensionUnit: DimensionUnit.CM,
  weightUnit: WeightUnit.KG,
  unitOfMeasurement: UnitOfMeasurement.PIECES,
};

// Export all enums from types for convenience
export {
  LeadIntent,
  LeadType,
  ServiceType,
  ServiceFrequency,
  DimensionUnit,
  WeightUnit,
  UnitOfMeasurement,
};