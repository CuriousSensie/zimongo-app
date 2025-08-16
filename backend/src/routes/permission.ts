import express, { Response } from "express";
import Permission, { IPermission } from "../models/Permission";
import logger from "../config/logger";
import Authentication from "../middleware/auth";
import { CustomRequest } from "../types/request";

const permissionRouter = express.Router();

permissionRouter.patch(
  "/updateSinglePermission",
  Authentication.Admin,
  async (req: CustomRequest, res: Response) => {
    try {
      const {
        profileId,
        canBuyProducts,
        canSellProducts,
        canBuyServices,
        canSellServices,
      } = req.body;
      const updatedPermission = await Permission.findOneAndUpdate(
        { profileId },
        {
          canBuyProducts,
          canSellProducts,
          canBuyServices,
          canSellServices,
        },
        { new: true }
      );

      res
        .status(200)
        .json({
          msg: "Permission updated successfully.",
          data: updatedPermission,
        });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ msg: "Internal server error." });
    }
  }
);

export default permissionRouter;
