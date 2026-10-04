
const mongoose=require('mongoose');
const Project=require('../Models/Project');
const {uploadBuffer,deleteAsset}=require('../Config/Cloudinary');

const IMAGE_FOLDER='portfolio/projects';

//get projects and filter
async function getProjects(req,res){
    const Category=req.query.category;
    const Projects=Category?
    await Project.find({ category:Category}):
    await Project.find();
    res.json(Projects);
}

async function getProjectByCategory(req,res){
    const category=req.params.category;
    const project=await Project.find({category:category});
    res.json(project);
}

function sendUploadError(res,err){
    if(err.code==='STORAGE_NOT_CONFIGURED') return res.status(503).json({message:'Image storage is not configured.'});
    console.error('Image upload failed:',err.message);
    return res.status(502).json({message:'Image storage is unavailable. Please try again later.'});
}

function sendValidationOrServerError(res,err,fallback){
    if(err instanceof mongoose.Error.ValidationError) return res.status(400).json({message:'Invalid project data.'});
    console.error(fallback,err.message);
    return res.status(500).json({message:fallback});
}

//admin add project
async function addProject(req,res){
    const {title,category,link}=req.body;
    if(!title||!category||!link) return res.status(400).json({message:'Title, category and link are required.'});
    if(!req.file) return res.status(400).json({message:'A project image is required.'});

    let uploaded;
    try{
        uploaded=await uploadBuffer(req.file.buffer,{folder:IMAGE_FOLDER});
    }catch(err){
        return sendUploadError(res,err);
    }

    try{
        const newProject=await Project.create({title,category,link,image:uploaded.url,imagePublicId:uploaded.publicId});
        res.status(201).json(newProject);
    }catch(err){
        // Don't leave an orphan file behind when the record could not be saved.
        await deleteAsset(uploaded.publicId);
        sendValidationOrServerError(res,err,'Failed to save the project.');
    }
}

//admin update project; the image is replaced only when a new file is sent
async function updateProject(req,res){
    const {id}=req.params;
    if(!mongoose.isValidObjectId(id)) return res.status(400).json({message:'Invalid project id.'});

    let project;
    try{
        project=await Project.findById(id);
    }catch(err){
        return sendValidationOrServerError(res,err,'Failed to load the project.');
    }
    if(!project) return res.status(404).json({message:'Project not found.'});

    const {title,category,link}=req.body;
    if(title!==undefined) project.title=title;
    if(category!==undefined) project.category=category;
    if(link!==undefined) project.link=link;

    const oldPublicId=project.imagePublicId;
    let uploaded;
    if(req.file){
        try{
            uploaded=await uploadBuffer(req.file.buffer,{folder:IMAGE_FOLDER});
        }catch(err){
            return sendUploadError(res,err);
        }
        project.image=uploaded.url;
        project.imagePublicId=uploaded.publicId;
    }

    try{
        await project.save();
    }catch(err){
        if(uploaded) await deleteAsset(uploaded.publicId);
        return sendValidationOrServerError(res,err,'Failed to update the project.');
    }

    // The old image is removed only after the new one is uploaded and saved.
    if(uploaded&&oldPublicId) await deleteAsset(oldPublicId);
    res.json(project);
}

// Accepts a project title (existing contract) or an ObjectId.
async function deleteProject(req,res){
    const key=req.params.title;
    let project;
    try{
        project=mongoose.isValidObjectId(key)
            ?await Project.findByIdAndDelete(key)
            :await Project.findOneAndDelete({title:key});
    }catch(err){
        return sendValidationOrServerError(res,err,'Failed to delete the project.');
    }
    if(!project) return res.status(404).json({message:'Project not found.'});

    // A failed cleanup is logged by deleteAsset and must not fail the request.
    await deleteAsset(project.imagePublicId);
    res.status(200).json({deletedCount:1});
}

module.exports={getProjects,addProject,updateProject,getProjectByCategory,deleteProject};
