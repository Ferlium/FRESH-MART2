const Order = require("../models/order");

const placeOrder = async (req, res) => {
  try {
    const { userId, items } = req.body;

    // Calculate total price
    let totalPrice = 0;
    items.forEach(item => {
      totalPrice += item.quantity * item.price;
    });

    const newOrder = new Order({
      user: userId,
      items,
      total: totalPrice
    });

    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully!", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Error placing order", error });
  }
};

module.exports = { placeOrder };