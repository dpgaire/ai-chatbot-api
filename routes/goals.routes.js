const express = require('express');
const router = express.Router();
const goalsController = require('../controllers/goals.controller');
const protectRoute = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Goals
 *   description: Goal management
 */

/**
 * @swagger
 * /api/goals:
 *   post:
 *     summary: Add a new goal
 *     tags: [Goals]
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
 *               targetDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Goal added successfully
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all goals
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of goals
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/goals/{id}:
 *   get:
 *     summary: Get a goal by ID
 *     tags: [Goals]
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
 *         description: A single goal
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a goal
 *     tags: [Goals]
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
 *               targetDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Goal updated successfully
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a goal
 *     tags: [Goals]
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
 *         description: Goal deleted successfully
 *       500:
 *         description: Server error
 */

router.post('/', protectRoute, goalsController.addGoal);
router.get('/', protectRoute, goalsController.getGoals);
router.get('/:id', protectRoute, goalsController.getGoalById);
router.put('/:id', protectRoute, goalsController.updateGoal);
router.delete('/:id', protectRoute, goalsController.deleteGoal);

// Key Results

/**
 * @swagger
 * /api/goals/{goalId}/key-results:
 *   post:
 *     summary: Add a new key result to a goal
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                 targetValue:
 *                   type: number
 *                 currentValue:
 *                   type: number
 *     responses:
 *       201:
 *         description: Key Result added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   currentValue:
 *                     type: number
 *                   targetValue:
 *                     type: number
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/goals/{goalId}/key-results/{krId}:
 *   put:
 *     summary: Update a key result
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: krId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                 targetValue:
 *                   type: number
 *                 currentValue:
 *                   type: number
 *     responses:
 *       200:
 *         description: Key Result updated successfully
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a key result
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: krId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Key Result deleted successfully
 *       500:
 *         description: Server error
 */

router.post('/:goalId/key-results', protectRoute, goalsController.createKeyResult);
router.put('/:goalId/key-results/:krId', protectRoute, goalsController.updateKeyResult);
router.delete('/:goalId/key-results/:krId', protectRoute, goalsController.deleteKeyResult);

module.exports = router;
