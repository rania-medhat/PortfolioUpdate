//npm init -y
//npm install express
//mongod
//npm i express mongoose
//npm i nodemon
//npm start
const fs=require('fs');
const path=require('path')
const envFile=path.join(__dirname,'.env');
if(fs.existsSync(envFile)) process.loadEnvFile(envFile);

const express=require('express');
const {cookieSameSite}=require('./MiddleWares/Auth.MiddleWare');
const mongoose=require('mongoose');
const projectRoutes=require('./APIRoutes/Project.Routes');
const CVRoutes=require('./APIRoutes/CV.Routes');
const contactRoutes=require('./APIRoutes/Contact.Routes');
const authRoutes=require('./APIRoutes/Auth.Routes');
const cors = require('cors');

for(const name of ['SESSION_SECRET','ADMIN_EMAIL','GOOGLE_CLIENT_ID']){
    if(!process.env[name]) console.warn(`Warning: ${name} is not set — admin login will not work.`);
}
if(process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_ID.endsWith('.apps.googleusercontent.com')){
    console.warn('Warning: GOOGLE_CLIENT_ID does not look like a Google OAuth Web client ID.');
}

cookieSameSite(); // fail fast on an invalid COOKIE_SAME_SITE
const app=express();
const port=process.env.PORT || 8000;
// In production the API sits behind Nginx; HOST=127.0.0.1 keeps it off the public interface.
const host=process.env.HOST || undefined;
app.listen(port, host, () => console.log("Server running"));

app.use(express.json());
// Credentials (the admin session cookie) require an explicit origin instead of "*".
const isProduction=process.env.NODE_ENV==='production';
const allowedOrigins=(process.env.CLIENT_ORIGIN||'http://localhost:4200').split(',').map(o=>o.trim().replace(/\/$/,'')).filter(Boolean);
app.use(cors({
    origin:(origin,cb)=>{
        // No Origin header: same-origin or non-browser clients.
        if(!origin||allowedOrigins.includes(origin)) return cb(null,true);
        if(!isProduction&&/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null,true);
        cb(null,false);
    },
    credentials:true
}));

// Legacy local images only; new uploads live on Cloudinary. CV PDFs are only served through /api/cvs/:id/download.
app.use('/uploads/cvs', (req,res)=>res.sendStatus(404));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth',authRoutes);
app.use('/api/projects',projectRoutes);
app.use('/api/cvs',CVRoutes);
app.use("/api/messages",contactRoutes);

// JSON error responses without stack traces or internals.
app.use((err,req,res,next)=>{
    if(res.headersSent) return next(err);
    if(err.type==='entity.parse.failed') return res.status(400).json({message:'Malformed request body.'});
    console.error(err.message);
    res.status(500).json({message:'Internal server error.'});
});

const mongoUri=process.env.MONGO_URI || (isProduction?undefined:'mongodb://localhost:27017/portfolio');
if(!mongoUri){
    console.error('MONGO_URI environment variable is required in production');
    process.exit(1);
}
mongoose.connect(mongoUri)
.then(()=>console.log("mongo connected"))
.catch(err=>{
    console.error('MongoDB connection failed:',err.message);
    process.exit(1);
});

for(const name of ['CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET']){
    if(!process.env[name]) console.warn(`Warning: ${name} is not set — uploads will fail.`);
}
