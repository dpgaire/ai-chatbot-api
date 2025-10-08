const express = require('express');
const router = express.Router();
const { getQueries } = require('../controllers/query.controller');
const protectRoute = require('../middleware/auth.middleware');


/**
 * @swagger
 * tags:
 *   name: Queries
 *   description: Retrieve user queries
 */

/**
 * @swagger
 * /api/queries:
 *   get:
 *     summary: Retrieve all user queries
 *     tags: [Queries]
 *     responses:
 *       200:
 *         description: A list of user queries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 queries:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       query:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get('/',protectRoute, getQueries);

module.exports = router;
