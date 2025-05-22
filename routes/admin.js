const express = require("express");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const Category = require("../models/category");
const Product = require("../models/product");

const router = express.Router();

// Admin creates a category
router.post("/category", verifyToken, isAdmin, async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.status(201).json({ message: "Category created successfully!" });
  } catch (error) {
    res.status(500).json(error);
  }
});

// Admin creates a product
router.post("/product", verifyToken, isAdmin, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({ message: "Product created successfully!" });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;