import { Router } from "express";
import { body } from "express-validator";
import {
    
    login,
    logout,    
    register,
    confirmarCuenta,    
    resendOTPVerificationCode,
    verifyOTP
    
} from "../controllers/auth.controller.js";

import {
    bodyLoginValidator,
    bodyRegisterValidator,
} from "../middlewares/validatorManager.js";

const router = Router();

router.post("/register", bodyRegisterValidator, register);
router.get("/confirmarCuenta", confirmarCuenta);
router.post("/verifyOTP", verifyOTP);
router.post("/resendOTPVerificationCode", resendOTPVerificationCode);
router.post("/login", bodyLoginValidator, login);
router.get("/logout", logout);




export default router;