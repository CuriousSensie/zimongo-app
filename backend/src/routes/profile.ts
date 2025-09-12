import express, { Response } from "express";
import { CustomRequest } from "../types/request";
import Authentication from "../middleware/auth";
import Profile from "../models/Profile";
import { profile } from "console";
import logger from "../config/logger";
import User from "../models/User";
import mongoose, { mongo, Types } from "mongoose";
import { categories } from "../constant/profile";
import Permission, { IPermission } from "../models/Permission";
import { uploadFile } from "../middleware/file";
import { bucketHelper } from "../lib/aws_s3";
import multer from "multer";

const upload = multer();

const profileRouter = express.Router();

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-") // replace spaces with -
    .replace(/-+/g, "-"); // collapse multiple -
}

async function generateUniqueSlug(companyName: string) {
  let baseSlug = slugify(companyName);
  let slug = baseSlug;
  let counter = 1;

  // keep checking until slug is unique
  while (await Profile.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// create profile
profileRouter.post(
  "/",
  upload.single("logoFile"),
  Authentication.User,
  async (req: CustomRequest, res: Response) => {
    try {
      const data = JSON.parse(req.body.data);
      const profileData = { ...data, status: "pending" };

      if (!profileData.userId) {
        logger.error("UserID is required to create a profile.");
        return res
          .status(400)
          .json({ msg: "Invalid attempt to create a profile." });
      }

      const existingProfile = await Profile.findOne({
        userId: profileData.userId,
      });

      if (existingProfile) {
        logger.error(
          `A profile already exists for the user: ${profileData.userId}`
        );
        return res
          .status(400)
          .json({ msg: "Current user already has a profile." });
      }

      const requiredFields = [
        "companyName",
        "companyDescription",
        "role",
        "legalStatus",
        "businessCategory",
        "businessSubcategory",
        "yearOfEstablishment",
        "companySize",
        "address1",
        "country",
        "state",
        "city",
        "zip",
        "mobile",
        "website",
        "email",
      ];

      for (const field of requiredFields) {
        if (
          !profileData[field] ||
          profileData[field].toString().trim() === ""
        ) {
          return res.status(400).json({ msg: `Field ${field} is required.` });
        }
      }

      // decides permissions based on role
      const permissionData: Partial<IPermission> = {};
      if (categories.category1.includes(profileData.role)) {
        permissionData.canSellProducts = true;
      } else if (categories.category2.includes(profileData.role)) {
        permissionData.canSellProducts = true;
        permissionData.canSellServices = true;
      } else if (categories.category3.includes(profileData.role)) {
        permissionData.canSellServices = true;
      }

      if (req.file) {
        const filePath = `logos/${req.context?.user?.id}-${Date.now()}-${
          req.file.originalname
        }`;

        try {
          await bucketHelper.save(filePath, req.file.buffer);
        } catch (error) {
          logger.error("Error uploading file to S3:", (error as Error).message);
          return res.status(500).json({
            success: false,
            msg: "Error uploading file to S3.",
            error: (error as Error).message,
          });
        }

        profileData.logoFile = {
          type: req.file.mimetype,
          path: filePath,
          originalName: req.file.originalname,
        };
      }

      const newProfile = await Profile.create(profileData);

      await User.findByIdAndUpdate(profileData.userId, {
        profileSlug: newProfile.slug,
        picture: newProfile.logoFile,
      });

      await Permission.create({
        profileId: newProfile._id,
        ...permissionData,
      });

      res
        .status(200)
        .json({ msg: "Profile created successfully.", data: newProfile });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal server error." });
    }
  }
);

// get profile using userId
profileRouter.get(
  "/:userId",
  Authentication.User,
  async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.params.userId;

      if (!userId) {
        logger.error("UserID is required to get a profile.");
        return res
          .status(400)
          .json({ msg: "Invalid attempt to get a profile." });
      }

      const profile = await Profile.findOne({ userId });

      if (!profile) {
        logger.error(`Profile not found for user: ${userId}`);
        return res.status(404).json({ msg: "Profile not found." });
      }

      res.status(200).json({ msg: "Profile found.", data: profile });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal server error." });
    }
  }
);

