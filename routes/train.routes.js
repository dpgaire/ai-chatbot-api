const express = require('express');
const router = express.Router();
const trainController = require('../controllers/train.controller');
const protectRoute = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

/**
 * @swagger
 * tags:
 *   name: Training
 *   description: Train and manage the AI model data
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
 *             required:
 *               - content
 *             properties:
 *               id:
 *                 type: string
 *                 description: Optional unique ID for the document.
 *               category:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *                 description: The main text content to be embedded.
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Model trained successfully
 *       400:
 *         description: Bad request, missing required fields
 *       500:
 *         description: Server error
 */
router.post('/', protectRoute, authorize(['superAdmin', 'Admin']), trainController.train);

/**
 * @swagger
 * /api/train:
 *   get:
 *     summary: Get all training data
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all training data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Server error
 */
router.get('/', protectRoute, authorize(['superAdmin', 'Admin']), trainController.getAllTrainData);

/**
 * @swagger
 * /api/train/{id}:
 *   put:
 *     summary: Update a training data entry
 *     tags: [Training]
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
 *               category:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Data updated successfully
 *       404:
 *         description: Data point not found
 *       500:
 *         description: Server error
 */
router.put('/:id', protectRoute, authorize(['superAdmin', 'Admin']), trainController.updateTrainData);

/**
 * @swagger
 * /api/train/{id}:
 *   delete:
 *     summary: Delete a training data entry
 *     tags: [Training]
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
 *         description: Data deleted successfully
 *       404:
 *         description: Data point not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protectRoute, authorize(['superAdmin', 'Admin']), trainController.deleteTrainData);

module.exports = router;
