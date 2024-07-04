import { body, query, check } from "express-validator";

const createCategory = [
    body("name").trim().isLength({ min: 4 }).withMessage("Name is required & Must be at least 4 characters long."),
    body("description").trim().isLength({ min: 5 }).withMessage("Description is required & Must be at least 5 characters long.")
];

const updateCategory = [
    body("name").optional().trim().isLength({ min: 3 }).withMessage("Category name is must be at least 3 characters long."),
    body("description").optional().trim().isLength({ min: 5 }).withMessage("Description is required & Must be at least 5 characters long.")
];

export default {
    createCategory,
    updateCategory
};
