import asyncHandler from "express-async-handler";

import ApiResponse, { successResponse } from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import User from "../../models/UserModel.js";
import sendEmail from "../../utils/sendEmail.js";
import { generateAccountConfirmationEmail } from "../../utils/emailTemplates.js";
import { generateRandomString, generateAccountConfirmationLink, generateAccessAndRefereshTokens } from "../../utils/helpers.js";
import { PROJECT_NAME, CLOUDINARY_UPLOAD_USER_IMAGE_DIR } from "../../constants/index.js";
import Cloudinary from "../../utils/cloudinary.js";


// =====================================================================================================================
// Register User
// =====================================================================================================================
const registerUser = async ({ fullName, username, email, password, filePath }) => {
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        const whichOneExists = existingUser.email === email ? "email" : "username";

        throw new ApiError(409, `A user already exists with the same ${whichOneExists}.`);
    }

    const userData = {
        fullName,
        username,
        email,
        authentication: {
            password
        }
    };

    let uploadedFile;

    if (filePath) {
        uploadedFile = await Cloudinary.uploadFile(filePath, CLOUDINARY_UPLOAD_USER_IMAGE_DIR);

        if (uploadedFile) {
            console.log({ uploadedFile });

            userData.avatar = {
                url: uploadedFile.secure_url,
                id: uploadedFile.public_id
            };
        }
    }

    const createdUser = await User.create(userData);

    // Generate account confirmation token & link
    const confirmationToken = await generateRandomString();
    const confirmationLink = generateAccountConfirmationLink(createdUser._id.toString(), confirmationToken);

    // Store confirmationToken in db
    createdUser.authentication.confirmationToken = confirmationToken;
    await createdUser.save();

    // Send account confirmation email
    const htmlEmailTemplate = generateAccountConfirmationEmail(createdUser.fullName, confirmationLink);
    await sendEmail(createdUser.email, `${PROJECT_NAME} Account confirmation`, htmlEmailTemplate);

    const userObject = {
        ...createdUser.generateSafeObject(),
        confirmationToken
    };

    return userObject;
};

// =====================================================================================================================
// Login User
// =====================================================================================================================
const loginUser = async (username, email, password) => {
    const user = await User.findOne({
        $or: [{ username }, { email }]
    }).select("+authentication.password +authentication.isAccountConfirmed +authentication.role +isBanned");

    if (!user) {
        throw new ApiError(404, "Oops! We couldn't find a user with the provided email or username.");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect username or password. Please try again.");
    }

    if (user.isBanned) {
        throw new ApiError(
            403,
            "Your account has been temporarily suspended. For assistance, please contact our support team at [demo@gmail.com]. Thank you for your understanding."
        );
    }

    if (!user.authentication.isAccountConfirmed) {
        throw new ApiError(
            403,
            "Account Not Confirmed. Your account needs to be confirmed. Please check your email inbox for the confirmation link."
        );
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id, user.authentication.role);

    const userObject = user.toObject();
    userObject.authentication = {
        accessToken,
        refreshToken
    };

    return userObject;
};

// =====================================================================================================================
// Refresh Access Token
// =====================================================================================================================
const refreshAccessToken = async (userId, refreshToken) => {
    console.log({ userId, refreshToken });

    const currentUser = await User.findById(userId);

    if (!currentUser) {
        throw new ApiError(404, "User does not exists.");
    }

    if (currentUser.authentication.refreshToken !== refreshToken) {
        throw new ApiError(401, "The refresh token provided is invalid or has expired. Please login again to obtain a new refresh token.");
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateAccessAndRefereshTokens(userId);
    currentUser.authentication.refreshToken = newRefreshToken;
    await currentUser.save();

    return {
        newAccessToken,
        newRefreshToken
    };
};

export default {
    registerUser,
    loginUser,
    refreshAccessToken
};
