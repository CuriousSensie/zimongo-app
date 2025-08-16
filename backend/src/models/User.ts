import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcrypt";
import { socket } from "../config/server";
import LocationProvider from "../lib/location";
import { generateOtp } from "../lib/otp";

// Interface for User document with TypeScript
export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  resetToken?: string;
  emailVerifyToken?: string;
  picture?: string;
  isAdmin: boolean;
  isBlocked: boolean;
  online: boolean;
  isEmailVerified: boolean;
  isDeactivated: boolean;
  isRegistrationCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
  notify(message: string, type: string, title: string): Promise<void>;
  otp: number | undefined;
  otpExpiry: Date | undefined;
  knownIps: string[];
  knownLocation: string[];
  is2FA: boolean;
  profileSlug: string;
}

// Schema definition
const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    name: { type: String, required: false },
    resetToken: { type: String },
    emailVerifyToken: { type: String },
    online: { type: Boolean, default: false },
    picture: { type: String },
    isAdmin: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isDeactivated: { type: Boolean, default: false },
    isRegistrationCompleted: { type: Boolean, default: false },
    is2FA: { type: Boolean, default: false },
    otp: { type: Number },
    otpExpiry: { type: Date },
    knownIps: { type: [String], default: [] },
    knownLocation: { type: [String], default: [] },
    profileSlug: { type: String, unique: true },
  },
  { timestamps: true } // This adds createdAt and updatedAt fields
);

// Pre-save hook to hash password
userSchema.pre<IUser>("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};


userSchema.methods.notify = async function (
  title: string,
  message: string,
  type: string,
  page: string = "general",
  action: string = "notified",
  data: Record<string, any> = {}
) {
  const userId = this.id;

  // handle notifications
};

// Export the model and return type
const User = model<IUser>("User", userSchema);
export default User;
