const quickLinkService = require('../services/quicklink.service');

const addQuickLink = async (req, res) => {
  try {
    const link = await quickLinkService.addQuickLink(req.body);
    res.status(201).json(link);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuickLinks = async (req, res) => {
  try {
    const links = await quickLinkService.getQuickLinks();
    res.status(200).json(links);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuickLinkById = async (req, res) => {
  try {
    const link = await quickLinkService.getQuickLinkById(req.params.id);
    res.status(200).json(link);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateQuickLink = async (req, res) => {
  try {
    const link = await quickLinkService.updateQuickLink(req.params.id, req.body);
    res.status(200).json(link);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteQuickLink = async (req, res) => {
  try {
    await quickLinkService.deleteQuickLink(req.params.id);
    res.status(200).json({ message: 'Quick Link deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addQuickLink,
  getQuickLinks,
  getQuickLinkById,
  updateQuickLink,
  deleteQuickLink,
};
