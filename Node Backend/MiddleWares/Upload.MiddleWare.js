const multer=require('multer');
const path=require('path');

const MB=1024*1024;
const MAX_IMAGE_SIZE=5*MB;
const ALLOWED={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp'};

const filterExtention=(req,file,cb)=>{
    const extention=path.extname(file.originalname).toLowerCase();
    if(ALLOWED[extention]===file.mimetype) return cb(null,true);
    cb(Object.assign(new Error('Only JPG, PNG and WebP images are allowed.'),{code:'BAD_IMAGE_TYPE'}));
}

// Files are kept in memory and streamed to Cloudinary; nothing is written to local disk.
const upload=multer({
    storage:multer.memoryStorage(),
    fileFilter:filterExtention,
    limits:{fileSize:MAX_IMAGE_SIZE,files:1}
});

// The real content must match an image signature, whatever the client claimed.
function hasImageSignature(buf){
    if(!buf||buf.length<12) return false;
    const jpeg=buf[0]===0xff&&buf[1]===0xd8&&buf[2]===0xff;
    const png=buf.subarray(0,8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]));
    const webp=buf.toString('latin1',0,4)==='RIFF'&&buf.toString('latin1',8,12)==='WEBP';
    return jpeg||png||webp;
}

// Wraps multer so upload errors become 400/413 JSON responses. The image is optional here;
// handlers decide whether it is required.
function uploadProjectImage(req,res,next){
    upload.single('img')(req,res,(err)=>{
        if(err){
            if(err.code==='LIMIT_FILE_SIZE') return res.status(413).json({message:'Image must be 5 MB or smaller.'});
            if(err.code==='BAD_IMAGE_TYPE') return res.status(400).json({message:err.message});
            return res.status(400).json({message:'Invalid upload request.'});
        }
        if(req.file&&!hasImageSignature(req.file.buffer)){
            return res.status(400).json({message:'Only JPG, PNG and WebP images are allowed.'});
        }
        next();
    });
}

module.exports={uploadProjectImage};
