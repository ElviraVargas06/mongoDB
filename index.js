import "dotenv/config"
import "./database/connectdb.js"
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.route.js"
import linkRouter from "./routes/link.route.js";
import redirectRouter from "./routes/redirect.route.js";


const app = express();

const whiteList = [process.env.ORIGIN1, process.env.ORIGIN2];

app.use(
    cors({
        origin: function (origin, callback) {
            console.log("😲😲😲 =>", origin);
            if (!origin || whiteList.includes(origin)) {
                return callback(null, origin);
            }
            return callback(
                "Error de CORS origin: " + origin + " No autorizado!"
            );
        },
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

// ejemplo back redirect (opcional)
app.use("/", redirectRouter);

//Recibe datos JSON
app.use(express.json());

app.use("/api/v1/auth",authRouter)
app.use("/api/v1/links", linkRouter);

// routes -------------------------------------------
/*app.get('/', (req, res)=>{
    res.send('Bienvenido a mi API')
})*/

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log("🌞🌞🌞🌞 http://localhost:" + PORT))