import { Router } from "express";
import { body } from "express-validator";
import {
    infoUser,
    login,
    logout,
    refresh,
    register,
    confirmarCuenta,
    validarTokenUsuario,
    resendOTPVerificationCode,
    verifyOTP
    
} from "../controllers/auth.controller.js";
import { requireRefreshToken } from "../middlewares/requireRefreshToken.js";
import { requireToken } from "../middlewares/requireToken.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
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
router.get("/refresh", requireRefreshToken, refresh);
router.get("/validarJWT", validarTokenUsuario, validarJWT);
router.get("/logout", logout);


router.get("/protected", requireToken, infoUser);

export default router;