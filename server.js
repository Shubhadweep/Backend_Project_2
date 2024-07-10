require('dotenv').config();
const express = require('express');
const userRouter = require('./router/userRoute');
const server = express();
const momgoose = require('mongoose');
const Path = require('path');
const systemModel = require('./model/signupLoginModel');
const port = process.env.PORT || 5700;
const flash = require('connect-flash');
//Session Work
const session = require('express-session');
const mongodb_Session = require('connect-mongodb-session')(session);


server.set('view engine','ejs');
server.set('views','view');

server.use(express.urlencoded({extended:true}));
server.use(express.static(Path.join(__dirname,'public')));
server.use(express.static(Path.join(__dirname,'uploads')));  
// use flash:
server.use(flash()); 
//Set Session
const session_Store = new mongodb_Session({
    uri: process.env.DATABASE_URL,
    collection : "Employee_Session"
})

// Use Session
server.use(session({
    secret:'project-secret-key',
    resave:false,
    saveUninitialized:false,
    store: session_Store
}))

server.use(async(req,res,next)=>{
    if(!req.session.user){
        return next();
    }
    let userValue = await systemModel.findById(req.session.user._id);
    if(userValue){
        req.user = userValue;
        next();
    }else{
        console.log("User Not found");
    }
})


server.use(userRouter);
momgoose.connect(process.env.DATABASE_URL)
.then(()=>{
    console.log("Database Connection is Successful");
    server.listen(port,()=>{
        console.log(`The server is Running at ${port}`);
    })
}).catch((error)=>{
    console.log("Failed to Connect With the Mongodb Database ",error);
})



