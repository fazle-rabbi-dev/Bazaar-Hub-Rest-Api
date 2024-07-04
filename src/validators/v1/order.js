import { check } from "express-validator";
import { validateDocumentId } from "../../utils/helpers.js";

const getOrder = [
    check("orderId").custom((value, { req }) => {
        if (!validateDocumentId(value)) {
            throw new Error("Order id is invalid.");
        }

        return true;
    })
];

const updateOrderStatus = [
    check("orderId").custom((value, { req }) => {
        if (!validateDocumentId(value)) {
            throw new Error("Order id is invalid.");
        }

        return true;
    })
];

const deleteOrder = [
    check("orderId").custom((value, { req }) => {
        if (!validateDocumentId(value)) {
            throw new Error("Order id is invalid.");
        }

        return true;
    })
];

export default {
    getOrder,
    updateOrderStatus,
    deleteOrder
};
