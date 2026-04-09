const express = require("express");
const router = express.Router();

const { getDashboardStats,getLowStockProducts,getRecentOrders,getSalesData } = require("../controllers/dashboardController.js");

router.get("/", getDashboardStats);
router.get("/low-stock", getLowStockProducts);
router.get("/recent-orders", getRecentOrders);
router.get("/sales", getSalesData);

module.exports = router;