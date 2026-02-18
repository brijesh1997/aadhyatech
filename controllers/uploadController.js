const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config/s3');
const multer = require('multer');
const path = require('path');

// Configure Multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed (jpeg, jpg, png, webp)'));
    }
});

exports.uploadLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file;
        const fileName = `logos/${Date.now()}_${path.basename(file.originalname)}`;

        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            // ACL: 'public-read' // Uncomment if bucket is not public by policy, but standard practice effectively uses bucket policies
        };

        await s3.send(new PutObjectCommand(uploadParams));

        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

        res.json({ url: fileUrl });

    } catch (error) {
        console.error('S3 Upload Error:', error);
        res.status(500).json({ error: 'Failed to upload logo', details: error.message });
    }
};

exports.uploadMiddleware = upload.single('logo');
