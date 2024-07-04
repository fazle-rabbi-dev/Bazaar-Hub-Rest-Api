import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                quantity: { type: Number, required: true }
            }
        ],
        totalPrice: { type: Number, required: true },
        status: {
            type: String,
            enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
            default: "pending"
        }
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
