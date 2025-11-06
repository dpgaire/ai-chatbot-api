const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const protectRoute = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const apiKeyAuth = require('../middleware/apiKey.middleware');


/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Contact management
 */

/**
 * @swagger
 * /api/contact/public:
 *   post:
 *     summary: Add a new contact message
 *     tags: [Contact]
 *     parameters:
 *       - in: header
 *         name: x-api-key
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
 *       401:
 *         description: Missing or invalid API key
 *       500:
 *         description: Server error
 */
router.post('/public', apiKeyAuth, contactController.addContact);

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
 *       500:
 *         description: Server error
 */
router.get('/', protectRoute, authorize(['superAdmin', 'Admin', 'User']), contactController.getContact);

/**
 * @swagger
 * /api/contact/{id}:
 *   get:
 *     summary: Get a contact message by ID
 *     tags: [Contact]
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
 *         description: Contact message
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
router.get('/:id', protectRoute, authorize(['superAdmin', 'Admin', 'User']), contactController.getContactById);

/**
 * @swagger
 * /api/contact/{id}:
 *   put:
 *     summary: Update a contact message by ID
 *     tags: [Contact]
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *               company_website:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
router.put('/:id', protectRoute, authorize(['superAdmin', 'Admin', 'User']), contactController.updateContact);

/**
 * @swagger
 * /api/contact/{id}:
 *   delete:
 *     summary: Delete a contact message by ID
 *     tags: [Contact]
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
 *         description: Contact deleted successfully
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protectRoute, authorize(['superAdmin', 'Admin', 'User']), contactController.deleteContact);

module.exports = router;
