import asyncHanlder from "express-async-handler";
import ApiError from "../utils/ApiError.js";

const notFoundError = asyncHanlder(async (req, res, next) => {
    throw new ApiError(404, "Oops! Route not found. You might have hit a dead endpoint.");
});

export default notFoundError;
