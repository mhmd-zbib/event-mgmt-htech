const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authSchema = require('../utils/validation/auth.validation');
const validationMiddleware = require('../middleware/validation.middleware');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: Create a new user account with the provided information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's preferred username
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: User's password
 *                 example: Pa$$w0rd123
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email or username already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Email already in use
 *               statusCode: 409
 *               timestamp: '2025-05-05T12:00:00.000Z'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/register', validationMiddleware(authSchema.register), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate a user
 *     tags: [Auth]
 *     description: Login with email and password to receive a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *                 example: Pa$$w0rd123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Invalid email or password
 *               statusCode: 401
 *               timestamp: '2025-05-05T12:00:00.000Z'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/login', validationMiddleware(authSchema.login), authController.login);

module.exports = router;