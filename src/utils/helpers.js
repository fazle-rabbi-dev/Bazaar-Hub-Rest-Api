import mongoose from "mongoose";
import crypto from "crypto";

import { ACCOUNT_CONFIRMATION_ROUTE, EMAIL_CHANGE_CONFIRMATION_ROUTE, RESET_PASSWORD_ROUTE } from "../constants/index.js";
import UserModel from "../models/UserModel.js";


// Validate Mongoose Document Id against Mongoose ObjectId
export function validateDocumentId(inputId) {
    if (!inputId || !inputId.trim()) return false;

    try {
        const mongooseObjectId = new mongoose.Types.ObjectId(inputId);
        return true;
    } catch (error) {
        return false;
    }
}

export const generateRandomString = (length = 128) => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(length, (err, buffer) => {
            if (err) {
                reject(err);
            } else {
                // Use URL-safe base64 encoding
                const token = buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); // Remove trailing '=' characters
                resolve(token);
            }
        });
    });
};

export const generateAccountConfirmationLink = (userId, confirmationToken) => {
    const confirmationLink = `${ACCOUNT_CONFIRMATION_ROUTE}?userId=${userId}&confirmationToken=${confirmationToken}`;
    return confirmationLink;
};

export const generateEmailChangeConfirmationLink = (userId, confirmationToken) => {
    const confirmationLink = `${EMAIL_CHANGE_CONFIRMATION_ROUTE}?userId=${userId}&confirmationToken=${confirmationToken}`;
    return confirmationLink;
};

export const generateResetPasswordLink = (userId, resetPasswordToken) => {
    return `${RESET_PASSWORD_ROUTE}?userId=${userId}&resetPasswordToken=${resetPasswordToken}`;
};

export const generateValidationError = errors => {
    return errors.map(item => {
        return {
            field: item.path,
            message: item.msg
        };
    });
};

export function validateUsername(username) {
    if (!username || username.length < 3) {
        return false;
    }

    // Regular expression to match the criteria
    const regex = /^[a-zA-Z][a-zA-Z0-9_]{2,}$/;

    // Test the username against the regex
    return regex.test(username);
}

// Generate << Access & Refresh >> Token
export const generateAccessAndRefereshTokens = async (userId, role) => {
    try {
        const user = await UserModel.findById(userId);
        const accessToken = user.generateAccessToken(role);
        const refreshToken = user.generateRefreshToken(role);

        user.authentication.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Something went wrong while generating referesh and access token.");
    }
};
