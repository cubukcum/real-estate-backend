const UploadService = require('../services/uploadService');
const multer = require('multer');
const db = require('../db');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

const uploadImage = async (req, res) => {
    try {
        const file = req.file;
        const projectId = req.body.project_id;

        // Upload to R2
        const uploadResult = await UploadService.uploadFile(file, projectId);

        // Save to database
        const imageData = await db.query(
            `INSERT INTO project_images 
             (project_id, file_key, file_name, file_size, content_type, url)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
                projectId,
                uploadResult.fileKey,
                uploadResult.fileName,
                uploadResult.fileSize,
                uploadResult.contentType,
                uploadResult.url
            ]
        );

        res.json(imageData.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    uploadMiddleware: upload.single('image'),
    uploadImage
};