import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

import { PROJECT_NAME, CLOUDINARY_UPLOAD_USER_IMAGE_DIR } from "../../constants/index.js";
import Cloudinary from "../../utils/cloudinary.js";
import ApiResponse, { successResponse } from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import User from "../../models/UserModel.js";
import sendEmail from "../../utils/sendEmail.js";
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
import findItemWithId from "../misc/find-item-with-id.js";


const resendAccountConfirmationEmail = async email => {
    const currentUser = await User.findOne({ email }).select("+authentication.isAccountConfirmed +authentication.confirmationToken");
    if (!currentUser) {
        throw new ApiError(404, "No user exists with the provided user ID.");
    }

    if (currentUser.authentication.isAccountConfirmed) {
        throw new ApiError(409, "Your account is already confirmed. Feel free to log in.");
    }

    // Generate account confirmation token & link
    const confirmationToken = await generateRandomString();
    const confirmationLink = generateAccountConfirmationLink(currentUser._id.toString(), confirmationToken);

    // Store confirmationToken in db
    currentUser.authentication.confirmationToken = confirmationToken;
    await currentUser.save();

    // Send account confirmation email
    const htmlEmailTemplate = generateAccountConfirmationEmail(currentUser.fullName, confirmationLink);
    await sendEmail(currentUser.email, `${PROJECT_NAME} Account confirmation`, htmlEmailTemplate);

    const userObject = currentUser.toObject();
    userObject.authentication = {
        confirmationToken
    };

    return userObject;
};

const confirmAccount = async (userId, confirmationToken) => {
    const select = "+authentication.confirmationToken +authentication.isAccountConfirmed";

    const currentUser = await findItemWithId(User, userId, {}, select);

    if (currentUser.authentication.isAccountConfirmed) {
        throw new ApiError(400, "Hey there! Your account is already confirmed. Feel free to log in.");
    }

    if (currentUser.authentication.confirmationToken !== confirmationToken) {
        throw new ApiError(400, "Uh-oh! The account confirmation token provided is invalid.");
    }

    currentUser.authentication.isAccountConfirmed = true;
    currentUser.authentication.confirmationToken = "";
    await currentUser.save();

    return currentUser.generateSafeObject();
};

const getAllUsers = async ({ page, limit, sortBy, order, fields, search }) => {
    // pagination
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sortField = sortBy || "createdAt";
    const sortOrder = order === "desc" ? -1 : 1;
    const sort = { [sortField]: sortOrder };

    // partial response
    fields = fields ? fields.split(",") : [];

    // Search
    const searchValue = (search || "").trim();
    const filter = {
        "authentication.role": { $ne: "admin" },
        $or: [
            { name: { $regex: searchValue, $options: "i" } },
            { email: { $regex: searchValue, $options: "i" } },
            { username: { $regex: searchValue, $options: "i" } }
        ]
    };

    const users = await User.find(filter).select(fields).sort(sort).limit(limit).skip(skip);
    if (!users || users.length === 0) {
        throw new ApiError(404, "Users not found.");
    }

    const count = await User.find().countDocuments();
    const totalPages = Math.ceil(count / limit);

    return {
        users,
        totalPages,
        page
    };
};

const getCurrentUser = async (id, loggedInUserId) => {
    if (id !== loggedInUserId) {
        throw new ApiError(403, "Sorry, you don't have permission to perform this operation. Please provide a valid user id.");
    }

    const currentUser = await User.findById(loggedInUserId).select("+authentication.refreshToken +isBanned");
    if (!currentUser) {
        throw new ApiError(404, "User does not exists.");
    }

    if (currentUser.isBanned) {
        throw new ApiError(
            403,
            "Your account has been temporarily suspended. For assistance, please contact our support team at [demo@gmail.com]. Thank you for your understanding."
        );
    }

    return currentUser;
};

const changeCurrentPassword = async (loggedInUserId, oldPassword, newPassword) => {
    const currentUser = await User.findById(loggedInUserId).select("+authentication.password");

    if (!currentUser) {
        throw new ApiError(404, "User does not exist.");
    }

    const isPasswordCorrect = await currentUser.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Incorrect old password. Please try again with the correct password.");
    }

    currentUser.authentication.password = newPassword;
    const savedUser = await currentUser.save();

    return currentUser.generateSafeObject();
};

const forgotPassword = async email => {
    const currentUser = await User.findOne({ email }).select("+authentication.resetPasswordToken");

    if (!currentUser) {
        throw new ApiError(404, "No user found with that email address.");
    }

    const resetPasswordToken = await generateRandomString();
    const resetPasswordLink = generateResetPasswordLink(currentUser._id.toString(), resetPasswordToken);

    // Store resetToken in db
    currentUser.authentication.resetPasswordToken = resetPasswordToken;
    await currentUser.save();

    // Send account confirmation email
    const htmlEmailTemplate = generatePasswordResetEmail(currentUser.fullName, resetPasswordLink);
    await sendEmail(currentUser.email, `${PROJECT_NAME} Password Reset`, htmlEmailTemplate);
};

const resetPassword = async (userId, resetPasswordToken, newPassword) => {
    const currentUser = await User.findById(userId).select("+authentication.resetPasswordToken +authentication.password");

    if (!currentUser) {
        throw new ApiError(404, "User not found. Please ensure your userId is valid.");
    }

    if (currentUser.authentication.resetPasswordToken !== resetPasswordToken) {
        throw new ApiError(401, "You might have clicked on a broken link. Please request a new link to reset your password.");
    }

    currentUser.authentication.password = newPassword;
    currentUser.authentication.resetPasswordToken = "";
    await currentUser.save();

    return currentUser.generateSafeObject();
};

