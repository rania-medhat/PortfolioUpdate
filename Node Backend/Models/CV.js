const mongoose=require('mongoose');

const CVSchema=new mongoose.Schema({
    title:String,
    description:String,
    // Legacy link-based CVs only; new CVs are stored as uploaded PDFs.
    url:String,
    // Cloudinary (raw) asset for new CVs; fileName is the legacy local file.
    fileUrl:String,
    filePublicId:String,
    fileName:String,
    originalName:String,
    mimeType:String,
    size:Number,
    createdAt:{
        type:Date,
        default:Date.now
    }
})

const CVModel=mongoose.model('CV',CVSchema);

module.exports=CVModel;
