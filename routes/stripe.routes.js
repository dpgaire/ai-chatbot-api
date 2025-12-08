const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripe.controller');
const protectRoute = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Stripe
 *   description: Stripe payment processing
 */

/**
 * @swagger
 * /api/stripe/create-checkout-session:
 *   post:
 *     summary: Create a Stripe checkout session
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - priceId
 *             properties:
 *               priceId:
 *                 type: string
 *                 description: The ID of the Stripe price
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the checkout session
 *       400:
 *         description: priceId is required
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/create-checkout-session', protectRoute, stripeController.createCheckoutSession);

module.exports = router;