const updateAccountDetails = async data => {
    const { body, id, loggedInUserId, filePath } = data;
    const { fullName, username } = body;

    if (id !== loggedInUserId) {
        throw new ApiError(403, "Sorry, you don't have permission to do this operation. Please provide a valid user id.");
    }

    const allowedUpdates = ["fullName", "username"];

    // Validate allowed updates
    const updates = Object.keys(body);
    const isValidOperation = updates.every(field => allowedUpdates.includes(field));

    if (updates.length === 0 || !isValidOperation) {
        throw new ApiError(400, "Invalid update. Please provide required fields to update account.");
    }

    if (fullName?.length < 3) {
        throw new ApiError(400, "Fullname must be at least 3 characters long.");
    }

    if (username && !validateUsername(username.trim())) {
        throw new ApiError(
            400,
            "Invalid username. The username must start with a letter and contain only letters, numbers, and underscores."
        );
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
        throw new ApiError(409, "This username is already in use. Please provide a different username to update your username.");
    }

    const currentUser = await User.findById(loggedInUserId);
    const updateFields = req.body;

    // Delete Old Image & Upload New One
    if (filePath) {
        await Cloudinary.deleteFile(currentUser?.avatar.id);

        const uploadedFile = await Cloudinary.uploadFile(filePath, CLOUDINARY_UPLOAD_USER_IMAGE_DIR);

        console.log({ uploadedFile });

        if (uploadedFile) {
            updateFields.avatar = {
                url: uploadedFile.secure_url,
                id: uploadedFile.public_id
            };
        }
    }

    const updatedUser = await User.findByIdAndUpdate(loggedInUserId, updateFields, { new: true, runValidation: true });

    return updatedUser.generateSafeObject();
};

const changeCurrentEmail = async (loggedInUserId, newEmail, password) => {
    const existingUser = await User.findOne({ email: newEmail });

    if (existingUser) {
        throw new ApiError(409, "This email address is already in use. Please provide a different email address.");
    }

    const currentUser = await User.findById(loggedInUserId).select("+authentication.password");
    const isPasswordCorrect = await currentUser.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect password. Please provide correct password and try again.");
    }

    // generate token & link
    const confirmationToken = await generateRandomString();
    const confirmationLink = generateEmailChangeConfirmationLink(currentUser._id, confirmationToken);

    // send email
    const htmlEmailTemplate = generateEmailChangeConfirmationEmail(currentUser.fullName, confirmationLink);

    await sendEmail(newEmail, `${PROJECT_NAME} Account confirmation`, htmlEmailTemplate);

    // store token & new email in db
    currentUser.authentication.changeEmailConfirmationToken = confirmationToken;
    currentUser.authentication.tempMail = newEmail;

    await currentUser.save();

    return currentUser.generateSafeObject();
};

const confirmChangeEmail = async (userId, confirmationToken) => {
    const existingUser = await User.findById(userId).select("+authentication.tempMail +authentication.changeEmailConfirmationToken");

    if (!existingUser) {
        throw new ApiError(404, "User not found. Please ensure that you have clicked on the correct link.");
    }

    if (
        existingUser.authentication.changeEmailConfirmationToken !== confirmationToken ||
        !existingUser.authentication.tempMail.trim()
    ) {
        throw new ApiError(401, "Sorry, you don’t have permission to update this email address. Please click on the correct link.");
    }

    // update email
    existingUser.email = existingUser.authentication.tempMail;

    // remove tempMail & confirmationToken from db
    existingUser.authentication.changeEmailConfirmationToken = "";
    existingUser.authentication.tempMail = "";

    const updatedUser = await existingUser.save({ new: true });

    return updatedUser.generateSafeObject();
};

const deleteUser = async userId => {
    const existingUser = await findItemWithId(User, userId);

    const deletedUser = await User.deleteOne({
        _id: id,
        "authentication.role": "user"
    });

    // Delete user avatar/image
    if (deletedUser?.deletedCount === 1) {
        await Cloudinary.deleteFile(existingUser.avatar.id);
    }
};

const manageUserStatus = async (id, action) => {
    if (!["ban", "unban"].includes(action)) {
        throw new ApiError(400, "Invalid action. The action must be either 'ban' or 'unban'.");
    }

    if (!validateDocumentId(id)) {
        throw new ApiError(400, "Invalid user Id.");
    }

    const existingUser = await User.findById(id).select("+isBanned");

    if (!existingUser) {
        throw new ApiError(404, "User does not exists.");
    }

    if (action === "ban" && existingUser.isBanned) {
        throw new ApiError(409, "User is already banned.");
    }

    if (action === "unban" && !existingUser.isBanned) {
        throw new ApiError(409, "User is already unbanned.");
    }

    const updateFields = { isBanned: action === "ban" };
    const updatedUser = await User.findByIdAndUpdate(id, updateFields, { new: true }).select("+isBanned");

    const actionMessage = action === "ban" ? "banned" : "unbanned";

    return {
        updatedUser: updatedUser.generateSafeObject(),
        actionMessage
    };
};

export default {
    resendAccountConfirmationEmail,
    confirmAccount,
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
};
