const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  category: {
    type: String
  },

  barcode: {
    type: String
  },

  stock: {
    type: Number,
    required: true
  },

  minStock: {
    type: Number,
    default: 5
  }

}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);