const Food = require("../models/Food");
const Order = require("../models/Order");

async function createOrder(req, res, next) {
  try {
    const { items, deliveryAddress, phone } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: "Your cart is empty." });
    if (!deliveryAddress?.trim() || !phone?.trim()) return res.status(400).json({ message: "Delivery address and phone number are required." });
    const quantities = new Map();
    for (const item of items) {
      const id = String(item.foodId || "");
      const qty = Number(item.quantity);
      if (!/^[a-f\d]{24}$/i.test(id) || !Number.isInteger(qty) || qty < 1 || qty > 50) {
        return res.status(400).json({ message: "One or more cart items are invalid." });
      }
      quantities.set(id, (quantities.get(id) || 0) + qty);
    }
    const foods = await Food.find({ _id: { $in: [...quantities.keys()] }, available: true });
    if (foods.length !== quantities.size) return res.status(400).json({ message: "Some items are no longer available. Refresh your menu." });
    const orderItems = foods.map(food => ({
      food: food._id, name: food.name, price: food.price, quantity: quantities.get(String(food._id))
    }));
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal >= 499 ? 0 : 30;
    const order = await Order.create({
      user: req.user._id, items: orderItems, deliveryAddress, phone,
      subtotal, deliveryFee, total: subtotal + deliveryFee, paymentMethod: "Cash on Delivery"
    });
    res.status(201).json({ order });
  } catch (err) { next(err); }
}

async function myOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) { next(err); }
}

async function getOrder(req, res, next) {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json({ order });
  } catch (err) { next(err); }
}

module.exports = { createOrder, myOrders, getOrder };