// get profile using slug
profileRouter.get(
  "/slug/:slug",
  Authentication.User,
  async (req: CustomRequest, res: Response) => {
    try {
      const slug = req.params.slug;

      if (!slug) {
        logger.error("Slug is required to get a profile.");
        return res
          .status(400)
          .json({ msg: "Invalid attempt to get a profile." });
      }

      // const profile = await Profile.findOne({ slug, status: "active" });
      const profile = await Profile.findOne({ slug });

      if (!profile) {
        logger.error(`Profile not found for slug: ${slug}`);
        return res.status(404).json({ msg: "Profile not found." });
      }

      res.status(200).json({ msg: "Profile found.", data: profile });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal server error." });
    }
  }
);

// get profile using profileId
profileRouter.get(
  "/:id",
  Authentication.User,
  async (req: CustomRequest, res: Response) => {
    try {
      const id = req.params.id;

      if (!id) {
        logger.error("UserID is required to get a profile.");
        return res
          .status(400)
          .json({ msg: "Invalid attempt to get a profile." });
      }

      const profile = await Profile.findById(id);

      if (!profile) {
        logger.error(`Profile not found for the id: ${id}`);
        return res.status(404).json({ msg: "Profile not found." });
      }

      res.status(200).json({ msg: "Profile found.", data: profile });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal server error." });
    }
  }
);

// update profile
profileRouter.put(
  "/:id",
  Authentication.User,
  upload.single("logoFile"),
  async (req: CustomRequest, res: Response) => {
    try {
      if (!req.params.id) {
        logger.error("Profile ID is required for update.");
        return res
          .status(400)
          .json({ success: false, msg: "Profile ID is required." });
      }

      let updateData;
      try {
        updateData = JSON.parse(req.body.data);
      } catch (err) {
        logger.error("Invalid JSON in request body.", { err });
        return res
          .status(400)
          .json({ success: false, msg: "Malformed request payload." });
      }

      // Disallowed fields
      const restrictedFields = [
        "role",
        "companyName",
        "country",
        "state",
        "city",
      ];
      restrictedFields.forEach((field) => {
        if (field in updateData) {
          delete updateData[field];
        }
      });

      const profile = await Profile.findById(req.params.id);
      if (!profile) {
        logger.warn(`Profile not found for ID: ${req.params.id}`);
        return res
          .status(404)
          .json({ success: false, msg: "Profile not found." });
      }

      // secure update
      if (
        profile.userId._id.toString() !==
        (req?.context?.user?._id as Types.ObjectId).toString()
      ) {
        console.log(
          profile.userId,
          typeof profile.userId,
          req.context?.user._id,
          typeof req.context?.user._id
        );
        logger.warn(
          `Unauthorized profile update attempt by user: ${req.context?.user._id}`
        );
        return res.status(403).json({
          success: false,
          msg: "You are not authorized to update this profile.",
        });
      }

      if (req.file) {
        const filePath = `logos/${req.context?.user?.id}-${Date.now()}-${
          req.file.originalname
        }`;

        try {
          await bucketHelper.save(filePath, req.file.buffer);
        } catch (error) {
          logger.error("Error uploading file to S3:", (error as Error).message);
          return res.status(500).json({
            success: false,
            msg: "Error uploading file to S3.",
            error: (error as Error).message,
          });
        }

        updateData.logoFile = {
          type: req.file.mimetype,
          path: filePath,
          originalName: req.file.originalname,
        };
      }

      // Apply updates
      const updatedProfile = await Profile.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (updatedProfile) {
        await User.findByIdAndUpdate(req.context?.user._id, {
          picture: updatedProfile.logoFile,
        });
      }

      logger.info(
        `Profile updated successfully for user: ${req.context?.user._id}`
      );
      return res.status(200).json({
        success: true,
        msg: "Profile updated successfully.",
        data: updatedProfile,
      });
    } catch (error) {
      logger.error("Unexpected error while updating profile", { error });
      return res
        .status(500)
        .json({ success: false, msg: "Internal server error." });
    }
  }
);

export default profileRouter;
