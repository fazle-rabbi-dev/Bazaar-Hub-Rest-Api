import asyncHandler from "express-async-handler";

import ApiError from "../../utils/ApiError.js";
import ApiResponse, { successResponse } from "../../utils/ApiResponse.js";
import Cart from "../../models/CartModel.js";
import Product from "../../models/ProductModel.js";


// =====================================================================================================================
// Add Item Into Cart
// =====================================================================================================================
export const addItemToCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    const cartItem = {
        product: productId,
        quantity
    };

    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
        throw new ApiError(404, "Failed to add item in the cart. Product not found.");
    }
    
    // Check if requested quantity is greater than available stock
    if (quantity > existingProduct.stock) {
        throw new ApiError(400, "Insufficient stock.");
    }
    
    const existingCart = await Cart.findOne({ user: userId });

    let newCart;
    // If the cart exists, update the cart with the new product
    if (existingCart) {
        const productIndex = existingCart.items.findIndex(item => item.product._id.toString() === productId);
        console.log({ productIndex });

        if (productIndex > -1) {
            throw new ApiError(409, "Item is already in the cart.");
        }

        // If the product does not exist in the cart, add it
        existingCart.items.push(cartItem);
        await existingCart.save();
    } else {
        // If the cart does not exist, create a new cart
        newCart = new Cart({
            user: userId,
            items: [cartItem]
        });
        await newCart.save();
    }

    successResponse(res, {
        statusCode: 201,
        message: "Item added to cart successfully.",
        data: { cart: newCart || existingCart }
    });
});

// =====================================================================================================================
// Get Cart
// =====================================================================================================================
export const getCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const existingCart = await Cart.findOne({ user: userId })
        // .populate("user")
        .populate({
            path: "items",
            populate: {
                path: "product",
                model: "Product"
            }
        });

    if (!existingCart) {
        throw new ApiError(404, "Cart not found.");
    }

    successResponse(res, {
        statusCode: 200,
        message: "Cart found successfully.",
        data: { cart: existingCart }
    });
});

// =====================================================================================================================
// Update Cart Item Quantity [increment/decrement]
// =====================================================================================================================
export const updateCartItem = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { productId, quantity } = req.body;
    const { action } = req.query;
    
    if(!action?.trim() || !["increment", "decrement"].includes(action)){
      throw new ApiError(
          400,
          "A valid action is required in the query parameter. Value can be: increment/decrement"
        )
    };
    
    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
        throw new ApiError(404, "Failed to add item in the cart. Product not found.");
    }
    
    // Check if requested quantity is greater than available stock
    if (quantity > existingProduct.stock) {
        throw new ApiError(400, "Insufficient stock.");
    }
    
    const existingCart = await Cart.findOne({ user: userId });

    if (!existingCart) {
        throw new ApiError(404, "Cart not found.");
    }

    const productIndex = existingCart.items.findIndex(item => item.product._id.toString() === productId);
    const currentQuantity = parseInt(existingCart.items[productIndex].quantity);
    
    let newQuantity;
    if(action === "increment"){
      newQuantity = currentQuantity + parseInt(quantity);
    } else {
      newQuantity = currentQuantity - parseInt(quantity);
    }

    existingCart.items[productIndex].quantity = newQuantity;
    await existingCart.save();

    successResponse(res, {
        statusCode: 201,
        message: "Cart item updated successfully.",
        data: { cart: existingCart }
    });
});

// =====================================================================================================================
// Remove Cart Item
// =====================================================================================================================
export const removeCartItem = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { productId } = req.params;

    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
        throw new ApiError(404, "Failed to add item in the cart. Product not found.");
    }

    const existingCart = await Cart.findOne({ user: userId });

    if (!existingCart) {
        throw new ApiError(404, "Cart not found.");
    }

    if (existingCart.items.length === 0) {
        throw new ApiError(400, "Cart is already empty.");
    }

    const productIndex = existingCart.items.findIndex(item => item.product._id.toString() === productId);
    existingCart.items.splice(productIndex, 1);
    await existingCart.save();

    successResponse(res, {
        statusCode: 200,
        message: "Cart item removed successfully."
    });
});

// =====================================================================================================================
// Clear Cart
// =====================================================================================================================
export const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const existingCart = await Cart.findOne({ user: userId });
    if (!existingCart) {
        throw new ApiError(404, "Cart not found.");
    }

    if (existingCart.items.length === 0) {
        throw new ApiError(400, "Cart is already empty.");
    }

    existingCart.items = [];
    await existingCart.save();

    successResponse(res, {
        statusCode: 200,
        message: "Cart cleared successfully."
    });
});
