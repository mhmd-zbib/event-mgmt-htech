const router = require("express").Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication operations
 *   - name: Users
 *     description: User management operations
 *   - name: Admin
 *     description: Admin-only operations for user management
 *   - name: Events
 *     description: Event operations
 *   - name: Categories
 *     description: Category operations
 *   - name: Participants
 *     description: Event participation operations
 *   - name: Tags
 *     description: Tag operations for events
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

const authRoutes = require("./auth-routes");
const userRoutes = require("./user-routes");
const adminRoutes = require("./admin-routes");
const eventRoutes = require("./event-routes");
const categoryRoutes = require("./category-routes");
const participantRoutes = require("./participant-routes");
const tagRoutes = require("./tag-routes");

/**
 * @swagger
 * /:
 *   get:
 *     summary: Redirects to API documentation
 *     description: Redirects users to the Swagger API documentation
 *     tags: [System]
 *     responses:
 *       302:
 *         description: Redirects to API documentation
 */
router.get("/", (req, res) => {
  res.redirect('/api-docs');
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the API is running correctly
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is up and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 time:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/admin", adminRoutes);
router.use("/events", eventRoutes);
router.use("/categories", categoryRoutes);
router.use("/tags", tagRoutes);
// Separate mounting path for participant routes to avoid conflict
router.use("/", participantRoutes);

module.exports = router;
