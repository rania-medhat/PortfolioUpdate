const router = require("express").Router();
const {createMessage,getMessages} = require("../Functions/Contact.Function");
const {requireAdmin} = require("../MiddleWares/Auth.MiddleWare");

router.post("/", (req,res)=>{
    return createMessage(req,res);
});

router.get('/',requireAdmin,(req,res)=>{
    return getMessages(res);
});

module.exports = router;
