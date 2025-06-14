const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const tokenRoutes = require("./routes/token");


dotenv.config(); // Load environment variables

const app = express();

app.use(express.json());

// Load Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/token", tokenRoutes);


const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("✅ Ejienry Fresh Mart Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  });

  app.listen(7000);

  // Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "THE BEST OR NOTHING!" });
});
