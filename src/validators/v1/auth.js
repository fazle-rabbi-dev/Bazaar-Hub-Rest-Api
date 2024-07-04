import { body } from "express-validator";

import { validateUsername, validateDocumentId } from "../../utils/helpers.js";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const register = [
    body("fullName")
        .trim()
        .notEmpty()
        .withMessage("Full name is required.")
        .isLength({ min: 4 })
        .withMessage("Full name must be at least 4 characters long."),
    body("username")
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
        }),
    body("email").trim().normalizeEmail().isEmail().withMessage("Please provide a valid email address."),
    body("password").trim().isLength({ min: 6 }).withMessage("Password is required and must be at least 6 characters long."),
    body("avatar")
        .optional()
        .custom((value, { req }) => {
            if (!req.file) {
                throw new Error("No file uploaded.Please upload a profile picture.");
            }
            return true;
        })
];

const login = [
    body("email")
        .trim()
        .custom((email, { req }) => {
            const username = req.body.username?.trim() || "";

            // throw error when email/username both are missing
            if (!email && !username) {
                throw new Error("Missing username or email. A username or email address is required to proceed.");
            }

            // validate email address
            if (!username && !emailRegex.test(email)) {
                throw new Error("Invalid email address.");
            }

            // validate username
            if (!email && !validateUsername(username)) {
                throw new Error(
                    "Invalid username. It must be at least 3 characters long, can only contain letters (a-z), numbers (0-9), and underscores (_), and must start with a letter."
                );
            }

            return true;
        }),
    body("password").trim().isLength({ min: 6 }).withMessage("Password is required and must be at least 6 characters long.")
];

const refreshAccessToken = [
    body("userId")
        .trim()
        .custom((userId, { req }) => {
            if (!validateDocumentId(userId)) {
                throw new Error("Invalid user ID. Please ensure you provide a valid userId in the request body.");
            }

            return true;
        }),
    body("refreshToken")
        .trim()
        .custom((value, { req }) => {
            if (!value || value?.length < 10) {
                throw new Error(
                    "Invalid refresh token. Please ensure you provide a valid refresh token in the request body to refresh your access token."
                );
            }
            return true;
        })
];

export default {
    register,
    login,
    refreshAccessToken
};
