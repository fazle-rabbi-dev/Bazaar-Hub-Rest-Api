import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

export default (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            throw new ApiError(400, errors.errors[0].msg);
        }

        next();
    } catch (error) {
        next(error);
    }
};
