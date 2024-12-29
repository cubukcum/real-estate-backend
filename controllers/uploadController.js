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
        console.log('Received upload request');
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file;
        const projectId = req.body.project_id;

        if (!projectId) {
            return res.status(400).json({ error: 'Project ID is required' });
        }

        console.log('Uploading file:', file.originalname, 'for project:', projectId);

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

        console.log('Upload successful');
        res.json(imageData.rows[0]);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    uploadMiddleware: upload.single('image'),
    uploadImage
};