import asyncHandler from "express-async-handler";

import ApiResponse, { successResponse } from "../../utils/ApiResponse.js";
import authService from "../../services/v1/authService.js";


// =====================================================================================================================
// Register User
// =====================================================================================================================
export const registerUser = asyncHandler(async (req, res) => {
    const { fullName, username, email, password } = req.body;
    const filePath = req.file?.path;

    const user = await authService.registerUser({
        fullName,
        username,
        email,
        password,
        filePath
    });

    successResponse(res, {
        statusCode: 200,
        message: "User registered successfully. Please check your email inbox to confirm your account.",
        data: { user }
    });
});

// =====================================================================================================================
// Login User
// =====================================================================================================================
export const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    const user = await authService.loginUser(username, email, password);

    successResponse(res, {
        statusCode: 200,
        message: "User logged in successfully.",
        data: { user }
    });
});

// =====================================================================================================================
// Refresh User Access Token
// =====================================================================================================================
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const { userId, refreshToken } = req.body;

    const { newAccessToken, newRefreshToken } = await authService.refreshAccessToken(userId, refreshToken);

    successResponse(res, {
        statusCode: 200,
        message: "Access token refreshed successfully.",
        data: {
            newAccessToken,
            newRefreshToken
        }
    });
});
