const router = require("express").Router();
const authMiddleware = require("../middleware/auth.middleware");

const authRoutes = require("./auth-routes");
const userRoutes = require("./user-routes");
const adminRoutes = require("./admin-routes");
const eventRoutes = require("./event-routes");
const categoryRoutes = require("./category-routes");
const tagRoutes = require("./tag-routes");
const analyticsRoutes = require("./analytics-routes");

router.get("/", (req, res) => {
  res.redirect('/api-docs');
});

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

router.use("/auth", authRoutes);

router.use("/users", authMiddleware(), userRoutes);
router.use("/admin", authMiddleware(), adminRoutes);
router.use("/events", authMiddleware(), eventRoutes);
router.use("/categories", authMiddleware(), categoryRoutes);
router.use("/tags", authMiddleware(), tagRoutes);
router.use("/analytics", authMiddleware(), analyticsRoutes);

module.exports = router;
