const express = require("express");
const Order = require("../models/order");
const { placeOrder } = require("../controllers/orderControllers");

const router = express.Router();

// Place an order
router.post("/", placeOrder);

// Get past orders of a specific user
router.get("/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId }).populate("items.product");
    if (!orders.length) return res.status(404).json({ message: "No past orders found" });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching past orders", error });
  }
});

module.exports = router;