const mongoose = require('mongoose')
require('dotenv').config()

// User schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    profilePhoto: {
        type: String
    },
    status: {
        type: Boolean,
        default: true
    },
    refferalcode:{
        type:String
    },
    dripcoins:{
        type:Number,
        default:0
    },
    refferalRegister:{
        refferal:Boolean,
        refferedUser:String
    }
})

const userCollection = mongoose.model('users', userSchema)
module.exports = userCollection
