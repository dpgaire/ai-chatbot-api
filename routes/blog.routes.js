const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const protectRoute = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: Blog management
 */

/**
 * @swagger
 * /api/blogs:
 *   post:
 *     summary: Add a new blog
 *     tags: [Blogs]
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
 *               slug:
 *                 type: string
 *               title:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               readTime:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items: 
 *                   type: string
 *               likes:
 *                 type: integer
 *               featured:
 *                 type: boolean
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Blog added successfully
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: A list of blogs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   slug:
 *                     type: string
 *                   title:
 *                     type: string
 *                   excerpt:
 *                     type: string
 *                   content:
 *                     type: string
 *                   author:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
 *                   readTime:
 *                     type: string
 *                   category:
 *                     type: string
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                   likes:
 *                     type: integer
 *                   featured:
 *                     type: boolean
 *                   image:
 *                     type: string
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     summary: Get a blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single blog
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a blog
 *     tags: [Blogs]
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
 *               excerpt:
 *                 type: string
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               readTime:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               likes:
 *                 type: integer
 *               featured:
 *                 type: boolean
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a blog
 *     tags: [Blogs]
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
 *         description: Blog deleted successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/blogs/{id}/view:
 *   put:
 *     summary: Increment view count for a blog
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: View count incremented successfully
 *       500:
 *         description: Server error
 */
router.post('/', protectRoute, blogController.addBlog);
router.get('/', blogController.getBlogs);
router.get('/:id', blogController.getBlogById);
router.put('/:id', protectRoute, blogController.updateBlog);
router.delete('/:id', protectRoute, blogController.deleteBlog);
router.put('/:id/view', blogController.incrementViewCount);

module.exports = router;
