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

const updateAbout = async (req, res) => {
  try {
    const about = await aboutService.updateAbout(req.params.id, req.body);
    res.status(200).json(about);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAbout = async (req, res) => {
  try {
    console.log('req.params.id',req.params.id)
    await aboutService.deleteAbout(req.params.id);
    res.status(200).json({ message: 'About deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  addAbout,
  getAbout,
  updateAbout,
  deleteAbout,
};
