const getEnv = name => {
    return process.env[name];
};

export const PORT = getEnv("PORT");
export const MONGODB_URI = getEnv("MONGODB_URI");
export const JWT_SECRET = getEnv("JWT_SECRET");
export const ACCESS_TOKEN_SECRET = getEnv("ACCESS_TOKEN_SECRET");
export const REFRESH_TOKEN_SECRET = getEnv("REFRESH_TOKEN_SECRET");
export const ACCESS_TOKEN_EXPIRY = getEnv("ACCESS_TOKEN_EXPIRY");
export const REFRESH_TOKEN_EXPIRY = getEnv("REFRESH_TOKEN_EXPIRY");
export const CLOUDINARY_CLOUD_NAME = getEnv("CLOUDINARY_CLOUD_NAME");
export const CLOUDINARY_API_KEY = getEnv("CLOUDINARY_API_KEY");
export const CLOUDINARY_API_SECRET = getEnv("CLOUDINARY_API_SECRET");
export const GMAIL_USERNAME = getEnv("GMAIL_USERNAME");
export const GMAIL_PASSWORD = getEnv("GMAIL_PASSWORD");
export const ENVIRONMENT = getEnv("ENVIRONMENT");
