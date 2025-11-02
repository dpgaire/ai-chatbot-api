const express = require('express');
const router = express.Router();
const codeLogController = require('../controllers/code-log.controller');
const protectRoute = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

/**
 * @swagger
 * tags:
 *   name: CodeLogs
 *   description: CodeLog management
 */

/**
 * @swagger
 * /api/code-log:
 *   post:
 *     summary: Add a new code log
 *     tags: [CodeLogs]
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
 *               code:
 *                 type: string
 *     responses:
 *       201:
 *         description: CodeLog added successfully
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all code logs
 *     tags: [CodeLogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of code logs
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/code-log/{id}:
 *   get:
 *     summary: Get a code log by ID
 *     tags: [CodeLogs]
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
 *         description: A single code log
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a code log
 *     tags: [CodeLogs]
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
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: CodeLog updated successfully
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a code log
 *     tags: [CodeLogs]
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
 *         description: CodeLog deleted successfully
 *       500:
 *         description: Server error
 */

router.post('/', protectRoute, authorize(['superAdmin', 'Admin', 'User']), codeLogController.addCodeLog);
router.get('/', protectRoute, authorize(['superAdmin', 'Admin', 'User']), codeLogController.getCodeLogs);
router.get('/:id', protectRoute, authorize(['superAdmin', 'Admin', 'User']), codeLogController.getCodeLogById);
router.put('/:id', protectRoute, authorize(['superAdmin', 'Admin', 'User']), codeLogController.updateCodeLog);
router.delete('/:id', protectRoute, authorize(['superAdmin', 'Admin', 'User']), codeLogController.deleteCodeLog);

module.exports = router;