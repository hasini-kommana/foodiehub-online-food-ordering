const router = require("express").Router();
const { listFoods, listCategories } = require("../controllers/foodController");
router.get("/", listFoods);
router.get("/categories", listCategories);
module.exports = router;
