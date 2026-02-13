// Order model
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        items: [
            {
                name: { type: String, required: true },
                qty: { type: Number, required: true },
                price: { type: Number, required: true },
                total: { type: Number, required: true }
            }
        ],

        totalAmount: {
            type: Number,
            required: true
        },

        orderId: {
            type: Number,
            // required: true  <-- Removed to allow updating old orders without IDs
        },

        paymentDone: {
            type: Boolean,
            default: false
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;

/**
  items[] → supports multiple snacks

totalAmount → fast dashboard calculation

paymentDone → pending vs paid

createdBy → staff / owner tracking

timestamps → daily & monthly analytic
 */