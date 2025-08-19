import mongoose, { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcrypt";
import { socket } from "../config/server";
import LocationProvider from "../lib/location";
import { generateOtp } from "../lib/otp";

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
  userId: Types.ObjectId;
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
  };
  businessModel: string;
  certifications?: string;
  socials?: Socials;
  createdAt: Date;
  updatedAt: Date;
  knownIps: string[];
  knownLocations: string[];
  status: string;
  completeness?: number;
  slug: string;
  email: string;
}

// Schema definition
const SocialsSchema = new Schema<Socials>(
  {
    facebook: { type: String },
    twitter: { type: String },
    linkedin: { type: String },
    insta: { type: String },
    youtube: { type: String },
    tiktok: { type: String },
  },
  { _id: false }
);

const ProfileSchema = new Schema<IProfile>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    role: { type: String, required: true },
    companyName: { type: String, required: true },
    legalStatus: { type: String, required: true },
    businessCategory: { type: String, required: true },
    businessSubcategory: { type: String, required: true },
    yearOfEstablishment: { type: String, required: true },
    companySize: { type: String, required: true },
    address1: { type: String, required: true },
    address2: { type: String },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    mobile: { type: String, required: true },
    landline: { type: String },
    website: { type: String, required: true },
    companyDescription: { type: String, required: true },
    logoFile: {
      type: { type: String },
      path: { type: String },
      originalName: { type: String },
    },
    businessModel: { type: String, required: true },
    certifications: { type: String },
    socials: { type: SocialsSchema },
    knownIps: { type: [String], default: [] },
    knownLocations: { type: [String], default: [] },
    status: { type: String, default: "pending" },
    completeness: { type: Number, default: 0 },
    slug: { type: String },
    email: { type: String, required: true },
  },
  {
    timestamps: true, // auto-manages createdAt & updatedAt
  }
);

// convert companyName into slug
function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-") // replace spaces with -
    .replace(/-+/g, "-"); // collapse multiple -
}

// Pre-save hook to generate unique slug
ProfileSchema.pre<IProfile>("save", async function (next) {
  if (!this.isModified("companyName") && this.slug) return next();

  let baseSlug = slugify(this.companyName);
  let slug = baseSlug;
  let counter = 1;

  // Keep finding a new slug until unique
  while (await mongoose.models.Profile.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  this.slug = slug;
  next();
});

// Export the model and return type
const Profile = model<IProfile>("Profile", ProfileSchema);
export default Profile;
