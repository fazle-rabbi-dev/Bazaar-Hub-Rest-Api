import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/secret.js";

const verifyToken =
    (requiredRole) =>
    (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(" ")[1];

        if (!authHeader || !token) {
            throw new ApiError(401, "🛑 Unauthorized access: Authorization header or token is missing.");
        }

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err || (requiredRole && user.role !== requiredRole) ) {
                const message = err ? "👽 Authentication failed: Anomaly detected!" : "🚫 Access denied: Insufficient permissions.";
                throw new ApiError(401, message);
            }

            req.user = user;
            next();
        });
    };

export default verifyToken;
