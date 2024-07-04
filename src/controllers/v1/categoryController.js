import asyncHandler from "express-async-handler";
import slugify from "slugify";

import ApiError from "../../utils/ApiError.js";
import ApiResponse, { successResponse } from "../../utils/ApiResponse.js";
import Category from "../../models/CategoryModel.js";


// =====================================================================================================================
// Create Category
// =====================================================================================================================
export const createCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const existingCategory = await Category.findOne({ name }).lean();

    if (existingCategory) {
        throw new ApiError(409, "This category already exist.");
    }

    const category = new Category({ name, description });
    await category.save();

    successResponse(res, {
        statusCode: 201,
        message: "Category created successfully.",
        data: { category }
    });
});

// =====================================================================================================================
// Get All Category
// =====================================================================================================================
export const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find().populate("products").lean();

    if (!categories || categories.length === 0) {
        throw new ApiError(404, "Categories not found.");
    }

    successResponse(res, {
        statusCode: 200,
        message: "Categories fetched successfully.",
        data: { categories }
    });
});

// =====================================================================================================================
// Get Single Category
// =====================================================================================================================
export const getCategory = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const category = await Category.findOne({ slug });

    if (!category) {
        throw new ApiError(404, "Category not found with the given slug.");
    }

    successResponse(res, {
        statusCode: 200,
        message: "Category fetched successfully.",
        data: { category }
    });
});

// =====================================================================================================================
// Update Category
// =====================================================================================================================
export const updateCategory = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const allowedUpdates = ["name", "description"];

    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(field => allowedUpdates.includes(field));

    if (updates.length === 0 || !isValidOperation) {
        throw new ApiError(400, "Invalid update. Please provide required fields to update category.");
    }

    const existingCategory = await Category.findOne({ slug });
    if (!existingCategory) {
        throw new ApiError(404, "Category not found with the given slug.");
    }

    const updateFields = req.body;

    if (updateFields.name) {
        const existingCategory = await Category.findOne({ name: updateFields.name });

        if (existingCategory) {
            throw new ApiError(409, "This category is already exist.");
        }

        updateFields.slug = slugify(updateFields.name, { lower: true, strict: true });
    }

    const category = await Category.findOneAndUpdate({ slug }, { $set: updateFields }, { new: true, runValidators: true });

    successResponse(res, {
        statusCode: 200,
        message: "Category updated successfully.",
        data: { category }
    });
});

// =====================================================================================================================
// Delete Category
// =====================================================================================================================
export const deleteCategory = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const category = await Category.findOneAndDelete({ slug });

    if (!category) {
        throw new ApiError(404, "Category not found with the given slug.");
    }

    successResponse(res, {
        statusCode: 200,
        message: "Category deleted successfully."
    });
});
