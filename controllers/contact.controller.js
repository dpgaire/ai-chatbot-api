const contactService = require('../services/contact.service');

const addContact = async (req, res) => {
  try {
    const contact = await contactService.addContact(req.body);
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getContact = async (req, res) => {
  try {
    const contact = await contactService.getContact();
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addContact,
  getContact
};
