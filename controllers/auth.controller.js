import  {User} from "../models/User.js"
import {VerificarOTP} from "../models/VerificarOTP.js"
import bcrypt from "bcryptjs"
import "dotenv/config"

import nodemailer from "nodemailer"

let transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.USERMAIL,
        pass: process.env.PASSEMAIL,
    },
});

transporter.verify((error, success)=>{
    if(error){
        console.log(error)
    }else{
        console.log("Ready for messages")
        console.log(success)
    }
})

export const register = async (req, res) => {

    let {nombre, email, password} = req.body

  
    
    if(nombre == "" || email == "" || password ==""){
        res.json({
            status: "FAILED",
            message: "Empty input fields!!!"
        })
    }else if(!/^[a-zA-Z]*$/.test(nombre)){
        res.json({
            status: "FAILED",
            message: "Invalid nombre entered",

        })
    }else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
        res.json({
            status: "FAILED",
            message: "Invalid email entered",
        })
    }else if(password.length < 8 ){
        res.json({
            status:"FAILED",
            message: "password too short!!",
        })
    }else{
        User.find({email})
            .then((result) =>{
            
                if(result.length){
                    res.json({
                        status: "FAILED",
                        message: "User with  thw provided email already exist",
                    })
                }else{
                    const saltRounds = 10;
                    bcrypt
                        .hash(password, saltRounds)
                        .then((hashedPassword)=>{
                            const newUser = new User ({
                                nombre, email, password:hashedPassword,
                                verified: false,

                            })

                            newUser
                                .save()
                                .then((result) =>{
                                    confirmarCuenta(result, res)
                                })
                                .catch((err)=>{
                                    console.log(err);
                                    res.json({
                                        status: "FAILED",
                                        message: "An error occurred while saving user account!"
                                    })
                                })
                        })

                        .catch((err) =>{
                            res.json({
                                status: "FAILED",
                                message: "An error occurred while hashing password!!",
                            })
                        })

                }
    })

    .catch((err)=>{
        console.log(err);
        res.json({
            status: "FAILED",
            message: "An error ocurred while checking for existing user!",
        })
    })
};

}

//Confirmar el OTP en una cuenta

export const confirmarCuenta = async ({_id, email},res) =>{
    
    try {

        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        

        const mailOptions = {
            
            from: '"Fred Foo 👻" <foo@example.com>',
            to: email,
            subject: "verifique cuenta de correo",
            html:  `<p>Enter <b>${otp}</b> in the app to  verify your 
                    email address and complete </p><p>This code <b> expires
                    in 1 hour</b>.</p>`,
            
        };

        const saltRounds = 10;

        const hashedOTP = await bcrypt.hash(otp, saltRounds)
        const newOTPVerification = await new VerificarOTP({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() +3600000,
        })

        await newOTPVerification.save();
        await transporter.sendMail(mailOptions);

        res.json({
            status: "PENDING",
            message: "Verification otp email sent",
            data:{
                userId: _id,
                email,
            }
        })

    }catch(error){
        res.json({
            status: "FAILED",
            message: error.message,
        })
    }
        
}


//Verificar el OTP enviado al correo

export const verifyOTP = async(req, res) =>{
    try {
       let{userId, otp} = req.body;
       if(!userId || !otp){
        throw Error("Empty otp details are not allowed")
       }else{
        const UserOTPVerificationRecords= await VerificarOTP.find({
            userId,
        })

        if(UserOTPVerificationRecords.length <= 0){
            throw new Error(
                "Account record doesnot exist or has been verified already. Please sign up or log in."
            )
        }else{

            const {expiresAt} = UserOTPVerificationRecords[0];
            const hashedOTP = UserOTPVerificationRecords[0].otp

            if(expiresAt < Date.now()){
                await verifyOTP.deleteMany({userId})
                throw new Error("Code has expired. Please request again.")
            
        }else{

            
            const validOTP = await bcrypt.compare(otp, hashedOTP)
            if(!validOTP){
                throw new Error("Invalid code passed. Check your inbox.")
            }else{
               await User.updateOne({_id:userId}, {verified: true})
               await VerificarOTP.deleteMany({userId})
               res.json({
                    status: "VERIFIED",
                    message: "User email verified successfull",
               })
            

            }
        }
        }
       }
    } catch (error) {
        res.json({
            status: "FAILED",
            message: error.message
        })
    }
}


// Verficar OTP cuando esté vencido y/o expirado el Código


export const resendOTPVerificationCode = async(req, res) =>{
    try{
        let{userId, email} = req.body;
        if(!userId || !email){
            throw Error("Empty user details are not allowed")
        }else{
            await VerificarOTP.deleteMany({userId})
            confirmarCuenta({_id: userId, email}, res)
        }
    }catch(error){
        res.json({
            status: "FAILED"
        })
    }
}
export const login = async (req, res)=>{
  
    let {email, password} = req.body
  
    
    if(email == "" || password ==""){
        res.json({
            status: "FAILED",
            message: "Empty credentials supplied!!!"
        })

    }else{
        User.find({email})
            .then(data =>{
                if(data.length){
                    const hashedPassword = data[0].password;
                    bcrypt.compare(password, hashedPassword).then(result =>{
                        if(result){
                            res.json({
                                status: "SUCCESS",
                                message: "Signin successful",
                                data: data
                            })
                        }else{
                            res.json({
                                status: "FAILED",
                                message: "Invalid password entered",
                            })
                        }
                    })
                    .catch(err =>{
                        res.json({
                            status: "FAILED",
                            message: "An error ocurred while comparing passwords",
                        })
                    })
                }else{
                    res.json({
                        status: "FAILED",
                        message: "Invalid credentials entered",
                    })
                }
            })

            .catch(err=>{
                res.json({
                    status: "FAILED",
                    message: "An error occurred while checking for existing user",
                })
            })
    }
    
}

export const refresh = (req, res) => {
    try {
        const { token, expiresIn } = generateToken(req.uid);
        return res.json({ token, expiresIn });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Error de Servidor favor comunicarse con el Administrador" });
    }
};


export const validarTokenUsuario = async (req, res = response ) => {

    // Generar el JWT
    const token = await generateToken( req.uid);
    
    res.json({
        usuario: req.usuario,
        token: token,
    })

}

export const infoUser = async (req, res) => {
try {
    const user = await User.findById(req.uid).lean();
    delete user.password;
    return res.json({ user });
} catch (error) {
    console.log(error);
    return res.status(403).json({ error: error.message });
}
};




export const logout = (req, res) => {
res.clearCookie("validarJWT");
return res.json({ msg: true });
};


 

