const express=require('express')
const router=express.Router();
const {getAllCVs,getCVById,createCV,downloadCV}=require('../Functions/CV.Function');
const {requireAdmin}=require('../MiddleWares/Auth.MiddleWare');
const {uploadCV}=require('../MiddleWares/CVUpload.MiddleWare');

router.get('/',(req,res)=>{
    return getAllCVs(res);
});
router.get('/category',(req,res)=>{
    return getCVById(req,res);
});
router.get('/:id/download',(req,res)=>{
    return downloadCV(req,res);
});
// Auth runs before the upload so unauthenticated requests never write files.
router.post('/',requireAdmin,uploadCV,(req,res)=>{
    return createCV(req,res);
})

module.exports=router;
