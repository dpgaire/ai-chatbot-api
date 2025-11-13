const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const userService = require("./user.service");

class StripeService {
  async createCheckoutSession(userId, priceId) {
    // Validate the priceId
    if (!priceId || typeof priceId !== "string") {
      throw new Error("Invalid 'priceId'. It must be a string.");
    }
    // A basic check to see if it looks like a Stripe Price ID.
    if (!priceId.startsWith("price_")) {
        console.warn(`Warning: priceId "${priceId}" does not look like a standard Stripe Price ID.`);
    }

    try {
      // 1. Get user from our database
      const user = await userService.getUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      let stripeCustomerId = user.stripeCustomerId;

      // 2. If user doesn't have a stripeCustomerId, create one
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.fullName,
          metadata: {
            userId: user.id,
          },
        });
        stripeCustomerId = customer.id;

        // 3. Save the new stripeCustomerId to our database
        await userService.updateUserStripeCustomerId(userId, stripeCustomerId);
      }

      // 4. Create the checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        customer: stripeCustomerId,
        success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/cancel`,
      });

      return {
        url: session.url,
      };
    } catch (error) {
      // It's good practice to log the original error for debugging
      console.error("Stripe service error:", error.message);
      throw new Error(`Could not create checkout session: ${error.message}`);
    }
  }
}

module.exports = new StripeService();
