const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/library.controller');
const protectRoute = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

/**
 * @swagger
 * tags:
 *   name: Library
 *   description: Library management
 */

/**
 * @swagger
 * /api/library:
 *   post:
 *     summary: Add a new library item
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Introduction to AI
 *               description:
 *                 type: string
 *                 example: Learn the basics of artificial intelligence.
 *               url:
 *                 type: string
 *                 example: https://dpgaire.github.io/image-server/Books/js_interview.pdf
 *               author:
 *                 type: string
 *                 example: John Doe
 *               coverImage:
 *                 type: string
 *                 example: https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGRsqSFh2iI4mBSjeniAAmodVMDUU_KO-yCQ&s
 *     responses:
 *       201:
 *         description: Library item added successfully
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all library items
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of library items
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/library/{id}:
 *   get:
 *     summary: Get a library item by ID
 *     tags: [Library]
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
 *         description: A single library item
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a library item
 *     tags: [Library]
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
 *               title:
 *                 type: string
 *                 example: Introduction to AI
 *               description:
 *                 type: string
 *                 example: Learn the basics of artificial intelligence.
 *               url:
 *                 type: string
 *                 example: https://dpgaire.github.io/image-server/Books/js_interview.pdf
 *               author:
 *                 type: string
 *                 example: John Doe
 *               coverImage:
 *                 type: string
 *                 example: https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGRsqSFh2iI4mBSjeniAAmodVMDUU_KO-yCQ&s
 *     responses:
 *       200:
 *         description: Library item updated successfully
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a library item
 *     tags: [Library]
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
 *         description: Library item deleted successfully
 *       500:
 *         description: Server error
 */

router.post('/', protectRoute, authorize(['superAdmin', 'Admin','User']), libraryController.addLibrary);
router.get('/', protectRoute, authorize(['superAdmin', 'Admin','User']), libraryController.getLibraries);
router.get('/:id', protectRoute, authorize(['superAdmin', 'Admin','User']), libraryController.getLibraryById);
router.put('/:id', protectRoute, authorize(['superAdmin', 'Admin','User']), libraryController.updateLibrary);
router.delete('/:id', protectRoute, authorize(['superAdmin', 'Admin','User']), libraryController.deleteLibrary);

module.exports = router;