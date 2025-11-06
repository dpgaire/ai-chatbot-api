
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const protectRoute = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               fullName:
 *                 type: string
 *               image:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 enum: [superAdmin, Admin, User]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Email, password, and role are required
 *       500:
 *         description: Server error
 */
router.post('/', protectRoute, authorize(['superAdmin']), userController.createUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *       500:
 *         description: Server error
 */
router.get('/', protectRoute, authorize(['superAdmin']), userController.getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single user
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:id', protectRoute, authorize(['superAdmin','Admin','User']), userController.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 enum: [superAdmin, Admin, User]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       500:
 *         description: Server error
 */
router.put('/:id', protectRoute, authorize(['superAdmin']), userController.updateUser);
/**
 * @swagger
 * /api/users/profile/{id}:
 *   put:
 *     summary: Update user profile (self-update)
 *     description: Allows an authenticated user to update their own profile details such as name, email, image, or regenerate API key.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to update (should match the logged-in user's ID)
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Durga Gairhe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "durga@example.com"
 *               image:
 *                 type: string
 *                 format: uri
 *                 example: "https://dpgaire.github.io/image-server/projects/durga.png"
 *               regenerateApiKey:
 *                 type: boolean
 *                 description: Set to true to regenerate a new API key for the user.
 *                 example: true
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     image:
 *                       type: string
 *                     apiKey:
 *                       type: string
 *                       description: Newly generated API key (if regenerateApiKey was true)
 *                       example: "sk_live_xxx_generated_token"
 *                     role:
 *                       type: string
 *                       enum: [superAdmin, Admin, User]
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized — Missing or invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/profile/:id', protectRoute, authorize(['superAdmin','Admin', 'User', ]),userController.updateProfile);



/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       500:
 *         description: Server error
 */
router.delete('/:id', protectRoute, authorize(['superAdmin']), userController.deleteUser);

module.exports = router;
