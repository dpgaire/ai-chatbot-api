const express = require('express');
const router = express.Router();
const runScriptController = require('../controllers/runscript.controller');
const protectRoute = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: RunScripts
 *   description: Run Script management
 */

/**
 * @swagger
 * /api/runscripts:
 *   post:
 *     summary: Add a new script
 *     tags: [RunScripts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               script_name:
 *                 type: string
 *               script_path:
 *                 type: string
 *     responses:
 *       201:
 *         description: Script added successfully
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all scripts
 *     tags: [RunScripts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of scripts
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/runscripts/{id}:
 *   get:
 *     summary: Get a script by ID
 *     tags: [RunScripts]
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
 *         description: A single script
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a script
 *     tags: [RunScripts]
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
 *               script_name:
 *                 type: string
 *               script_path:
 *                 type: string
 *     responses:
 *       200:
 *         description: Script updated successfully
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a script
 *     tags: [RunScripts]
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
 *         description: Script deleted successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/runscripts/run/{id}:
 *   get:
 *     summary: Run a script by ID
 *     tags: [RunScripts]
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
 *         description: Script execution result
 *       500:
 *         description: Server error
 */

router.post('/', protectRoute, runScriptController.addScript);
router.get('/', protectRoute, runScriptController.getScripts);
router.get('/:id', protectRoute, runScriptController.getScriptById);
router.put('/:id', protectRoute, runScriptController.updateScript);
router.delete('/:id', protectRoute, runScriptController.deleteScript);
router.get('/run/:id', protectRoute, runScriptController.runScript);

module.exports = router;
