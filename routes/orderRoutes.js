const router = require("express").Router();
const { createOrder, myOrders, getOrder } = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
router.use(protect);
router.post("/", createOrder);
router.get("/mine", myOrders);
router.get("/:id", getOrder);
module.exports = router;
