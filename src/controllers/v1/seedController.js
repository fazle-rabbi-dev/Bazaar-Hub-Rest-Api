import asyncHandler from "express-async-handler";
import slugify from "slugify";

import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import User from "../../models/UserModel.js";
import { ENVIRONMENT } from "../../config/secret.js";
import Product from "../../models/ProductModel.js";
import Category from "../../models/CategoryModel.js";
import Cart from "../../models/CartModel.js";
import Order from "../../models/OrderModel.js";
import { USERS_DATA, PRODUCTS_DATA, CATEGORIES_DATA } from "../../constants/data.js";

const checkPermission = () => {
    if (ENVIRONMENT !== "dev") {
        throw new ApiError(403, "Permission denied.");
    }
};

// =====================================================================================================================
// Seed Users
// =====================================================================================================================
export const seedUsers = asyncHandler(async (req, res) => {
    checkPermission();

    await User.deleteMany({});

    // Insert seed data
    const insertedUsers = await User.create(USERS_DATA);

    res.status(201).json(new ApiResponse(201, insertedUsers, "Users inserted successfully."));
});

// =====================================================================================================================
// Seed Products
// =====================================================================================================================
export const seedProducts = asyncHandler(async (req, res) => {
    checkPermission();

    await Product.deleteMany({});

    const newProductData = PRODUCTS_DATA.map(product => {
        const slug = slugify(`${product.name}-${Date.now()}`, { lower: true, strict: true });
        product.slug = slug;
        return product;
    });

    // Insert seed data
    const insertedProducts = await Product.create(newProductData);

    insertedProducts.forEach(async product => {
        // Find the corresponding category based on the product's category name
        const category = await Category.findOne({
            name: product.category
        });

        // If a category is found, add the product to the category's products array
        if (category) {
            category.products.push(product._id); // Assuming 'products' is the field in Category to store product references
            await category.save(); // Save the updated category
            console.log(`Product '${product.name}' added to category '${category.name}'`);
        } else {
            console.log(`No category found for product '${product.name}'`);
        }
    });

    res.status(201).json(new ApiResponse(201, insertedProducts, "Products inserted successfully."));
});

// =====================================================================================================================
// Seed Categories
// =====================================================================================================================
export const seedCategories = asyncHandler(async (req, res) => {
    checkPermission();

    await Category.deleteMany({});

    // Insert seed data
    const insertedCategories = await Category.create(CATEGORIES_DATA);

    res.status(201).json(new ApiResponse(201, CATEGORIES_DATA, "Categories inserted successfully."));
});

// =====================================================================================================================
// Seed Carts
// =====================================================================================================================
export const seedCarts = asyncHandler(async (req, res) => {
    checkPermission();

    await Cart.deleteMany({});

    // Insert seed data
    const insertedCategories = await Cart.create(CARTS_DATA);

    res.status(201).json(new ApiResponse(201, CATEGORIES_DATA, "Carts inserted successfully."));
});

// =====================================================================================================================
// Seed Orders
// =====================================================================================================================
export const seedOrders = asyncHandler(async (req, res) => {
    checkPermission();

    await Order.deleteMany({});

    // Insert seed data
    const insertedCategories = await Order.create(ORDERS_DATA);

    res.status(201).json(new ApiResponse(201, CATEGORIES_DATA, "Orders inserted successfully."));
});
