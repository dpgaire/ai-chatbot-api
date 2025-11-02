const contactService = require('../services/contact.service');

const addContact = async (req, res) => {
  try {
    const contact = await contactService.addContact(req.body, req.user.id);
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getContact = async (req, res) => {
  try {
    const contact = await contactService.getContact(req.user.id, req.user.role);
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getContactById = async (req, res) => {
  try {
    const contact = await contactService.getContactById(req.params.id);
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateContact = async (req, res) => {
  try {
    const contact = await contactService.updateContact(req.params.id, req.body, req.user.id, req.user.role);
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteContact = async (req, res) => {
  try {
    const contact = await contactService.deleteContact(req.params.id, req.user.id, req.user.role);
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addContact,
  getContact,
  getContactById,
  updateContact,
  deleteContact,
};
