const promptStorageService = require('../services/prompt-storage.service');

const addPrompt = async (req, res) => {
  try {
    const prompt = await promptStorageService.addPrompt(req.body);
    res.status(201).json(prompt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPrompts = async (req, res) => {
  try {
    const prompts = await promptStorageService.getPrompts();
    res.status(200).json(prompts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPromptById = async (req, res) => {
  try {
    const prompt = await promptStorageService.getPromptById(req.params.id);
    res.status(200).json(prompt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePrompt = async (req, res) => {
  try {
    const prompt = await promptStorageService.updatePrompt(req.params.id, req.body);
    res.status(200).json(prompt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePrompt = async (req, res) => {
  try {
    await promptStorageService.deletePrompt(req.params.id);
    res.status(200).json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addPrompt,
  getPrompts,
  getPromptById,
  updatePrompt,
  deletePrompt,
};
