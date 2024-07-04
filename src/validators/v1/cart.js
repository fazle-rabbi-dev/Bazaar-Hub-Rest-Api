import { body } from "express-validator";
import { validateDocumentId } from "../../utils/helpers.js";

const addItemToCart = [
    body("productId").custom((value, { req }) => {
        if (!validateDocumentId(value)) {
            throw new Error("Product id is invalid.");
        }

        return true;
    }),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity is required & must be a positive integer.")
];

const updateCartItem = [
    body("productId").custom((value, { req }) => {
        if (!validateDocumentId(value)) {
            throw new Error("Product id is invalid.");
        }

        return true;
    }),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity is required & must be a positive integer.")
];

export default {
    addItemToCart,
    updateCartItem
};
