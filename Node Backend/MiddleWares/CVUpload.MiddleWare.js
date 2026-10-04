const multer = require('multer');
const path = require('path');

// Legacy CVs uploaded before Cloudinary are still served from here (read-only).
const CV_DIR = path.join(__dirname, '..', 'uploads', 'cvs');
const MAX_CV_SIZE = 5 * 1024 * 1024;

// Kept in memory and streamed to Cloudinary; nothing is written to local disk.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const isPdf = file.mimetype === 'application/pdf' && path.extname(file.originalname).toLowerCase() === '.pdf';
    if (isPdf) return cb(null, true);
    cb(Object.assign(new Error('Only PDF files are allowed'), { code: 'NOT_PDF' }));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_CV_SIZE, files: 1 } });

// Wraps multer so upload errors become 400/413 JSON responses.
function uploadCV(req, res, next) {
    upload.single('cvFile')(req, res, (err) => {
        if (!err) return next();
        if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ message: 'PDF must be 5 MB or smaller' });
        res.status(400).json({ message: err.code === 'NOT_PDF' ? err.message : 'Invalid CV upload' });
    });
}

module.exports = { uploadCV, CV_DIR };
