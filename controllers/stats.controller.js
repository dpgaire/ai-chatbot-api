const statsService = require('../services/stats.service');

const getMainPageViews = async (req, res) => {
  try {
    const { views } = await statsService.getMainPageViews();
    res.status(200).json({ views });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const incrementMainPageViews = async (req, res) => {
  try {
    const { views } = await statsService.incrementMainPageViews();
    res.status(200).json({ views });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMainPageViews,
  incrementMainPageViews,
};