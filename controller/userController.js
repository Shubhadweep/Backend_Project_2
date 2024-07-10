const systemModel = require('../model/signupLoginModel');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const Path = require('path');

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host:'smtp',
    port:465,
    secure:false,
    requireTLS:true,
    service:'gmail',
    auth:{
        user:'rohanslife1202@gmail.com',
        pass:'ifyq bscp rxrh xdsv'
    }
});

const getRegForm = (req,res)=>{
    // Use of flash for existing Email-Id:
    let existEmailSms = req.flash("error");
    //console.log("The Sms collected for existing Email ",existEmailSms);
    let errorEmail;
    if(existEmailSms.length > 0){
        errorEmail = existEmailSms[0];
    }else{
        errorEmail = null;
    }
    res.render("User/regForm",{
        title: 'Signup Page',
        errorSms : errorEmail
    })
}
const getLoginForm = async(req,res)=>{
    //Use of flash for Invalid Email:
    let errEmail = req.flash('error1');
    // console.log("The flash error sms for email: ",errEmail);
    let errSms = (errEmail.length > 0?errEmail[0]:null);
   
    // Use of flash for Invalid Password:
    let errPassword = req.flash('error2');
    // console.log("The error sms for password ",errPassword);
    let errorSms;
    if(errPassword.length > 0){
        errorSms = errPassword[0];
    }else{
        errorSms = null;
    }
    
    res.render("User/login",{
        title:'Login Page',
        errEmailSms : errSms,
        errPasswordSms : errorSms
    })
}

const getDashboard = async(req,res)=>{
    let id = req.session.user._id;
    console.log("The id collected from the Session collection: ",id);
    let loginUser = await systemModel.findById({_id:id});
    console.log("The login User Details collected from sessionl: ",loginUser);
    res.render("User/dashBoard",{
        title:"DashBoard",
        data:loginUser
    })
}

const regPost = async(req,res)=>{
    try{
        //console.log("The User value collected from the Registration Form: ",req.body,req.files);
        let emailId = req.body.email;
        let existMail = await systemModel.findOne({Email:emailId});

    if(existMail){
        console.log("This mail Id is Already exist");
        req.flash("error","Someone else has already registered with this Email-Id");
        res.redirect("/Registration");

    }else{
        
    let imageArray = req.files.map(value=>{
        return value.originalname;
    })

    let hashPassword = await bcrypt.hash(req.body.password,12);
    console.log("The Genearted hash Password is: ",hashPassword);
    

    let registrationData = new systemModel({
        
        Full_Name: req.body.fullname,
        Email: req.body.email,
        Phone: req.body.phone,
        Address: req.body.address,
        State_Name: req.body.stateName,
        Zip_Code: req.body.zipCode,
        Password: hashPassword,
        Date_of_Joining: req.body.date,
        Employee_Images: imageArray

    })
    let savedata = await registrationData.save();
    if(savedata){
        console.log("The Data is Saved Successfully into the database");
        // Sending Mails: 
        let mailOptions = {
            from:'rohanslife1202@gmail.com',
            to:req.body.email,
            subject:"Successfull registration",
            text:"Hellow "+ req.body.fullname+'\n\n'+
            "You have successfully Registered with us"+"\n\n Thank you\n"
        }
        
      transporter.sendMail(mailOptions,function(error,info){
      if(error){
        console.log("Error in sending Mail ",error);
        res.redirect("/Registration");
      }else{
        console.log("Your Mail has been send Successfully ",info.response);
        res.redirect("/Login");
      }
   })
        
}
 }
    }catch(error){
        console.log("Failed to Save data into the Database ",error);
    }
}

const loginPost = async(req,res)=>{

    try{
        console.log("The Data collected from the login Form: ",req.body);
    let existMail = await systemModel.findOne({Email:req.body.email});
    if(!existMail){
        console.log("Invalid Email-Id");
        req.flash('error1','Invalid or Incorrect Email-Id');
        res.redirect("/Login");
    }else{
        console.log("The Existing User Details: ",existMail);
        let comparePassword = await bcrypt.compare(req.body.password,existMail.Password);
        if(comparePassword){
            req.session.userIsloggedin = true;
            req.session.user = existMail;
            await req.session.save((error)=>{
                if(error){
                    console.log("Session data Saving Error",error);
                }else{
                    console.log("Session data saved Successfully");
                    console.log("Login Successfull");
                    res.redirect("/DashBoard");
                }
            })
        }else{
            console.log("Incorrect Password");
            req.flash("error2","Incorrect or Wrong Password");
            res.redirect("/Login");
        }
    }

    }catch(error){
        console.log("Failed to Login ",error);
    }
    

}

const logOut = async(req,res)=>{
    await req.session.destroy();
    res.redirect("/Login");
}

const deleteDetails = async(req,res)=>{
    try{
        let id = req.params.id;
        console.log("The Id collected for Delete: ",id);
        let deleteValue = await systemModel.findOneAndDelete({_id:id});
        req.session.destroy();
        if(deleteValue){
        deleteValue.Employee_Images.forEach(userPics => {
            fs.unlinkSync(Path.join(__dirname,"..","uploads","RegistrationImg",userPics));
        });
       res.redirect("/showDeleteMessage");
      }

    }catch(error){
        console.log("Failed to delete User Details ",error);

    }
}

const viewEditPage = async(req,res)=>{
    try{
        let id = req.params.id;
        console.log("The Id collected for Edit from Params: ",id);
        let oldData = await systemModel.findById({_id:id});
    if(oldData){
        //console.log("The old data collected for update: ",oldData);
        res.render("User/editPage",{
            title:'Edit Page',
            data:oldData
        })
    }
    }catch(error){
        console.log("Failed to fetch old data for update",error);
    }
}

const editDetails = async (req,res)=>{
    try{
        //console.log("The details collected for Edit: ",req.body,req.files);
        let id = req.body.id;
        let newArrImage = req.files.map(value=>{return value.originalname});
        console.log("Images as array format for Edit: ",newArrImage);

       let updated_Full_Name= req.body.fullname;
       let updated_Email = req.body.email;
       let updated_Phone = req.body.phone;
       let updated_Address= req.body.address;
       let updated_State_Name= req.body.stateName;
       let updated_Zip_Code= req.body.zipCode;

       let userData = await systemModel.findById({_id:id});
       console.log("The data that needs to be Edited: ",userData);
       userData.Full_Name = updated_Full_Name;
       userData.Email = updated_Email;
       userData.Phone = updated_Phone;
       userData.Address = updated_Address;

       if(req.body.stateName ==="Select"){
        userData.State_Name = userData.State_Name;
       }else{
        userData.State_Name = updated_State_Name;
       }
       
       userData.Zip_Code = updated_Zip_Code;
       //userData.Employee_Images = newArrImage;
       if(req.files.length > 0){
        userData.Employee_Images = newArrImage;
       }else{
        userData.Employee_Images = userData.Employee_Images;
       }
       

       let saveData = await userData.save();
       if(saveData){
        console.log("Edited new data is Successfully Saved ",saveData);
        res.redirect("/DashBoard");
       }
    }catch(error){
         console.log("error for edit",error);
    }   
}
const showDeleteMessage = (req,res)=>{
    res.render("User/deleteSms",{
        title:'Delete Successful'
    });
}


module.exports = {getRegForm,regPost,getLoginForm,loginPost,getDashboard,logOut,deleteDetails,viewEditPage,editDetails,showDeleteMessage};