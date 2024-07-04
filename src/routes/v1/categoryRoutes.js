import { Router } from "express";
import { createCategory, getCategories, getCategory, updateCategory, deleteCategory } from "../../controllers/v1/categoryController.js";
import verifyToken from "../../middlewares/verifyToken.js";
import VALIDATOR from "../../validators/v1/category.js";
import runValidation from "../../middlewares/runValidation.js";

const router = Router();

router.post("/", verifyToken("admin"), VALIDATOR.createCategory, runValidation, createCategory);
router.get("/", getCategories);
router.get("/:slug", getCategory);
router.patch("/:slug", verifyToken("admin"), VALIDATOR.updateCategory, runValidation, updateCategory);
router.delete("/:slug", verifyToken("admin"), deleteCategory);

export default router;
