const express = require('express');
const router = express.Router();
const trainController = require('../controllers/train.controller');
const protectRoute = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Training
 *   description: Train the AI model
 */

/**
 * @swagger
 * /api/train:
 *   post:
 *     summary: Train the AI model with new data
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Model trained successfully
 *       500:
 *         description: Server error
 */
router.post('/', protectRoute, trainController.train);

module.exports = router;
