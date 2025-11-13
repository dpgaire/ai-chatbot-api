const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const userService = require("./user.service");

class StripeService {
  async createCheckoutSession(userId, priceId) {
    if (!priceId || typeof priceId !== "string" || !priceId.startsWith("price_")) {
      throw new Error("Invalid or malformed 'priceId'.");
    }

    try {
      const user = await userService.getUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      let stripeCustomerId = user.stripeCustomerId;

      if (stripeCustomerId) {
        try {
          await stripe.customers.retrieve(stripeCustomerId);
        } catch (error) {
          if (error.code === 'resource_missing') {
            stripeCustomerId = null; // Invalidate the customer ID
          } else {
            throw error;
          }
        }
      }

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.fullName,
          metadata: { userId: user.id },
        });
        stripeCustomerId = customer.id;
        await userService.updateUserStripeCustomerId(userId, stripeCustomerId);
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        customer: stripeCustomerId,
        success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/payment-cancelled`,
        metadata: { userId, priceId },
      });

      return { url: session.url };
    } catch (error) {
      console.error("Stripe service error:", error.message);
      throw new Error(`Could not create checkout session: ${error.message}`);
    }
  }

  async handleWebhookEvent(request, signature) {
    let event;
    try {
      event = stripe.webhooks.constructEvent(request.rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    const getPaymentTypeFromPriceId = (priceId) => {
      console.log(`Determining payment type for priceId: ${priceId}`);
      if (priceId === process.env.STRIPE_PRICE_ID_TEAM) return "team";
      if (priceId === process.env.STRIPE_PRICE_ID_PRO) return "pro";
      
      if (priceId) return "pro";

      return "free";
    };

    const updateUserPaymentType = async (userId, paymentType) => {
      if (userId) {
        // Pass userId as the third argument to satisfy the permission check in updateUser
        await userService.updateUser(userId, { paymentType }, userId);
        console.log(`User ${userId} updated to paymentType: ${paymentType}`);
      }
    };

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const { userId, priceId } = session.metadata;
        const paymentType = getPaymentTypeFromPriceId(priceId);
        console.log('paymentType',paymentType)
        await updateUserPaymentType(userId, paymentType);
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const customer = await stripe.customers.retrieve(subscription.customer);
        const userId = customer.metadata.userId;
        const priceId = subscription.items.data[0].price.id;
        const paymentType = getPaymentTypeFromPriceId(priceId);
        await updateUserPaymentType(userId, paymentType);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        const userId = customer.metadata.userId;
        const priceId = subscription.items.data[0].price.id;
        const paymentType = getPaymentTypeFromPriceId(priceId);
        await updateUserPaymentType(userId, paymentType);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        const userId = customer.metadata.userId;
        await updateUserPaymentType(userId, "free");
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  async getCustomerSubscriptionStatus(stripeCustomerId) {
    if (!stripeCustomerId) return "free";

    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "active",
        limit: 1,
      });

      console.log('suscriptipn',subscriptions)

      if (subscriptions.data.length > 0) {
        const priceId = subscriptions.data[0].items.data[0].price.id;
        if (priceId === process.env.STRIPE_PRICE_ID_TEAM) return "team";
        if (priceId === process.env.STRIPE_PRICE_ID_PRO) return "pro";
      }
      return "free";
    } catch (error) {
      console.error("Error fetching customer subscription status:", error.message);
      return "free";
    }
  }
}

module.exports = new StripeService();
