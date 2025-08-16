import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcrypt";
import { permission } from "process";

// Interface for Profile document with TypeScript
export interface IPermission extends Document {
  profileId: Types.ObjectId;
  canBuyProducts: boolean;
  canSellProducts: boolean;
  canBuyServices: boolean;
  canSellServices: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const permissionSchema = new Schema<IPermission>(
  {
    profileId: { type: Schema.Types.ObjectId, required: true, ref: "Profile" },
    canBuyProducts: { type: Boolean, default: false },
    canSellProducts: { type: Boolean, default: false },
    canBuyServices: { type: Boolean, default: false },
    canSellServices: { type: Boolean, default: false },
  },
  { timestamps: true } // This adds createdAt and updatedAt fields
);

// Export the model and return type
const Permission = model<IPermission>("Permission", permissionSchema);
export default Permission;
