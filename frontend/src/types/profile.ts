interface Socials {
  facebook?: string;
  insta?: string;
  whatsapp?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
}

// Interface for Profile document with TypeScript
export interface IProfile extends Document {
  _id: string;
  userId: string;
  role: string;
  companyName: string;
  legalStatus: string;
  businessCategory: string;
  businessSubcategory: string;
  yearOfEstablishment: string;
  companySize: string;
  address1: string;
  address2?: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  mobile: string;
  landline?: string;
  website: string;
  companyDescription: string;
  logoFile?: {
    type: string;
    path: string;
    originalName: string;
    fileUrl: string;
  };
  businessModel: string;
  certifications?: string;
  socials?: Socials;
  createdAt: string;
  updatedAt: string;
  knownIps: string[];
  knownLocations: string[];
  status: string;
  completeness?: number;
  slug: string;
  email: string;
}
