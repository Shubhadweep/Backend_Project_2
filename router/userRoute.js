const express = require('express');
const route = express.Router();
const {getRegForm ,regPost,getLoginForm,loginPost,getDashboard,logOut,deleteDetails,viewEditPage,editDetails,showDeleteMessage} = require('../controller/userController');

const multer = require('multer');
const Path = require('path');

// Multer Storage Setup:
const fileStorage = multer.diskStorage({
    destination: (req,file,callback)=>{
        callback(null,Path.join(__dirname,'..','uploads','RegistrationImg'),(error,data)=>{
            if(error) throw error
        });
    },
    filename:(req,file,callback)=>{
        callback(null,file.originalname,(error,data)=>{
            if(error) throw error
        });
    }
});

// Multer Image filter Setup:
const fileFilter = (req,file,callback)=>{
    if(
        file.mimetype.includes("jpg") ||
        file.mimetype.includes("png") ||
        file.mimetype.includes("jpeg") ||
        file.mimetype.includes("webp")
    ){
        callback(null,true);

    }else{
        callback(null,false);

    }
}

const upload = multer({
    storage:fileStorage,
    fileFilter:fileFilter,
    limits:{fieldSize:1024*1024*5},
})

const upload_type = upload.array('emp_Images',3);


route.get("/Registration",getRegForm);
route.post("/RegPost",upload_type,regPost);
route.get("/Login",getLoginForm);
route.post("/postLogin",loginPost);
route.get("/DashBoard",getDashboard);
route.get("/logout",logOut);
route.get("/deleteUserData/:id",deleteDetails);
route.get("/showDeleteMessage",showDeleteMessage);
route.get("/viewEditDetails/:id",viewEditPage);
route.post("/editPost",upload_type,editDetails);



module.exports = route;