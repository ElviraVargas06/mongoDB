import { validationResult, body, param } from "express-validator";
import axios from "axios";

export const validationResultExpress = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    next();
};

export const paramLinkValidator = [
    param("id", "Formato no válido (expressValidator)")
        .trim()
        .notEmpty()
        .escape(),
    validationResultExpress,
];

export const bodyLinkValidator = [
    body("longLink", "formato link incorrecto")
        .trim()
        .notEmpty()
        .custom(async (value) => {
            try {
                if (!value.startsWith("https://")) {
                    value = "https://" + value;
                }
                await axios.get(value);
                return value;
            } catch (error) {
                // console.log(error);
                throw new Error("not found longlink 404");
            }
        }),
    validationResultExpress,
];

export const bodyRegisterValidator = [
    body("nombre", "El nombre no puede ir vacio")
        .trim()
        .notEmpty()
        .escape(),
    body("email", "El formato de email incorrecto")
        .trim()
        .isEmail()
        .normalizeEmail(),
    body("password", "La Contraseña debe tener Mínimo 6 carácteres").trim().isLength({ min: 6 }),
    body("password", "El formato de la contraseña incorrecta").custom(
        (value, { req }) => {
            if (value !== req.body.repassword) {
                throw new Error("Las contraseñas no coinciden");
            }
            return value;
        }
    ),
    validationResultExpress,
];

export const bodyLoginValidator = [
    body("email", "El formato de email incorrecto")
        .trim()
        .normalizeEmail(),
    body("password", "La Contraseña debe tener Mínimo 6 carácteres").trim().isLength({ min: 6 }),
    validationResultExpress,
];