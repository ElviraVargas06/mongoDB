import nodemailer from "nodemailer"

import "dotenv/config"



//Enviar correo electronico con la confirmacion de la cuenta

export const createTrans = () => {

    try{
        const transport = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: process.env.USERMAIL,
                pass: process.env.PASSEMAIL,
            },
        });

        return transport
     
    }catch(error){
        console.log(error);
    }
    
}


export const generateEmailTemplate = code =>{
    return `
    <!DOCTYPE html>
    <html lang= "es">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv= "X-UA-Compatible" content="IE=edge">

        <style>
            @media only screen and (max-width: 620px){
                h1{
                    font-size: 20px;
                    padding: 5px;
                }
            }
        </style>
      </head>
      <body>
        <div>
        <div style="max-width: 620px; margin: 0 auto; font-family:
        sans-serif; color: #272727;">
            <h1 style="background: #f6f6f6; padding: 10px; text-align:
            center; color: #272727;">
                Bienvenido 
            </h1>

            <p>
            Favor confirmar cuenta, ingrese el siguiente token al iniciar sesion!!
            </p>
            <p
                style="width: 80px;
                margin: 0 auto;
                font-weight: bold;
                text-align: center;
                background: #f6f6f6;
                border-radius: 5px;
                font-size: 25px;">${code}
            </p>
        </div>
        </div>
      </body>
    </html>
    `;
}

export const confirmacionEmailTemplate = (heading, message) =>{
    return `
    <!DOCTYPE html>
    <html lang= "es">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv= "X-UA-Compatible" content="IE=edge">

        <style>
            @media only screen and (max-width: 620px){
                h1{
                    font-size: 20px;
                    padding: 5px;
                }
            }
        </style>
      </head>
      <body>
        <div>
        <div style="max-width: 620px; margin: 0 auto; font-family:
        sans-serif; color: #272727;">
          
            <h1 style="background: #f6f6f6; 
                        padding: 10px;
                        text-align: center;
                        color: #272727;">${heading}
            </h1>
            <p style="color: #272727;
                    text-align: center;">${message}
            </p>
           
        </div>
        </div>
      </body>
    </html>
    `;
}