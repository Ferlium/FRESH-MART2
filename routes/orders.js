const express = require("express");
const { placeOrder } = require("../controllers/orderController");

const router = express.Router();

// Place an order
router.post("/", placeOrder);

module.exports = router;