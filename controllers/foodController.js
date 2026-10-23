const Food = require("../models/Food");

async function listFoods(req, res, next) {
  try {
    const filter = { available: true };
    if (req.query.category && req.query.category !== "All") filter.category = req.query.category;
    if (req.query.search) filter.name = { $regex: req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    res.json({ foods: await Food.find(filter).sort({ category: 1, name: 1 }) });
  } catch (err) { next(err); }
}

async function listCategories(req, res, next) {
  try { res.json({ categories: await Food.distinct("category", { available: true }) }); }
  catch (err) { next(err); }
}

module.exports = { listFoods, listCategories };
