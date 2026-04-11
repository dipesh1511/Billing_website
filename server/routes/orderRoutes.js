const express = require("express");
const router = express.Router();

const { createOrder,getAllOrders,updatePayment,getDashboardData } = require("../controllers/orderController");

router.post("/", createOrder);
router.get("/", getAllOrders);
router.put("/update-payment/:id", updatePayment);
router.get("/dashboard", getDashboardData);

module.exports = router;