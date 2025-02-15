const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { r2Client, R2_BUCKET_NAME, R2_CUSTOM_DOMAIN } = require("../config/r2");
const crypto = require("crypto");
const path = require("path");

class UploadService {
  static generateKey(filename, projectId) {
    const uniqueId = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(filename);
    return `projects/${projectId}/${uniqueId}${ext}`;
  }

  static generatePublicUrl(fileKey) {
    return `https://${R2_CUSTOM_DOMAIN}/${fileKey}`;
  }

  static async generateSignedUrl(fileKey) {
    try {
      return await getSignedUrl(
        r2Client,
        new GetObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: fileKey,
        }),
        { expiresIn: 604800 } // 7 days
      );
    } catch (error) {
      console.error("Error generating signed URL:", error);
      throw error;
    }
  }

  static async uploadFile(file, projectId) {
    const fileKey = this.generateKey(file.originalname, projectId);

    try {
      // Upload to R2
      await r2Client.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: "public-read",
        })
      );

      // Generate public URL using custom domain
      const publicUrl = this.generatePublicUrl(fileKey);

      return {
        fileKey,
        fileName: file.originalname,
        fileSize: file.size,
        contentType: file.mimetype,
        url: publicUrl,
      };
    } catch (error) {
      console.error("Upload error details:", {
        error: error.message,
        stack: error.stack,
        fileInfo: {
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          projectId: projectId,
        },
        bucket: process.env.R2_BUCKET_NAME,
        fileKey: fileKey,
      });

      // Re-throw the error with more context
      throw new Error(
        `Failed to upload file ${file.originalname}: ${error.message}`
      );
    }
  }

  static async deleteFile(fileKey) {
    console.log("UploadService: Attempting to delete file:", fileKey);
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileKey,
      });
      console.log("UploadService: Delete command created:", {
        bucket: process.env.R2_BUCKET_NAME,
        key: fileKey,
      });

      const result = await r2Client.send(deleteCommand);
      console.log("UploadService: Delete successful:", result);
      return true;
    } catch (error) {
      console.error("UploadService: Delete error:", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

module.exports = UploadService;
