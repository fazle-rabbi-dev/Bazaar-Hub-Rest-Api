import { Router } from "express";
import { seedUsers, seedProducts, seedCategories, seedCarts, seedOrders } from "../../controllers/v1/seedController.js";

const router = Router();

router.post("/users", seedUsers);
router.post("/products", seedProducts);
router.post("/categories", seedCategories);
router.post("/carts", seedCarts);
router.post("/orders", seedOrders);

export default router;
