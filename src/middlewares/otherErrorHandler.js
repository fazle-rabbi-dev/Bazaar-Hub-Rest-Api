import rateLimit from "express-rate-limit";
import multer from "multer";

const otherErrorHandler = (error, req, res, next) => {
    console.error({ ERROR: error });

    // Prepare ERROR Response Structure
    const errorObject = {
        success: false,
        statusCode: error?.statusCode || 500,
        error: {
            message: (error?.statusCode && error?.message) || "Internal server error."
        }
    };

    // Rate limit error handling
    if (error?.name === "RateLimitError") {
        errorObject.statusCode = 429;
        errorObject.error.message = "Too many requests, please try again later.";
    }

    // File upload (Multer) error handling
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            errorObject.error.message = "File size limit exceeded (Max: 1 MB).";
        }
    }

    res.status(error?.statusCode || 500).json(errorObject);
};

export default otherErrorHandler;
