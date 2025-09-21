const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skill.controller');
const protectRoute = require('../middleware/auth.middleware');

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
router.post('/skills', protectRoute, skillController.addSkill);
router.get('/skills', skillController.getSkills);

module.exports = router;
