const express = require('express');
const router = express.Router();
const queryController = require('../controllers/query.controller');
const protectRoute = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Queries
 *   description: Query management
 */

/**
 * @swagger
 * /api/queries:
 *   get:
 *     summary: Get all queries
 *     tags: [Queries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of queries
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/queries/{id}:
 *   delete:
 *     summary: Delete a query by ID
 *     tags: [Queries]
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
 *         description: Query deleted successfully
 *       500:
 *         description: Server error
 */

router.get('/', protectRoute, queryController.getQueries);
router.delete('/:id', protectRoute, queryController.deleteQuery);

module.exports = router;