const stripeService = require("../services/stripe.service");

const createCheckoutSession = async (req, res) => {
  try {
    const { priceId } = req.body;
    const userId = req.user.id; 

    if (!priceId) {
      return res.status(400).json({ message: "priceId is required" });
    }

    const session = await stripeService.createCheckoutSession(userId, priceId);
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCheckoutSession,
};
