const protectRoute = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const secretApiKey = process.env.SECRET_API_KEY;

  if (!apiKey || apiKey !== secretApiKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

module.exports = protectRoute;
