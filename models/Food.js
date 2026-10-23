const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 500 },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 1 },
  image: { type: String, default: "" },
  vegetarian: { type: Boolean, default: true },
  available: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Food", foodSchema);
