const Food = require("../models/Food");
const Order = require("../models/Order");

async function dashboard(req, res, next) {
  try {
    const [foodCount, orderCount, userCount, recentOrders] = await Promise.all([
      Food.countDocuments(), Order.countDocuments(), require("../models/User").countDocuments(),
      Order.find().populate("user", "name email").sort({ createdAt: -1 }).limit(10)
    ]);
    res.json({ stats: { foodCount, orderCount, userCount }, orders: recentOrders });
  } catch (err) { next(err); }
}

async function allFoods(req, res, next) {
  try { res.json({ foods: await Food.find().sort({ createdAt: -1 }) }); }
  catch (err) { next(err); }
}

async function createFood(req, res, next) {
  try {
    const { name, description, category, price, image, vegetarian, available } = req.body;
    const food = await Food.create({ name, description, category, price, image, vegetarian, available });
    res.status(201).json({ food });
  } catch (err) { next(err); }
}

async function updateFood(req, res, next) {
  try {
    const allowed = ["name", "description", "category", "price", "image", "vegetarian", "available"];
    const updates = {};
    for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];
    const food = await Food.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!food) return res.status(404).json({ message: "Food item not found." });
    res.json({ food });
  } catch (err) { next(err); }
}

async function deleteFood(req, res, next) {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ message: "Food item not found." });
    res.json({ message: "Food item deleted." });
  } catch (err) { next(err); }
}

async function allOrders(req, res, next) {
  try { res.json({ orders: await Order.find().populate("user", "name email").sort({ createdAt: -1 }) }); }
  catch (err) { next(err); }
}

async function updateOrderStatus(req, res, next) {
  try {
    const allowed = ["Confirmed", "Preparing", "Out for delivery", "Delivered", "Cancelled"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid order status." });
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json({ order });
  } catch (err) { next(err); }
}

module.exports = { dashboard, allFoods, createFood, updateFood, deleteFood, allOrders, updateOrderStatus };
