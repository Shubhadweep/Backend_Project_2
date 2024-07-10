const mongoose = require('mongoose');
const schema = mongoose.Schema;

const registrationSchema = new schema(
    {
        Full_Name:{
            type:String,
            required: true
        },
        Email:{
            type:String,
            required: true
        },
        Phone:{
            type:Number,
            required: true
        },
        Address:{
            type:String,
            required: true
        },
        State_Name:{
            type:String,
            required: true
        },
        Zip_Code:{
            type:Number,
            required: true
        },
        Password:{
            type:String,
            required: true
        },
        Date_of_Joining:{
            type: Date,
            required: true
        },
        Employee_Images:{
            type:[String],
            required: true
        }
    },
    {
        timeStamp:true,
        versionKey:false

    }
)

const regSystemSchema = new mongoose.model('details',registrationSchema);
module.exports = regSystemSchema;