const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  async getAllPayments() {
    try {
      const charges = await stripe.charges.list({
        limit: 100, 
      });
      return charges.data;
    } catch (error) {
      throw new Error(`Could not retrieve payments: ${error.message}`);
    }
  }
}

module.exports = new PaymentService();
