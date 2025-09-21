const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat with the AI assistant
 */

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Chat with the AI assistant
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *     responses:
 *       200:
 *         description: The AI assistant's response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.post('/', chatController.chat);

module.exports = router;
