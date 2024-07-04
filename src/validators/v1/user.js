import { body, query, check } from "express-validator";

import { validateUsername, validateDocumentId } from "../../utils/helpers.js";

const resendAccountConfirmationEmail = [
    query("email")
        .trim()
        .notEmpty()
        .withMessage("Email address is required. Please provide a valid email address as the query parameter.")
        .isEmail()
        .withMessage("Invalid email address.")
];

const confirmAccount = [
    query("userId")
        .trim()
        .custom((userId, { req }) => {
            if (!validateDocumentId(userId)) {
                throw new Error("Invalid user ID. Please ensure you provide a valid userId as the query parameter.");
            }
            return true;
        }),
    query("confirmationToken")
        .trim()
        .custom((confirmationToken, { req }) => {
            if (!confirmationToken) {
                throw new Error("Oops! Looks like you forgot to include confirmationToken in the query parameter.");
            }
            return true;
        })
];

const forgotPassword = [
    query("email")
        .trim()
        .notEmpty()
        .withMessage("Email address is required. Please provide a valid email address as the query parameter.")
        .isEmail()
        .withMessage("Invalid email address.")
];

const resetPassword = [
    // userId, resetPasswordToken
    query("userId")
        .trim()
        .custom((value, { req }) => {
            if (!validateDocumentId(value)) {
                throw new Error("Invalid user id. Please ensure you provide a valid userId in the query parameter.");
            }
            return true;
        }),
    query("resetPasswordToken")
        .trim()
        .custom((value, { req }) => {
            if (!value || value?.length < 10) {
                throw new Error(
                    "Invalid reset password token. Please ensure you provide a valid token to reset your password in the query parameter."
                );
            }
            return true;
        }),
    body("newPassword").trim().isLength({ min: 6 }).withMessage("New password is required and must be at least 6 characters long."),
    body("confirmPassword")
        .trim()
        .isLength({ min: 6 })
        .withMessage("Confirm password is required and must be at least 6 characters long.")
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error("New password & Confirm password did not match.");
            }

            return true;
        })
];

const changePassword = [
    body("oldPassword").trim().isLength({ min: 6 }).withMessage("Old password is required and must be at least 6 characters long."),
    body("newPassword").trim().isLength({ min: 6 }).withMessage("New password is required and must be at least 6 characters long."),
    body("confirmPassword")
        .trim()
        .isLength({ min: 6 })
        .withMessage("Confirm password is required and must be at least 6 characters long.")
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error("New password & Confirm password did not match.");
            }

            return true;
        })
];

const changeEmail = [
    body("newEmail")
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage("Invalid new email address. Please ensure you provide a valid new email address."),
    body("password").trim().isLength({ min: 6 }).withMessage("Invalid password. Password must be at least 6 characters long.")
];

const confirmChangeEmail = [
    query("userId")
        .trim()
        .custom((userId, { req }) => {
            if (!validateDocumentId(userId)) {
                throw new Error("Invalid user ID. Please ensure you provide a valid userId as the query parameter.");
            }
            return true;
        }),
    query("confirmationToken")
        .trim()
        .custom((confirmationToken, { req }) => {
            if (!confirmationToken) {
                throw new Error("Oops! Looks like you forgot to include confirmationToken in the query parameter.");
            }
            return true;
        })
];

const getUserProfile = [
    check("userId")
        .trim()
        .custom((userId, { req }) => {
            if (!validateDocumentId(userId)) {
                throw new Error("Invalid user ID. Please ensure you provide a valid userId as the query parameter.");
            }

            return true;
        })
];

const updateAccount = [
    body("fullName").optional().trim().isLength({ min: 4 }).withMessage("Full name is required and must be at least 4 characters long."),
    body("username")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("User name is required.")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long.")
        .custom((value, { req }) => {
            if (!validateUsername(value)) {
                throw new Error("Username is invalid. Username must be start with a character.");
            }
            return true;
        })
];

export default {
    resendAccountConfirmationEmail,
    confirmAccount,
    forgotPassword,
    resetPassword,
    changePassword,
    changeEmail,
    confirmChangeEmail,
    getUserProfile,
    updateAccount
};
