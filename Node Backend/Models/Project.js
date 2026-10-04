const mongoose=require('mongoose');

const projectSchema=new mongoose.Schema({
    title:String,
    link:String,
    image:String,
    // Cloudinary public_id; optional so projects created before Cloudinary keep working.
    imagePublicId:{
        type:String,
        required:false
    },
    category:{
        type:String,
        enum:['React','Angular','ASP.Net','Node.js','MEAN Stack']
    }
})

const projectModel=mongoose.model('Projects',projectSchema);

module.exports=projectModel;