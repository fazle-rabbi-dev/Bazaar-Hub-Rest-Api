import express from "express";

import { createOrder, getOrder, getOrders, updateOrderStatus, deleteOrder } from "../../controllers/v1/orderController.js";
import verifyToken from "../../middlewares/verifyToken.js";
import VALIDATOR from "../../validators/v1/order.js";
import runValidation from "../../middlewares/runValidation.js";

const router = express.Router();

router.post("/", verifyToken(), createOrder);
router.get("/:orderId", verifyToken(), VALIDATOR.getOrder, runValidation, getOrder);
router.get("/", verifyToken(), getOrders);
router.patch("/:orderId", verifyToken(), VALIDATOR.updateOrderStatus, runValidation, updateOrderStatus);
router.delete("/:orderId", verifyToken("admin"), VALIDATOR.deleteOrder, runValidation, deleteOrder);

export default router;
