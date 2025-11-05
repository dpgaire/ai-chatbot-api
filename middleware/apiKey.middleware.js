const userService = require('../services/user.service');

const apiKeyAuth = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  console.log('apikey',apiKey)

  if (!apiKey) {
    return res.status(401).json({ message: 'API key is required' });
  }

  try {
    const user = await userService.findUserByApiKey(apiKey);
    console.log('user',user)

    if (!user) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = apiKeyAuth;
