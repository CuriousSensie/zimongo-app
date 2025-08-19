import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import {
  S3_BUCKET_NAME,
  S3_REGION,
  S3_ACCESS_KEY,
  S3_SECRET_KEY,
} from "../constant/env";
import logger from "../config/logger";

class BucketHelper {
  private s3Client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = S3_BUCKET_NAME;

    this.s3Client = new S3Client({
      region: S3_REGION,
      credentials: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY,
      },
    });
  }

  async save(filename: string, buffer: Buffer) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: filename,
        Body: buffer,
      });

      await this.s3Client.send(command);
      logger.info(`File ${filename} uploaded successfully to S3.`);
    } catch (error) {
      logger.error("Error uploading file to S3:", error);
      throw error;
    }
  }

  async getFileUrl(key: string, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      logger.error("Error generating signed file URL:", error);
      throw error;
    }
  }

  async delete(key: string) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      logger.info(`File ${key} deleted successfully from S3.`);
    } catch (error) {
      logger.error(`Error deleting file ${key} from S3:`, error);
      throw error;
    }
  }

  async copy(sourceKey: string, destinationKey: string) {
    try {
      const command = new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${sourceKey}`,
        Key: destinationKey,
      });

      await this.s3Client.send(command);
      logger.info(
        `File copied from ${sourceKey} to ${destinationKey} successfully in S3.`
      );
    } catch (error) {
      logger.error(
        `Error copying file from ${sourceKey} to ${destinationKey}:`,
        error
      );
      throw error;
    }
  }
}

export const bucketHelper = new BucketHelper();
