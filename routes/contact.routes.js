const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const protectRoute = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Contact management
 */

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Add a new contact message
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               subject:
 *                 type: string
 *                 example: Partnership Inquiry
 *               message:
 *                 type: string
 *                 example: Hi, I would like to discuss a potential partnership.
 *               company_website:
 *                 type: string
 *                 example: https://example.com
 *     responses:
 *       201:
 *         description: Contact message added successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/contact:
 *   get:
 *     summary: Get all contact messages
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of contact messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: 12345
 *                   name:
 *                     type: string
 *                     example: John Doe
 *                   email:
 *                     type: string
 *                     example: johndoe@example.com
 *                   subject:
 *                     type: string
 *                     example: Partnership Inquiry
 *                   message:
 *                     type: string
 *                     example: Hi, I would like to discuss a potential partnership.
 *                   company_website:
 *                     type: string
 *                     example: https://example.com
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error
 */

router.post('/', contactController.addContact);
router.get('/', protectRoute, contactController.getContact);

module.exports = router;
