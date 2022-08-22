import mongoose from "mongoose";

try {
    await mongoose.connect(process.env.URI_MONGO)
    console.log("Conexión a la DB ok 👍")
    
} catch (error) {
    console.log("Error de conexión a la Base de Datos" + error)
}