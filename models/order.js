// const mongoose = require("mongoose");

// const OrderSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   items: [{
//     product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
//     quantity: { type: Number, required: true },
//   }],
//   total: { type: Number, required: true },
//   status: { type: String, enum: ["pending", "completed", "shipped"], default: "pending" },
// }, { timestamps: true });

// module.exports = mongoose.model("Order", OrderSchema);



// this the new schema with order summary logic
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{ 
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, 
    quantity: { type: Number, required: true }
  }],
  total: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ["pending", "completed", "shipped"], default: "pending" }
}, { timestamps: true });

// Auto-calculate total price before saving
OrderSchema.pre("save", async function (next) {
  let totalPrice = 0;
  for (let item of this.items) {
    const product = await mongoose.model("Product").findById(item.product);
    totalPrice += item.quantity * product.price;
  }
  this.total = totalPrice;
  next();
});

module.exports = mongoose.model("Order", OrderSchema);