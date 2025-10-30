const express = require('express');
const router = express.Router();
const expensesController = require('../controllers/expenses.controller');
const protectRoute = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Expense management
 */

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Add a new expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               category:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Expense added successfully
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all expenses
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of expenses
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Get an expense by ID
 *     tags: [Expenses]
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
 *         description: A single expense
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update an expense
 *     tags: [Expenses]
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
 *               date:
 *                 type: string
 *                 format: date
 *               category:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete an expense
 *     tags: [Expenses]
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
 *         description: Expense deleted successfully
 *       500:
 *         description: Server error
 */

router.post('/', protectRoute, expensesController.addExpense);
router.get('/', protectRoute, expensesController.getExpenses);
router.get('/:id', protectRoute, expensesController.getExpenseById);
router.put('/:id', protectRoute, expensesController.updateExpense);
router.delete('/:id', protectRoute, expensesController.deleteExpense);

module.exports = router;
