import { Router } from "express";
import { registerUser, loginUser, refreshAccessToken } from "../../controllers/v1/authController.js";
import runValidation from "../../middlewares/runValidation.js";
import VALIDATOR from "../../validators/v1/auth.js";
import { upload } from "../../middlewares/uploadFile.js";

const router = Router();

router.post("/register", upload.single("avatar"), VALIDATOR.register, runValidation, registerUser);
router.post("/login", VALIDATOR.login, runValidation, loginUser);
router.patch("/refresh-access-token", VALIDATOR.refreshAccessToken, runValidation, refreshAccessToken);

export default router;
