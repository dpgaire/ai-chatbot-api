const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const protectRoute = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');


/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat with the AI assistant
 */

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Chat with the AI assistant
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *     responses:
 *       200:
 *         description: The AI assistant's response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.post('/', chatController.chat);

/**
 * @swagger
 * /api/chat/users:
 *   get:
 *     summary: Get all chat users
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: A list of all chat users
 *       500:
 *         description: Server error
 */
router.get('/users',protectRoute, authorize(['superAdmin', 'Admin']), chatController.getUsers);

/**
 * @swagger
 * /api/chat/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Chat]
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
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/users/:id', protectRoute, authorize(['superAdmin', 'Admin']), chatController.deleteUser);

/**
 * @swagger
 * /api/chat/histories:
 *   get:
 *     summary: Get all chat histories
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: A list of all chat histories
 *       500:
 *         description: Server error
 */
router.get('/histories', chatController.getChatHistories);


/**
 * @swagger
 * /api/chat/user-entry:
 *   post:
 *     summary: Save user details
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: User details saved successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post('/user-entry', chatController.saveUser);

/**
 * @swagger
 * /api/chat/history:
 *   post:
 *     summary: Save chat history
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: number
 *               title:
 *                 type: string
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     text:
 *                       type: string
 *                     sender:
 *                       type: string
 *                     type:
 *                       type: string
 *     responses:
 *       201:
 *         description: Chat history saved successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post('/history', chatController.saveChatHistory);

/**
 * @swagger
 * /api/chat/history/{userId}:
 *   get:
 *     summary: Get chat history for a user
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: The user's chat history
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.get('/history/:userId', chatController.getChatHistory);

/**
 * @swagger
 * /api/chat/history/{userId}/{chatId}:
 *   get:
 *     summary: Get a specific chat history for a user
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: number
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: The specific chat history
 *       404:
 *         description: Chat history not found
 *       500:
 *         description: Server error
 */
router.get('/history/:userId/:chatId', chatController.getChatHistoryById);

/**
 * @swagger
 * /api/chat/history/{userId}/{chatId}:
 *   patch:
 *     summary: Dynamically update a specific chat history for a user
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: number
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: |-
 *               An object containing the fields to be updated in the chat history.
 *               Any valid field of the chat history payload can be provided for dynamic update.
 *               For example, to update the title and add a new property:
 *               ```json
 *               {
 *                 "title": "New Chat Title",
 *                 "newProperty": "newValue"
 *               }
 *               ```
 *     responses:
 *       200:
 *         description: The updated chat history
 *       404:
 *         description: Chat history not found
 *       500:
 *         description: Server error
 */
router.patch('/history/:userId/:chatId', chatController.patchChatHistoryController);

/**
 * @swagger
 * /api/chat/history/{userId}/{chatId}:
 *   delete:
 *     summary: Delete a specific chat history for a user
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: number
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Chat history deleted successfully
 *       404:
 *         description: Chat history not found
 *       500:
 *         description: Server error
 */
router.delete('/history/:userId/:chatId', chatController.deleteChatHistory);

module.exports = router;
