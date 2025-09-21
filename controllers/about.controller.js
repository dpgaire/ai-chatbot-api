const aboutService = require('../services/about.service');

const addAbout = async (req, res) => {
  try {
    const about = await aboutService.addAbout(req.body);
    res.status(201).json(about);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAbout = async (req, res) => {
  try {
    const about = await aboutService.getAbout();
    res.status(200).json(about);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addAbout,
  getAbout,
};
