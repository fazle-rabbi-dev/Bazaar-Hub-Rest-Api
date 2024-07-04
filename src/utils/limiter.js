import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 requests per windowMs
    handler: (req, res, next, err) => {
        next(err);
    }
});
