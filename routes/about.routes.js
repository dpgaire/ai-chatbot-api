const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/about.controller');
const protectRoute = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const apiKeyAuth = require('../middleware/apiKey.middleware');

/**
 * @swagger
 * tags:
 *   name: About
 *   description: About management
 */

/**
 * @swagger
 * /api/about:
 *   post:
 *     summary: Add new about information
 *     tags: [About]
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
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: About information added successfully
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get about information
 *     tags: [About]
 *     responses:
 *       200:
 *         description: About information
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/about/{id}:
 *   put:
 *     summary: Update about information
 *     tags: [About]
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
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: About information updated successfully
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete about information
 *     tags: [About]
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
 *         description: About information deleted successfully
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/about/public:
 *   get:
 *     summary: Get about information (Public via API Key)
 *     tags: [About]
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: About information (for public API)
 *       401:
 *         description: Invalid or missing API key
 *       500:
 *         description: Server error
 */
router.post('/', protectRoute, authorize(['superAdmin', 'Admin', 'User']), aboutController.addAbout);
router.get('/', protectRoute, authorize(['superAdmin', 'Admin', 'User']), aboutController.getAbout);
router.get('/public', apiKeyAuth, aboutController.getAbout);
router.put('/:id', protectRoute, authorize(['superAdmin', 'Admin', 'User']), aboutController.updateAbout);
router.delete('/:id', protectRoute, authorize(['superAdmin', 'Admin', 'User']), aboutController.deleteAbout);

module.exports = router;
