const express = require('express');
const router = express.Router();
const promptStorageController = require('../controllers/prompt-storage.controller');
const protectRoute = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: PromptStorage
 *   description: Prompt Storage management
 */

/**
 * @swagger
 * /api/prompt-storage:
 *   post:
 *     summary: Add a new prompt
 *     tags: [PromptStorage]
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
 *               ai_category:
 *                 type: string
 *               prompt:
 *                 type: string
 *     responses:
 *       201:
 *         description: Prompt added successfully
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all prompts
 *     tags: [PromptStorage]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of prompts
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/prompt-storage/{id}:
 *   get:
 *     summary: Get a prompt by ID
 *     tags: [PromptStorage]
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
 *         description: A single prompt
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a prompt
 *     tags: [PromptStorage]
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
 *               ai_category:
 *                 type: string
 *               prompt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Prompt updated successfully
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a prompt
 *     tags: [PromptStorage]
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
 *         description: Prompt deleted successfully
 *       500:
 *         description: Server error
 */

router.post('/', protectRoute, promptStorageController.addPrompt);
router.get('/', protectRoute, promptStorageController.getPrompts);
router.get('/:id', protectRoute, promptStorageController.getPromptById);
router.put('/:id', protectRoute, promptStorageController.updatePrompt);
router.delete('/:id', protectRoute, promptStorageController.deletePrompt);

module.exports = router;
