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

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
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
 *       200:
 *         description: Project updated successfully
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
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
 *         description: Project deleted successfully
 *       500:
 *         description: Server error
 */
router.post('/', protectRoute, projectController.addProject);
router.get('/', projectController.getProjects);
router.put('/:id', protectRoute, projectController.updateProject);
router.delete('/:id', protectRoute, projectController.deleteProject);

module.exports = router;
