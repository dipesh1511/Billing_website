const Order = require("../models/Order");
const Product = require("../models/Product");

exports.createOrder = async (req, res) => {

  try {

    const { items, paymentMethod, customerName, customerPhone, paidAmount } = req.body;
    let totalAmount = 0;

    // calculate total
    for (let item of items) {
        totalAmount += item.price * item.quantity;
    }

    // calculate remaining
    const remainingAmount = totalAmount - paidAmount;

    // status logic
    let status = "unpaid";

    if (remainingAmount === 0) status = "paid";
    else if (paidAmount > 0) status = "due";

    for (let item of items) {

      const product = await Product.findById(item.productId);

      if (!product)
        return res.status(404).json({ message: "Product not found" });

      if (product.stock < item.quantity)
        return res.status(400).json({ message: "Not enough stock" });

      totalAmount += product.price * item.quantity;

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
        items,
        totalAmount,
        paidAmount,
        remainingAmount,
        status,
        paymentMethod,
        customerName,
        customerPhone
    });

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};


exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updatePayment = async (req, res) => {
  try {

    const { amount } = req.body;

    const order = await Order.findById(req.params.id);

    order.paidAmount += amount;

    order.remainingAmount = order.totalAmount - order.paidAmount;

    // 🔥 FIX (important)
    if (order.remainingAmount <= 0) {
      order.status = "paid";
      order.remainingAmount = 0;
    } else if (order.paidAmount > 0) {
      order.status = "due";
    } else {
      order.status = "unpaid";
    }

    await order.save();

    res.json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getDashboardData = async (req, res) => {
  try {
    const orders = await Order.find();
    
    const today = new Date();

    // 🔥 LAST 7 DAYS
    const dailyData = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);

      const key = d.toISOString().split("T")[0];
      dailyData[key] = 0;
    }

    // 🔥 LAST 7 MONTHS
    const monthlyData = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setMonth(today.getMonth() - i);

      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      monthlyData[key] = 0;
    }

    // 🔥 FILL DATA
    orders.forEach((o) => {
      if (!o.createdAt) return;

      const d = new Date(o.createdAt);

      const dayKey = d.toISOString().split("T")[0];
      const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`;

      if (dailyData[dayKey] !== undefined) {
        dailyData[dayKey] += o.totalAmount;
      }

      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey] += o.totalAmount;
      }
    });

    // 🔥 TOP PRODUCTS
    const productMap = {};

    orders.forEach((o) => {
      o.items?.forEach((item) => {
        if (!productMap[item.name]) {
          productMap[item.name] = 0;
        }
        productMap[item.name] += item.quantity;
      });
    });

    const topProducts = Object.entries(productMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    res.json({
      dailyData,
      monthlyData,
      topProducts,
    });

    console.log(res.json);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  
};
