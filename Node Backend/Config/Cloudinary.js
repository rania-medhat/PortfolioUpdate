const { v2: cloudinary } = require('cloudinary');

function isConfigured() {
    return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

if (isConfigured()) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });
}

// Uploads an in-memory buffer; resolves { url (https), publicId }.
function uploadBuffer(buffer, { folder, resourceType = 'image' }) {
    if (!isConfigured()) {
        return Promise.reject(Object.assign(new Error('Cloudinary is not configured'), { code: 'STORAGE_NOT_CONFIGURED' }));
    }
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: resourceType, use_filename: false, unique_filename: true },
            (err, result) => {
                if (err || !result) return reject(Object.assign(err || new Error('Empty Cloudinary response'), { code: 'STORAGE_FAILED' }));
                resolve({ url: result.secure_url, publicId: result.public_id });
            }
        );
        stream.end(buffer);
    });
}

// Best-effort cleanup: never throws, only logs (no secrets in the message).
async function deleteAsset(publicId, resourceType = 'image') {
    if (!publicId || !isConfigured()) return false;
    try {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
        if (result.result !== 'ok' && result.result !== 'not found') {
            console.error(`Cloudinary cleanup of ${publicId} returned "${result.result}"`);
            return false;
        }
        return true;
    } catch (err) {
        console.error(`Cloudinary cleanup of ${publicId} failed:`, err.message);
        return false;
    }
}

module.exports = { isConfigured, uploadBuffer, deleteAsset };
