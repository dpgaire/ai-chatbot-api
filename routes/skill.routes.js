const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skill.controller');
const protectRoute = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const apiKeyAuth = require('../middleware/apiKey.middleware');

/**
 * @swagger
 * tags:
 *   name: Skills
 *   description: Skill management
 */

/**
 * @swagger
 * /api/skills:
 *   post:
 *     summary: Add a new skill
 *     tags: [Skills]
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
 *               icon:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     level:
 *                       type: integer
 *                     color:
 *                       type: string
 *     responses:
 *       201:
 *         description: Skill added successfully
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all skills
 *     tags: [Skills]
 *     responses:
 *       200:
 *         description: A list of skills
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   icon:
 *                     type: string
 *                   skills:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         level:
 *                           type: integer
 *                         color:
 *                           type: string
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/skills/{id}:
 *   put:
 *     summary: Update a skill
 *     tags: [Skills]
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
 *               icon:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     level:
 *                       type: integer
 *                     color:
 *                       type: string
 *     responses:
 *       200:
 *         description: Skill updated successfully
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a skill
 *     tags: [Skills]
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
 *         description: Skill deleted successfully
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/skills/public:
 *   get:
 *     summary: Get skill information (Public via API Key)
 *     tags: [Skills]
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Skill information (for public API)
 *       401:
 *         description: Invalid or missing API key
 *       500:
 *         description: Server error
 */

router.post('/', protectRoute, authorize(['superAdmin', 'Admin','User']), skillController.addSkill);
router.get('/', protectRoute, authorize(['superAdmin', 'Admin','User']), skillController.getSkills);
router.get('/public', apiKeyAuth, skillController.getSkills);
router.put('/:id', protectRoute, authorize(['superAdmin', 'Admin','User']), skillController.updateSkill);
router.delete('/:id', protectRoute, authorize(['superAdmin', 'Admin','User']), skillController.deleteSkill);

module.exports = router;
