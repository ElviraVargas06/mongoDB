import { User } from "../models/User.js";
import { VerificarOTP } from "../models/VerificarOTP.js";
import bcryptjs from "bcryptjs";

import {
  generateToken,
  generateRefreshToken,
  generateOTP,
} from "../utils/tokenManager.js";
import {
  createTrans,
  generateEmailTemplate,
  confirmacionEmailTemplate,
} from "../utils/mail.js";

export const register = async (req, res) => {
  let { nombre, email, password } = req.body;

  if (nombre == "" || email == "" || password == "") {
    res.json({
      status: "FAILED",
      message: "Los campos se encuentran vacio!!!",
    });
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    res.json({
      status: "FAILED",
      message: "Correo electrónico ingresado es invalido",
    });
  } else if (password.length < 6) {
    res.json({
      status: "FAILED",
      message: "La contraseña debe ser mayor a 6 caracteres!!",
    });
  } else {
    User.find({ email })
      .then((result) => {
        if (result.length) {
          res.json({
            status: "FAILED",
            message:
              "El usuario con el correo electrónico proporcionado ya existe",
          });
        } else {
          const saltRounds = 10;
          bcryptjs
            .hash(password, saltRounds)
            .then((hashedPassword) => {
              const newUser = new User({
                nombre,
                email,
                password: hashedPassword,
                verified: false,
              });

              newUser
                .save()
                .then((result) => {
                  confirmarCuenta(result, res);
                })
                .catch((err) => {
                  console.log(err);
                  res.json({
                    status: "FAILED",
                    message:
                      "Ocurrió un error al momento de guardar la cuenta de usuario!",
                  });
                });
            })

            .catch((err) => {
              res.json({
                status: "FAILED",
                message:
                  "Ocurrió un error al momento de codificar la contraseña!!",
              });
            });
        }
      })

      .catch((err) => {
        console.log(err);
        res.json({
          status: "FAILED",
          message: "Ocurrió un error al verificar el usuario existente!",
        });
      });
  }
};

//Confirmar el OTP en una cuenta

export const confirmarCuenta = async ({ _id, email }, res) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const mailOptions = {
      from: '"Fred Foo 👻" <foo@example.com>',
      to: email,
      subject: "verifique cuenta de correo",
      html: `<p>Enter <b>${otp}</b> in the app to  verify your 
                    email address and complete </p><p>This code <b> expires
                    in 1 hour</b>.</p>`,
    };

    const saltRounds = 10;

    const hashedOTP = await bcrypt.hash(otp, saltRounds);
    const newOTPVerification = await new VerificarOTP({
      userId: _id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });

    await newOTPVerification.save();
    await transporter.sendMail(mailOptions);

    res.json({
      status: "PENDING",
      message: "El código OTP fue enviado a su correo electronico!!",
      data: {
        userId: _id,
        email,
      },
    });
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
};

//Verificar el OTP enviado al correo

export const verifyOTP = async (req, res) => {
  const { otp } = req.body;
  try {
    if (!otp)
      return res
        .status(403)
        .json({ message: "Lo sentimos, El código OTP no puede ir vacio" });

    const user = await User.findOne({ otp });

    if (!user)
      return res
        .status(403)
        .json({ message: "Lo sentimos, No existe este Usuario" });

    //Actualiza el usuario e indica que ya se encuentra confirmada la cuenta
    await user.update({ verified: true });

    // Borra el otp porque ya se confirmó el codigó
    user.otp = null;

    await user.save();

    //Enviar correo electronico la confirmacion de la cuenta al registrar el OTP

    const transporter = createTrans();
    await transporter.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>',
      to: user.email,
      subject: "verifique cuenta de correo",
      html: confirmacionEmailTemplate(
        "Correo verificado exitosamente!!!",
        "Gracias por hacer parte de nosotros"
      ),
    });

    return res.json({ message: "Cuenta Verificada puede iniciar sesion" });
  } catch (error) {
    return res.json({ msg: error.message });
  }
};

// Verficar OTP cuando esté vencido y/o expirado el Código

export const resendOTPVerificationCode = async (req, res) => {
  try {
    let { userId, email } = req.body;
    if (!userId || !email) {
      throw Error("El código OTP no puede ir vacio!!!");
    } else {
      await VerificarOTP.deleteMany({ userId });
      confirmarCuenta({ _id: userId, email }, res);
    }
  } catch (error) {
    res.json({
      status: "FAILED",
    });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({
        message:
          "El Correo y/o Contraseña no se encuentra en la Base de Datos...!",
      });

    if (!user.verified)
      return res.status(403).json({
        message: "Favor confirmar su cuenta para poder ingresar al sistema!!",
      });
    const validPass = await bcryptjs.compareSync(password, user.password);
    if (!validPass)
      return res.status(404).json({
        message:
          "El Correo y/o Contraseña no se encuentra en la Base de Datos...!",
      });

    //Generar el token JWT
    const { token, expiresIn } = generateToken(user.id);
    generateRefreshToken(user.id, res);

    return res.json({
      status: "VERIFIED",
      message: "Ha ingresado a su cuenta exitosamente",
      user,
      token,
      expiresIn,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Error de Servidor favor comunicarse con el Administrador",
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie("validarJWT");
  return res.json({ msg: true });
};
