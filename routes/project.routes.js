const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const protectRoute = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management
 */

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Add a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               longDescription:
 *                 type: string
 *               image:
 *                 type: string
 *               technologies:
 *                 type: array
 *                 items:
 *                   type: string
 *               liveUrl:
 *                 type: string
 *               githubUrl:
 *                 type: string
 *               featured:
 *                 type: boolean
 *               status:
 *                 type: string
 *               problem:
 *                 type: string
 *               process:
 *                 type: string
 *               solution:
 *                 type: string
 *               screenshots:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Project added successfully
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: A list of projects
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
 *                   category:
 *                     type: string
 *                   description:
 *                     type: string
 *                   longDescription:
 *                     type: string
 *                   image:
 *                     type: string
 *                   technologies:
 *                     type: array
 *                     items:
 *                       type: string
 *                   liveUrl:
 *                     type: string
 *                   githubUrl:
 *                     type: string
 *                   featured:
 *                     type: boolean
 *                   status:
 *                     type: string
 *                   problem:
 *                     type: string
 *                   process:
 *                     type: string
 *                   solution:
 *                     type: string
 *                   screenshots:
 *                     type: array
 *                     items:
 *                       type: string
 *       500:
 *         description: Server error
 */
router.post('/projects', protectRoute, projectController.addProject);
router.get('/projects', projectController.getProjects);

module.exports = router;
