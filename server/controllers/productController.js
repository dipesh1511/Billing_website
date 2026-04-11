const Product = require("../models/Product");


// ADD PRODUCT
exports.addProduct = async (req, res) => {

  try {

    const product = await Product.create(req.body);

    res.status(201).json(product);

  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: error.message });

  }

};


// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {

  try {

    const products = await Product.find();
    // console.log("Products:", products);
    res.json(products);

  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: error.message });

  }

};


// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {

  try {

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" }
    );

    res.json(product);

  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: error.message });

  }

};


// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {

  try {

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted" });

  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: error.message });

  }

};