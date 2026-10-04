const Contact=require('../Models/Contact');

//admin message creation
async function createMessage(req,res){
    const messageData=req.body;
    const newMessage=await Contact.create(messageData);
    res.json({success:true});
}
async function getMessages(res){
   
    const Messages=await Contact.find();
    res.json(Messages);
}


module.exports={createMessage,getMessages};