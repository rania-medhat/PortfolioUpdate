const express=require('express');
const router=express.Router();
const {getProjects,addProject,updateProject,getProjectByCategory,deleteProject}=require('../Functions/Project.Function');
const {uploadProjectImage}=require('../MiddleWares/Upload.MiddleWare');
const {requireAdmin}=require('../MiddleWares/Auth.MiddleWare');

router.get('/',(req,res)=>{
    return getProjects(req,res);
});

router.get('/:category',(req,res)=>{
    return getProjectByCategory(req,res);
});

router.post('/',requireAdmin,uploadProjectImage,(req,res)=>{
    return addProject(req,res);
})

router.put('/:id',requireAdmin,uploadProjectImage,(req,res)=>{
    return updateProject(req,res);
})

router.delete('/:title',requireAdmin,(req,res)=>{
    return deleteProject(req,res);
})

module.exports=router;
