export const PORT = 5000;
export const DB_NAME = "bazaar-hub-api";

export const DEVELOPER_NAME = "Fazle Rabbi";
export const DEVELOPER_EMAIL = "fazlerabbidev@outlook.com";
export const ACCOUNT_CONFIRMATION_ROUTE = "http://localhost:3000/api/v1/users/confirm-account";
export const EMAIL_CHANGE_CONFIRMATION_ROUTE = "http://localhost:3000/api/v1/users/confirm-change-email";
export const RESET_PASSWORD_ROUTE = "http://localhost:3000/api/v1/users/reset-password";
export const ALLOWED_CORS_ORIGIN = ["http://localhost:5173"];

// Your front-end project name that you want to display in: confirmation email, password reset email etc.
export const PROJECT_NAME = "BazaarHub";
export const DOCUMENTATION_URL = "http://localhost:5000/api-docs";

// =====================================================================================================================
// File Upload Configuration
// =====================================================================================================================
export const CLOUDINARY_UPLOAD_USER_IMAGE_DIR = "bazaar-hub/users";
export const CLOUDINARY_UPLOAD_PRODUCT_IMAGE_DIR = "bazaar-hub/products";
export const MAX_FILE_SIZE = 1024 * 1024; // 1Mb in byte format
export const FILE_UPLOAD_DIR_ON_SERVER = "public/temp";
export const ALLOWED_FILE_TYPE = /jpg|jpeg|png/;
