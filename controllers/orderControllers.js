const Order = require("../models/order");
const Product = require("../models/product");

const placeOrder = async (req, res) => {
  try {
    const { userId, items } = req.body;

    // Validate stock availability
    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
    }

    // Deduct stock
    for (let item of items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

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
