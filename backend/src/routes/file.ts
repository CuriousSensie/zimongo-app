import express from "express";
import logger from "../config/logger";
import { CustomRequest, RequestContext } from "../types/request";
import { bucketHelper } from "../lib/aws_s3";

const fileRouter = express.Router();

const getContentType = (fileName: string): string => {
  const extension = fileName.split(".").pop()!.toLowerCase();
  switch (extension) {
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "ogg":
      return "audio/ogg";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "bmp":
      return "image/bmp";
    case "webp":
      return "image/webp";
    case "tiff":
    case "tif":
      return "image/tiff";
    case "svg":
      return "image/svg+xml";
    case "ico":
      return "image/x-icon";
    default:
      return "application/octet-stream"; // Default content type
  }
};

fileRouter.get("/*", async (req, res) => {
  try {
    const fileName = (req.params as any)[0];
    const url = await bucketHelper.getFileUrl(fileName);
    return res.json({ url });
  } catch (error) {
    logger.error((error as Error).message);
    return res.status(500).json({
      success: false,
      message: "failed to get files",
      error: (error as Error).message,
    });
  }
});

export default fileRouter;
