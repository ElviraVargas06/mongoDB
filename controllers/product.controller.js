import { Producto } from "../models/Producto.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";
import fs from "fs-extra";

export const getProducts = async (req, res) => {
  try {
    const products = await Producto.find();
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const productFound = await Producto.findById(id);
    if (!productFound)
      return res.status(404).json({ message: "Producto no encontrado" });
    return res.json(productFound);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { descripcion, precio } = req.body;

    const product = new Producto({
      descripcion,
      precio,
    });

    if (req.files?.image) {
      const result = await uploadImage(req.files.image.tempFilePath);
      product.image = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };

      await fs.unlink(req.files.image.tempFilePath);
    }

    await product.save();

    res.json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedProduct = await Producto.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedProduct)
      return res
        .status(404)
        .json({ message: "Producto no encontrado para poder modificar" });
    return res.json(updatedProduct);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Producto.findByIdAndDelete(req.params.id);

    if (!product)
      return res.status(404).json({
        message: "El producto no existe",
      });

    if (product.image?.public_id) {
      await deleteImage(product.image.public_id);
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
