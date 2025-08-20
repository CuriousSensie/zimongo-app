import express from "express";
import logger from "../config/logger";
import { CustomRequest, RequestContext } from "../types/request";
import { bucketHelper } from "../lib/aws_s3";
import { uploadFile } from "../middleware/file";
import Authentication from "../middleware/auth";
import multer, { MulterError } from "multer";

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

// Configure multer for memory storage (for S3 upload)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb( new MulterError('LIMIT_UNEXPECTED_FILE'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  }
});

// Upload files endpoint
fileRouter.post(
  "/upload",
  Authentication.User,
  upload.array("files", 5),
  async (req: CustomRequest, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const userId = req.context?.user?.id;
      
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
      }

      const uploadedFiles = [];
      const uploadedPaths: string[] = []; // Track uploaded files for cleanup

      try {
        // Upload each file to S3
        for (const file of files) {
          const timestamp = Date.now();
          const randomSuffix = Math.round(Math.random() * 1E9);
          const fileExtension = file.originalname.split('.').pop();
          const fileName = `${timestamp}-${randomSuffix}.${fileExtension}`;
          const filePath = `leads/${userId}/${fileName}`;

          // Upload to S3
          await bucketHelper.save(filePath, file.buffer);
          uploadedPaths.push(filePath);

          uploadedFiles.push({
            type: file.mimetype,
            path: filePath,
            originalName: file.originalname,
            size: file.size,
          });
        }

        return res.status(200).json({
          success: true,
          message: "Files uploaded successfully",
          data: {
            files: uploadedFiles,
            count: uploadedFiles.length,
          },
        });

      } catch (uploadError) {
        // If any upload fails, clean up all uploaded files
        logger.error("Error during file upload, cleaning up:", uploadError);
        
        for (const path of uploadedPaths) {
          try {
            await bucketHelper.delete(path);
            logger.info(`Cleaned up file: ${path}`);
          } catch (deleteError) {
            logger.error(`Failed to clean up file ${path}:`, deleteError);
          }
        }

        throw uploadError;
      }

    } catch (error) {
      logger.error("File upload error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload files",
        error: (error as Error).message,
      });
    }
  }
);

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
