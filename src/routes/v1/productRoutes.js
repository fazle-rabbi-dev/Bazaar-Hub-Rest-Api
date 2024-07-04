import { Router } from "express";
import { createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct } from "../../controllers/v1/productController.js";
import verifyToken from "../../middlewares/verifyToken.js";
import VALIDATOR from "../../validators/v1/product.js";
import { upload } from "../../middlewares/uploadFile.js";
import runValidation from "../../middlewares/runValidation.js";

const router = Router();

router.post("/", verifyToken("admin"), upload.single("image"), VALIDATOR.createProduct, runValidation, createProduct);
router.get("/", getAllProducts);
router.get("/:slug", getSingleProduct);
router.patch("/:slug", verifyToken("admin"), upload.single("image"), VALIDATOR.updateProduct, runValidation, updateProduct);
router.delete("/:slug", verifyToken("admin"), deleteProduct);

export default router;
