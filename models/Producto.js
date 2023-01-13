import mongoose from "mongoose";

const productoSchema = new mongoose.Schema(
  {
    descripcion: {
      type: String,
      trim: true,
    },

    precio: {
      type: Number,
      default: 0,
    },
    image: {
      secure_url: String,
      public_id: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Producto = mongoose.model("Producto", productoSchema);
