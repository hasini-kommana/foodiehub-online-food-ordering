const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  food: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1, max: 50 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [orderItemSchema], validate: v => v.length > 0 },
  deliveryAddress: { type: String, required: true, trim: true, maxlength: 500 },
  phone: { type: String, required: true, trim: true, maxlength: 20 },
  subtotal: { type: Number, required: true, min: 0 },
  deliveryFee: { type: Number, required: true, min: 0, default: 30 },
  total: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ["Cash on Delivery"], default: "Cash on Delivery" },
  status: { type: String, enum: ["Placed", "Confirmed", "Preparing", "Out for delivery", "Delivered", "Cancelled"], default: "Placed" }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
