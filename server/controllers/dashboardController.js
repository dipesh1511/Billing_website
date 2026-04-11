const Product = require("../models/Product");
const Order = require("../models/Order");

exports.getDashboardStats = async (req, res) => {

  try {
    

    // Total Products
    const totalProducts = await Product.countDocuments();

    // Low Stock
    const lowStock = await Product.countDocuments({
      $expr: { $lte: ["$stock", "$minStock"] }
    });

    // Total Orders
    const totalOrders = await Order.countDocuments();

    // Total Sales
    const orders = await Order.find();
    const totalSales = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),0
    );

    res.json({
      totalProducts,
      lowStock,
      totalOrders,
      totalSales
    });

  } catch (error) {
    
    res.status(500).json({ message: error.message });
  }

};



exports.getLowStockProducts = async (req, res) => {
  try {

    const products = await Product.find({
      $expr: { $lte: ["$stock", "$minStock"] }
    }).limit(5);

    res.json(products || []);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getRecentOrders = async (req, res) => {

  try {

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(orders || []);

  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: error.message });
  }

};

exports.getSalesData = async (req, res) => {
  try {
    const sales = await Order.aggregate([
      {
        $match: {
          createdAt: { $exists: true }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          totalSales: {
            $sum: { $ifNull: ["$totalAmount", 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(sales || []);
  } catch (error) {
    console.log("SALES ERROR:", error); // 👈 MUST
    res.status(500).json({ message: error.message });
  }
};