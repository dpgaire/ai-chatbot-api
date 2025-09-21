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
router.post('/about', protectRoute, aboutController.addAbout);
router.get('/about', aboutController.getAbout);

module.exports = router;
