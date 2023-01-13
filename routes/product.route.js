import { Router } from "express";
import fileUpload from "express-fileupload";
import {
  getProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  getProduct,
} from "../controllers/product.controller.js";

const router = Router();

router.get("/products", getProducts);
router.post(
  "/products",
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
  }),
  createProduct
);
router.put("/products/:id", updateProduct);
router.get("/products/:id", getProduct);
router.delete("/products/:id", deleteProduct);

export default router;
