import asyncHandler from "express-async-handler";

import ApiError from "../../utils/ApiError.js";
import { successResponse } from "../../utils/ApiResponse.js";
import Order from "../../models/OrderModel.js";
import Cart from "../../models/CartModel.js";
import { validateDocumentId } from "../../utils/helpers.js"


// =====================================================================================================================
// Create Order
// =====================================================================================================================
export const createOrder = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "Cart is empty. Cannot create an order.");
    }

    // Calculate total price
    const totalPrice = cart.items.reduce((total, item) => {
        return total + item.quantity * item.product.price;
    }, 0);

    const orderData = {
        user: userId,
        products: cart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity
        })),
        totalPrice
    };

    const order = new Order(orderData);
    await order.save();

    // Clear user's cart
    cart.items = [];
    await cart.save();

    successResponse(res, {
        statusCode: 200,
        message: "Order created successfully.",
        data: { order }
    });
});

// =====================================================================================================================
// Get Single Order
// =====================================================================================================================
export const getOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userRole = req.user.role;
    const loggedInUser = req.user._id;

    const order = await Order.findById(orderId).populate("user", "name username email").populate("products.product", "name price");

    if (!order) {
        throw new ApiError(404, "Order not found.");
    }

    // Check if the user is not an admin and does not own the order
    if (userRole !== "admin" && order.user._id !== loggedInUser) {
        throw new ApiError(403, "Sorry, you don't have the permission to perform this operation.");
    }

    successResponse(res, {
        statusCode: 200,
        message: "Order retrieved successfully.",
        data: { order }
    });
});

// =====================================================================================================================
// Get All Orders (with optional pagination)
// =====================================================================================================================
export const getOrders = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { page = 1, limit = 10 } = req.query;

    let orders;
    if (userRole === "user") {
        orders = await Order.find({ user: userId })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate("products.product", "name price");
    } else {
        // If admin is requesting to get all orders
        const userId = req.query.userId;
        
        if(!validateDocumentId(userId)){
          throw new ApiError(
              400,
              "Oops! user id is invalid."
            )
        }
        
        // Fetch All Orders Of A Single User
        if (userId) {
            orders = await Order.find({ user: userId })
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .populate("products.product", "name price");
        }
        // Fetch All Orders Of All Users
        else {
            orders = await Order.find({})
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .populate("products.product", "name price");
        }
    }

    if (!orders || orders.length === 0) {
        throw new ApiError(404, "Orders not found.");
    }

    const totalPages = Math.ceil(orders.length / limit);

    successResponse(res, {
        statusCode: 200,
        message: "Orders retrieved successfully.",
        data: {
            orders,
            pagination: {
                currentPage: page,
                prevPage: page - 1 > 0 ? page - 1 : null,
                nextPage: page + 1 < totalPages ? page + 1 : null,
                totalPages,
                totalOrder: orders.length,
                limit
            }
        }
    });
});

// =====================================================================================================================
// Update Order Status
// =====================================================================================================================
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.query;
    const userRole = req.user.role;
    const loggedInUser = req.user._id;

    const allowedStatus = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!allowedStatus.includes(status)) {
        throw new ApiError(400, "Oops! Invalid status.");
    }

    // Allow user to => only cancel an order
    if (userRole !== "admin" && status !== "cancelled") {
        throw new ApiError(403, "Sorry, you don't have the permission to perform this operation.");
    }

    // Prevent cancelling order that is not creted by logged-in user
    if (userRole !== "admin" && status === "cancelled") {
        const order = await findById(orderId);

        if (!order) {
            throw new ApiError(404, "Order not found.");
        }

        if (order.user !== loggedInUser) {
            {
                throw new ApiError(403, "Sorry, you don't have the permission to perform this operation.");
            }
        }
    }

    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true, runValidators: true });

    if (!order) {
        throw new ApiError(404, "Order not found.");
    }

    successResponse(res, {
        statusCode: 200,
        message: "Order status updated successfully.",
        data: { order }
    });
});

// =====================================================================================================================
// Delete Order
// =====================================================================================================================
export const deleteOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
        throw new ApiError(404, "Order not found.");
    }

    successResponse(res, {
        statusCode: 200,
        message: "Order deleted successfully."
    });
});
