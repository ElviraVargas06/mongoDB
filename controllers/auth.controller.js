import { User } from "../models/User.js";
import { VerificarOTP } from "../models/VerificarOTP.js";
import bcrypt from "bcryptjs";
import "dotenv/config";

import nodemailer from "nodemailer";

let transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.USERMAIL,
    pass: process.env.PASSEMAIL,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready for messages");
    console.log(success);
  }
});

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
          bcrypt
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
  try {
    let { userId, otp } = req.body;
    if (!userId || !otp) {
      throw Error("El código OTP no puede ir vacio!!!");
    } else {
      const UserOTPVerificationRecords = await VerificarOTP.find({
        userId,
      });

      if (UserOTPVerificationRecords.length <= 0) {
        throw new Error(
          "El registro de la cuenta no existe y/o ya ha sido verificado. favor registrese o inicie sesión"
        );
      } else {
        const { expiresAt } = UserOTPVerificationRecords[0];
        const hashedOTP = UserOTPVerificationRecords[0].otp;

        if (expiresAt < Date.now()) {
          await verifyOTP.deleteMany({ userId });
          throw new Error(
            "El código ha caducado. Por favor solicite uno nuevo."
          );
        } else {
          const validOTP = await bcrypt.compare(otp, hashedOTP);
          if (!validOTP) {
            throw new Error(
              "El Código OTP es invalido, favor verificar su correo electronico."
            );
          } else {
            await User.updateOne({ _id: userId }, { verified: true });
            await VerificarOTP.deleteMany({ userId });

            res.json({
              status: "VERIFIED",
              message: "Correo electronico del usuario verificado exitosamente",
            });
          }
        }
      }
    }
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
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
  let { email, password } = req.body;

  if (email == "" || password == "") {
    res.json({
      status: "FAILED",
      message: "Las credenciales se encuentran vacias, favor suministrarla!!!",
    });
  } else {
    User.find({ email })
      .then((data) => {
        if (data.length) {
          const hashedPassword = data[0].password;
          bcrypt
            .compare(password, hashedPassword)
            .then((result) => {
              if (result) {
                res.json({
                  status: "SUCCESS",
                  message: "Inicio de sesión exitoso",
                  data: data,
                });
              } else {
                res.json({
                  status: "FAILED",
                  message: "Usuario y/o contraseña se encuentran invalida",
                });
              }
            })
            .catch((err) => {
              res.json({
                status: "FAILED",
                message: "Las contraseñas no se pueden comparar",
              });
            });
        } else {
          res.json({
            status: "FAILED",
            message: "Usuario y/o contraseña se encuentran invalida",
          });
        }
      })

      .catch((err) => {
        res.json({
          status: "FAILED",
          message: "Ocurrió un error al verificar al usuario",
        });
      });
  }
};

export const logout = (req, res) => {
  res.clearCookie("validarJWT");
  return res.json({ msg: true });
};
