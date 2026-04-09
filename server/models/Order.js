const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    customerName: String,
    customerPhone: String,
    paidAmount: Number,
    remainingAmount: Number,
      status: {
        type: String,
        enum: ["paid", "due", "unpaid"],
        default: "unpaid"
      },
      
      items: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
          },
          name: String,
          price: Number,
          quantity: Number
        }
      ],

  totalAmount: Number,

  paymentMethod: {
    type: String,
    enum: ["cash", "upi", "card"],
    default: "cash"
  }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);