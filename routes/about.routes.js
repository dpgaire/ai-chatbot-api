const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/about.controller');
const protectRoute = require('../middleware/auth.middleware');

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
router.post('/', protectRoute, aboutController.addAbout);
router.get('/', aboutController.getAbout);
router.put('/:id', protectRoute, aboutController.updateAbout);
router.delete('/:id', protectRoute, aboutController.deleteAbout);

module.exports = router;
