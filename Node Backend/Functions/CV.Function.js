const path = require('path');
const mongoose = require('mongoose');
const CV=require('../Models/CV');
const { CV_DIR } = require('../MiddleWares/CVUpload.MiddleWare');
const { uploadBuffer, deleteAsset } = require('../Config/Cloudinary');

async function getAllCVs(res){
    const CVs=await CV.find();
    res.json(CVs);
}

//get specific cv
async function getCVById(req,res){
    const id=req.params.id;
    const myCV=await CV.findById(id);
    res.json(myCV);
}

// The uploaded file's first bytes must be the PDF signature, whatever the client claimed.
function hasPdfSignature(buffer){
    return Buffer.isBuffer(buffer) && buffer.toString('latin1', 0, 5) === '%PDF-';
}

// Display-only name: multer decodes names as latin1, strip any path and control characters.
function toDisplayName(originalName){
    const decoded = Buffer.from(originalName, 'latin1').toString('utf8');
    const base = path.basename(decoded).replace(/[\u0000-\u001f\u007f"\\/]/g, '').trim().slice(0, 150);
    return base.toLowerCase().endsWith('.pdf') ? base : `${base || 'cv'}.pdf`;
}

//admin add cv
async function createCV(req,res){
    const file = req.file;
    const { title, description } = req.body;

    if(!file) return res.status(400).json({ message: 'A PDF file is required' });
    if(!title || !description) return res.status(400).json({ message: 'Title and description are required' });
    if(!hasPdfSignature(file.buffer)) return res.status(400).json({ message: 'File is not a valid PDF' });

    let uploaded;
    try {
        uploaded = await uploadBuffer(file.buffer, { folder: 'portfolio/cvs', resourceType: 'raw' });
    } catch (err) {
        if(err.code === 'STORAGE_NOT_CONFIGURED') return res.status(503).json({ message: 'File storage is not configured' });
        console.error('CV upload failed:', err.message);
        return res.status(502).json({ message: 'File storage is unavailable. Please try again later.' });
    }

    try {
        const newCV = await CV.create({
            title,
            description,
            fileUrl: uploaded.url,
            filePublicId: uploaded.publicId,
            originalName: toDisplayName(file.originalname),
            mimeType: 'application/pdf',
            size: file.size,
        });
        res.status(201).json(newCV);
    } catch (err) {
        await deleteAsset(uploaded.publicId, 'raw');
        console.error('CV save failed:', err.message);
        res.status(500).json({ message: 'Failed to save the CV' });
    }
}

async function downloadCV(req,res){
    const { id } = req.params;
    if(!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'CV not found' });

    const cv = await CV.findById(id);
    if(!cv) return res.status(404).json({ message: 'CV not found' });

    const headers = { 'Content-Type': 'application/pdf', 'X-Content-Type-Options': 'nosniff' };

    if(cv.fileUrl){
        // Streamed through the API so the download keeps its original name and type.
        try {
            const upstream = await fetch(cv.fileUrl);
            if(!upstream.ok) return res.status(404).json({ message: 'CV file not found' });
            const name = encodeURIComponent(cv.originalName || 'cv.pdf');
            res.set({ ...headers, 'Content-Disposition': `attachment; filename="cv.pdf"; filename*=UTF-8''${name}` });
            return res.send(Buffer.from(await upstream.arrayBuffer()));
        } catch (err) {
            console.error('CV download failed:', err.message);
            return res.status(502).json({ message: 'File storage is unavailable. Please try again later.' });
        }
    }

    // Legacy CVs uploaded to local disk before Cloudinary.
    if(!cv.fileName) return res.status(404).json({ message: 'CV not found' });
    const filePath = path.join(CV_DIR, path.basename(cv.fileName));
    res.download(filePath, cv.originalName, { headers }, (err) => {
        if (err && !res.headersSent) res.status(404).json({ message: 'CV file not found' });
    });
}

module.exports={getAllCVs,getCVById,createCV,downloadCV}
