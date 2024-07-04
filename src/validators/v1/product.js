import { body, query, check } from "express-validator";

const createProduct = [
    body("name").trim().notEmpty().withMessage("Product name is required."),
    body("description").trim().notEmpty().withMessage("Description is required."),
    body("price").isInt().withMessage("Price is required & must be a number."),
    body("discount").optional().isNumeric().withMessage("Discount is required & must be a number."),
    body("stock").isInt({ min: 0 }).withMessage("Stock is required & must be a non-negative integer."),
    body("category").trim().notEmpty().withMessage("A valid category is required."),
    body("brand").optional().trim().notEmpty().withMessage("Brand is required."),
    body("color").optional().trim(),
    body("size").optional().trim(),
    body("weight").optional().isNumeric().withMessage("Weight must be a number"),
    body("rating").optional().isNumeric().withMessage("Rating must be a number"),
    body("ratingsCount").optional().isInt({ min: 0 }).withMessage("Ratings count must be a non-negative integer"),
    body("image")
        .optional()
        .custom((value, { req }) => {
            if (!req.file) {
                throw new Error("No file uploaded. Please upload a product image.");
            }
            return true;
        })
];

const updateProduct = [
    body("name").optional().trim().notEmpty().withMessage("Product name is required."),
    body("description").optional().trim().notEmpty().withMessage("Description is required."),
    body("price").optional().isInt().withMessage("Price is required & must be a number."),
    body("discount").optional().isNumeric().withMessage("Discount is required & must be a number."),
    body("stock").optional().isInt({ min: 0 }).withMessage("Stock is required & must be a non-negative integer."),
    body("category").optional().trim().notEmpty().withMessage("A valid category is required."),
    body("brand").optional().trim().notEmpty().withMessage("Brand is required."),
    body("color").optional().trim(),
    body("size").optional().trim(),
    body("weight").optional().isNumeric().withMessage("Weight must be a number"),
    body("rating").optional().isNumeric().withMessage("Rating must be a number"),
    body("ratingsCount").optional().isInt({ min: 0 }).withMessage("Ratings count must be a non-negative integer"),
    body("image")
        .optional()
        .custom((value, { req }) => {
            if (!req.file) {
                throw new Error("No file uploaded. Please upload a product image.");
            }
            return true;
        })
];

export default {
    createProduct,
    updateProduct
};
