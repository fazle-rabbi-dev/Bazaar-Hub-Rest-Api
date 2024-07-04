import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import slugify from "slugify";

import Product from "../../models/ProductModel.js";
import Category from "../../models/CategoryModel.js";
import { upload } from "../../middlewares/uploadFile.js";
import ApiResponse, { successResponse } from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import Cloudinary from "../../utils/cloudinary.js";


// =====================================================================================================================
// Create Product
// =====================================================================================================================
export const createProduct = asyncHandler(async (req, res) => {
    const { category, ...product } = req.body;

    const existingProduct = await Product.findOne({ name: product.name });
    if (existingProduct) {
        throw new ApiError(400, "Oops! This product already exist. Try a different product name.");
    }

    const existingCategory = await Category.findOne({ name: category.toLowerCase() });
    if (!existingCategory) {
        throw new ApiError(404, "Invalid category. This category doesn't exist.");
    }

    const filePath = req.file?.path;
    if (filePath) {
        const uploadedImage = await Cloudinary.uploadFile(filePath, "products");

        if (uploadedImage) {
            product.image = {
                url: uploadedImage.secure_url,
                publicId: uploadedImage.public_id
            };
        }
    }

    const createdProduct = await Product.create({
        category,
        ...product
    });

    // After create a product push the product id inside created product category
    await Category.findByIdAndUpdate(existingCategory._id, { $push: { products: createProduct._id } });

    successResponse(res, {
        statusCode: 201,
        message: "Product created successfully.",
        data: { product: createdProduct }
    });
});

// =====================================================================================================================
// Get All Products
// =====================================================================================================================
export const getAllProducts = asyncHandler(async (req, res) => {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sortField = req.query.sortBy || "createdAt";
    const sortOrder = req.query.order === "desc" ? -1 : 1;
    const sort = { [sortField]: sortOrder };

    // Partial Response
    const fields = req.query.fields ? req.query.fields.split(",") : [];

    // Search
    const searchValue = (req.query.search || "").trim();
    const filter = {
        $or: [
            { name: { $regex: searchValue, $options: "i" } },
            { slug: { $regex: searchValue, $options: "i" } },
            { category: { $regex: searchValue, $options: "i" } }
        ]
    };

    const products = await Product.find(filter).select(fields).sort(sort).limit(limit).skip(skip);

    if (!products || products.length === 0) {
        throw new ApiError(404, "Products not found.");
    }

    const totalProducts = await Product.countDocuments(filter);

    successResponse(res, {
        statusCode: 200,
        message: "Products fetched successfully.",
        data: {
            products,
            pagination: {
                totalProduct: totalProducts,
                perPage: limit,
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit)
            }
        }
    });
});

// =====================================================================================================================
// Get Single Product
// =====================================================================================================================
export const getSingleProduct = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const fields = req.query.fields ? req.query.fields.split(",") : [];

    const product = await Product.findOne({ slug }).select(fields);
    if (!product) {
        throw new ApiError(404, "We couldn't find a product with that slug.");
    }

    successResponse(res, {
        statusCode: 200,
        message: "Product found successfully.",
        data: { product }
    });
});

// =====================================================================================================================
// Update Product
// =====================================================================================================================
export const updateProduct = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const updates = Object.keys(req.body);
    const allowedUpdates = [
        "name",
        "description",
        "price",
        "discount",
        "stock",
        "category",
        "brand",
        "color",
        "size",
        "weight",
        "rating",
        "ratingsCount",
        "sold",
        "shipping",
        "image"
    ];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (updates.length === 0 || !isValidOperation) {
        throw new ApiError(400, "Invalid updates! Please ensure you provide all required fields.");
    }

    const existingProduct = await Product.findOne({ slug });
    if (!existingProduct) {
        throw new ApiError(404, "Product not found.");
    }

    const updateFields = req.body;

    // Prevent multiple product with same name
    if (updateFields.name) {
        const existingProduct = await Product.findOne({ name: updateFields.name });

        if (existingProduct) {
            throw new ApiError(409, "The product name is already exist. Try a different product name.");
        }

        // Update slug since product is updated
        updateFields.slug = slugify(updateFields.name, { lower: true, strict: true });
    }

    /*
      ======================================
      ======> Handle Image Update    <======
      ======================================
    */

    const filePath = req.file?.path;
    if (filePath) {
        // Delete Old File
        const publicId = existingProduct.image.publicId;
        if (publicId) {
            await Cloudinary.deleteFile(publicId);
        }

        // Upload New File
        const uploadedImage = await Cloudinary.uploadFile(filePath);
        if (uploadedImage) {
            updateFields.image = {
                url: uploadedImage.secure_url,
                publicId: uploadedImage.public_id
            };
        }
    }

    const product = await Product.findOneAndUpdate({ slug }, { $set: updateFields }, { new: true, runValidators: true });

    successResponse(res, {
        statusCode: 200,
        message: "Product updated successfully.",
        data: { product }
    });
});

// =====================================================================================================================
// Delete Product
// =====================================================================================================================
export const deleteProduct = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const existingProduct = await Product.findOne({ slug });
    if (!existingProduct) {
        throw new ApiError(404, "Product not found.");
    }

    const product = await Product.findOneAndDelete({ slug });

    if (product && existingProduct.image.publicId) {
        await Cloudinary.deleteFile(existingProduct.image.publicId);
    }

    successResponse(res, {
        statusCode: 200,
        message: "Product deleted successfully."
    });
});
