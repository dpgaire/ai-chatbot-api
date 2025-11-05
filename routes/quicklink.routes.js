const express = require('express');
const router = express.Router();
const quickLinkController = require('../controllers/quicklink.controller');
const protectRoute = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

/**
 * @swagger
 * tags:
 *   name: QuickLinks
 *   description: Quick Link management
 */

/**
 * @swagger
 * /api/quicklinks:
 *   post:
 *     summary: Add a new quick link
 *     tags: [QuickLinks]
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
 *               link:
 *                 type: string
 *     responses:
 *       201:
 *         description: Quick Link added successfully
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all quick links
 *     tags: [QuickLinks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of quick links
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/quicklinks/{id}:
 *   get:
 *     summary: Get a quick link by ID
 *     tags: [QuickLinks]
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
 *         description: A single quick link
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a quick link
 *     tags: [QuickLinks]
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
 *               link:
 *                 type: string
 *     responses:
 *       200:
 *         description: Quick Link updated successfully
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a quick link
 *     tags: [QuickLinks]
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
 *         description: Quick Link deleted successfully
 *       500:
 *         description: Server error
 */

router.post('/', protectRoute, authorize(['superAdmin', 'Admin']), quickLinkController.addQuickLink);
router.get('/', protectRoute, authorize(['superAdmin', 'Admin']), quickLinkController.getQuickLinks);
router.get('/:id', protectRoute, authorize(['superAdmin', 'Admin']), quickLinkController.getQuickLinkById);
router.put('/:id', protectRoute, authorize(['superAdmin', 'Admin']), quickLinkController.updateQuickLink);
router.delete('/:id', protectRoute, authorize(['superAdmin', 'Admin']), quickLinkController.deleteQuickLink);

module.exports = router;
