
import mongoose from "mongoose"


const VerificarOTPSchema = new mongoose.Schema({
    userId: {
        type: String,

    },

    otp: {
        type: String,
        required: true,
    },

    createdAt: {
        type: Date,
      
    } ,
    
    expiresAt:{
        type: Date,
    }

    
})

export const VerificarOTP = mongoose.model("VerificarOTP", VerificarOTPSchema)