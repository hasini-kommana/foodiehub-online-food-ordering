require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Food = require("../models/Food");

const sampleFoods = [
  { name: "Classic Veg Burger", description: "Crispy vegetable patty, lettuce and house sauce.", category: "Burgers", price: 149, vegetarian: true, image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=700" },
  { name: "Paneer Tikka Pizza", description: "Cheesy pizza topped with paneer tikka and peppers.", category: "Pizza", price: 279, vegetarian: true, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700" },
  { name: "Margherita Pizza", description: "Classic tomato, basil and mozzarella pizza.", category: "Pizza", price: 229, vegetarian: true, image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=700" },
  { name: "Chicken Burger", description: "Juicy chicken patty with crunchy lettuce.", category: "Burgers", price: 199, vegetarian: false, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700" },
  { name: "Veg Hakka Noodles", description: "Wok-tossed noodles with fresh vegetables.", category: "Asian", price: 169, vegetarian: true, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=700" },
  { name: "Chicken Biryani", description: "Fragrant basmati rice with aromatic spices.", category: "Indian", price: 249, vegetarian: false, image: "https://images.unsplash.com/photo-1563379091339-03246963d96a?w=700" },
  { name: "Masala Dosa", description: "Golden dosa served with potato masala and chutneys.", category: "Indian", price: 99, vegetarian: true, image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=700" },
  { name: "Chocolate Brownie", description: "Rich chocolate brownie for a sweet finish.", category: "Desserts", price: 119, vegetarian: true, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=700" },
  { name: "Cold Coffee", description: "Chilled creamy coffee served over ice.", category: "Drinks", price: 89, vegetarian: true, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=700" },
  { name: "French Fries", description: "Crispy golden fries with a pinch of seasoning.", category: "Sides", price: 99, vegetarian: true, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=700" }
];

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI missing. Create .env first.");
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing. Create .env first.");
  await mongoose.connect(process.env.MONGODB_URI);
  await Food.deleteMany({});
  await Food.insertMany(sampleFoods);
  const email = (process.env.ADMIN_EMAIL || "admin@foodiehub.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeThisAdminPassword123!";
  let admin = await User.findOne({ email });
  if (!admin) admin = await User.create({ name: process.env.ADMIN_NAME || "FoodieHub Admin", email, password, role: "admin" });
  else if (admin.role !== "admin") { admin.role = "admin"; await admin.save(); }
  console.log(`Seeded ${sampleFoods.length} foods.`);
  console.log(`Admin login: ${email}`);
  console.log("Use the ADMIN_PASSWORD value from your .env file.");
  await mongoose.disconnect();
}
seed().catch(err => { console.error(err); process.exit(1); });
