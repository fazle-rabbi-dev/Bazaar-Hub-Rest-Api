import { Router } from "express";
import { addItemToCart, getCart, updateCartItem, removeCartItem, clearCart } from "../../controllers/v1/cartController.js";
import verifyToken from "../../middlewares/verifyToken.js";
import VALIDATOR from "../../validators/v1/cart.js";
import runValidation from "../../middlewares/runValidation.js";

const router = Router();

router.post("/", verifyToken(), VALIDATOR.addItemToCart, runValidation, addItemToCart);
router.get("/", verifyToken(), getCart);
router.patch("/", verifyToken(), VALIDATOR.updateCartItem, runValidation, updateCartItem);
router.delete("/remove-item/:productId", verifyToken(), removeCartItem);
router.delete("/clear", verifyToken(), clearCart);

export default router;
