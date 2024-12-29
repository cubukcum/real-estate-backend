const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { r2Client, R2_BUCKET_NAME } = require('../config/r2');
const crypto = require('crypto');
const path = require('path');

class UploadService {
    static generateKey(filename, projectId) {
        const uniqueId = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(filename);
        return `projects/${projectId}/${uniqueId}${ext}`;
    }

    static async uploadFile(file, projectId) {
        const fileKey = this.generateKey(file.originalname, projectId);
        
        try {
            // Upload to R2
            await r2Client.send(new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: fileKey,
                Body: file.buffer,
                ContentType: file.mimetype,
            }));

            // Generate signed URL (valid for 7 days)
            const signedUrl = await getSignedUrl(
                r2Client,
                new GetObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME,
                    Key: fileKey,
                }),
                { expiresIn: 604800 } // 7 days in seconds
            );

            return {
                fileKey,
                fileName: file.originalname,
                fileSize: file.size,
                contentType: file.mimetype,
                url: signedUrl
            };
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }
}

module.exports = UploadService;