import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

import ApiResponse, { successResponse } from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import User from "../../models/UserModel.js";
import sendEmail from "../../utils/sendEmail.js";
import { PROJECT_NAME, CLOUDINARY_UPLOAD_USER_IMAGE_DIR } from "../../constants/index.js";
import Cloudinary from "../../utils/cloudinary.js";
import userService from "../../services/v1/userService.js";
import findItemWithId from "../../services/misc/find-item-with-id.js";
import {
    generateAccountConfirmationEmail,
    generateEmailChangeConfirmationEmail,
    generatePasswordResetEmail
} from "../../utils/emailTemplates.js";
import {
    generateRandomString,
    generateAccountConfirmationLink,
    generateEmailChangeConfirmationLink,
    generateResetPasswordLink,
    validateDocumentId,
    generateValidationError,
    validateUsername,
    generateAccessAndRefereshTokens
} from "../../utils/helpers.js";


// =====================================================================================================================
// Resend Account Confirmation Email
// =====================================================================================================================
export const resendAccountConfirmationEmail = asyncHandler(async (req, res) => {
    const { email } = req.query;

    const user = await userService.resendAccountConfirmationEmail(email);

    successResponse(res, {
        statusCode: 200,
        message: `A new confirmation email has been sent to (${email}). Please check your inbox.`
    });
});

// =====================================================================================================================
// Confirm User Account
// =====================================================================================================================
export const confirmAccount = asyncHandler(async (req, res) => {
    const { userId, confirmationToken } = req.query;

    const user = await userService.confirmAccount(userId, confirmationToken);

    successResponse(res, {
        statusCode: 200,
        message: "Your account has been successfully confirmed.",
        data: {
            user
        }
    });
});

// =====================================================================================================================
// Get Any User Public Profile By User Id
// =====================================================================================================================
export const getUserProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const options = {
        email: 0,
        "authentication.password": 0
    };
    const user = await findItemWithId(User, userId, options);

    successResponse(res, {
        statusCode: 200,
        message: "User profile found successfully.",
        data: {
            user: user.generateSafeObject()
        }
    });
});

// =====================================================================================================================
// Get All Users
// =====================================================================================================================
export const getAllUsers = asyncHandler(async (req, res) => {
    const { page, limit, sortBy, order, fields, search } = req.query;

    const { users, totalPages } = await userService.getAllUsers({ page, limit, sortBy, order, fields, search });

    successResponse(res, {
        statusCode: 200,
        message: "Users fetched successfully.",
        data: {
            users,
            pagination: {
                totalPages,
                currentPage: page,
                prevPage: page - 1 > 0 ? page - 1 : null,
                nextPage: page + 1 <= totalPages ? page + 1 : null
            }
        }
    });
});

// =====================================================================================================================
// Get Currently Logged In User
// =====================================================================================================================
export const getCurrentUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const loggedInUserId = req.user._id;

    const user = await userService.getCurrentUser(id, loggedInUserId);

    successResponse(res, {
        statusCode: 200,
        message: "User found successfully.",
        data: { user }
    });
});

// =====================================================================================================================
// Change User Password
// =====================================================================================================================
export const changeCurrentPassword = asyncHandler(async (req, res) => {
    const loggedInUserId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    const user = await userService.changeCurrentPassword(loggedInUserId, oldPassword, newPassword);

    successResponse(res, {
        statusCode: 200,
        message: "Password changed successfully.",
        data: {
            user
        }
    });
});

// =====================================================================================================================
// Forgot Password
// =====================================================================================================================
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.query;

    await userService.forgotPassword(email);

    successResponse(res, {
        statusCode: 200,
        message: `An email has been sent to "${email}" with further instructions.`
    });
});

// =====================================================================================================================
// Reset Password
// =====================================================================================================================
export const resetPassword = asyncHandler(async (req, res) => {
    const { userId, resetPasswordToken } = req.query;
    const { newPassword } = req.body;

    const user = await userService.resetPassword(userId, resetPasswordToken, newPassword);

    successResponse(res, {
        statusCode: 200,
        message: "Password reset successfully.",
        data: { user }
    });
});

// =====================================================================================================================
// Update User Account Details or Profile
// =====================================================================================================================
export const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, username } = req.body;
    const { id } = req.params;

    const loggedInUserId = req.user._id;
    const filePath = req.file?.path;

    const data = {
        body: {
            fullName,
            username
        },
        id,
        loggedInUserId,
        filePath
    };

    const user = await userService.updateAccountDetails(data);

    successResponse(res, {
        statusCode: 200,
        message: "Account updated successfully.",
        data: { user }
    });
});

// =====================================================================================================================
// Change Current Email Address
// =====================================================================================================================
export const changeCurrentEmail = asyncHandler(async (req, res) => {
    const loggedInUserId = req.user._id;
    const { newEmail, password } = req.body;

    const user = await userService.changeCurrentEmail(loggedInUserId, newEmail, password);

    successResponse(res, {
        statusCode: 200,
        message: `A confirmation email has been sent to "${newEmail}". Please check your inbox and follow the instructions to confirm your email address.`,
        data: { user }
    });
});

// =====================================================================================================================
// Confirm Email Change
// =====================================================================================================================
export const confirmChangeEmail = asyncHandler(async (req, res) => {
    const { userId, confirmationToken } = req.query;

    const user = await userService.confirmChangeEmail(userId, confirmationToken);

    successResponse(res, {
        statusCode: 200,
        message: "Great! Email changed successfully.",
        data: {
            user
        }
    });
});

// =====================================================================================================================
// Delete User By Id
// =====================================================================================================================
export const deleteUser = asyncHandler(async (req, res) => {
    const id = req.params.id;

    await userService.deleteUser(id);

    successResponse(res, {
        statusCode: 200,
        message: "User deleted successfully."
    });
});

// =====================================================================================================================
// Ban/Unban User
// =====================================================================================================================
export const manageUserStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const action = req.query?.action.toLowerCase();

    const { updatedUser, actionMessage } = await userService.manageUserStatus(id, action);

    successResponse(res, {
        statusCode: 200,
        message: `User ${actionMessage} successfully.`,
        data: updatedUser
    });
});
