import multer from "multer";
import { MAX_FILE_SIZE, FILE_UPLOAD_DIR_ON_SERVER, ALLOWED_FILE_TYPE } from "../constants/index.js";

import ApiError from "../utils/ApiError.js";

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, FILE_UPLOAD_DIR_ON_SERVER),
    filename: (req, file, cb) => cb(null, `${file.originalname.split(".")[0]}-${Date.now()}.${file.originalname.split(".")[1]}`)
});

const limits = {
    fileSize: MAX_FILE_SIZE
};

const fileFilter = (req, file, cb) => {
    const allowedTypes = ALLOWED_FILE_TYPE;
    const mimeType = file.mimetype.split("/")[1];

    if (allowedTypes.test(mimeType)) {
        cb(null, true);
    } else {
        cb(new ApiError(400, "Only jpg, jpeg, and png image files are allowed!"), false);
    }
};

export const upload = multer({
    storage,
    limits,
    fileFilter
});
