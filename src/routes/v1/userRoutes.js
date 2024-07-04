import { Router } from "express";
import {
    confirmAccount,
    resendAccountConfirmationEmail,
    getUserProfile,
    getAllUsers,
    getCurrentUser,
    changeCurrentPassword,
    forgotPassword,
    resetPassword,
    updateAccountDetails,
    changeCurrentEmail,
    confirmChangeEmail,
    deleteUser,
    manageUserStatus
} from "../../controllers/v1/userController.js";
import verifyToken from "../../middlewares/verifyToken.js";
import runValidation from "../../middlewares/runValidation.js";
import VALIDATOR from "../../validators/v1/user.js";
import { upload } from "../../middlewares/uploadFile.js";

const router = Router();

router.get("/confirm-account", VALIDATOR.confirmAccount, runValidation, confirmAccount);
router.get("/resend-confirmation-email", VALIDATOR.resendAccountConfirmationEmail, runValidation, resendAccountConfirmationEmail);
router.get("/profile/:userId", VALIDATOR.getUserProfile, runValidation, getUserProfile);
router.get("/forgot-password", VALIDATOR.forgotPassword, runValidation, forgotPassword);
router.patch("/reset-password", VALIDATOR.resetPassword, runValidation, resetPassword);
router.patch("/confirm-change-email", VALIDATOR.confirmChangeEmail, runValidation, confirmChangeEmail);

// secured routes
router.get("/", verifyToken("admin"), getAllUsers);
router.get("/:id", verifyToken(), getCurrentUser);
router.patch("/change-password", VALIDATOR.changePassword, runValidation, verifyToken(), changeCurrentPassword);
router.put("/change-email", VALIDATOR.changeEmail, runValidation, verifyToken(), changeCurrentEmail);
router.patch("/:id", verifyToken(), upload.single("avatar"), updateAccountDetails);
router.delete("/:id", verifyToken("admin"), deleteUser);
router.patch("/manage-user-status/:id", verifyToken("admin"), manageUserStatus);

export default router;
