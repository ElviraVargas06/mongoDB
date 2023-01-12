import bcryptjs from "bcryptjs"
import mongoose from "mongoose"


const userSchema = new mongoose.Schema({

    nombre:{
        type: String,
        required: true,
            
    },

    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        index: {unique: true}   

    },
    password:{
        type: String,
        required: true
    },


    verified: {
        type: Boolean,
        default: false,
        required: true
    },

    
})

export const User = mongoose.model("User", userSchema)