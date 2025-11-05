const runScriptService = require('../services/runscript.service');

const addScript = async (req, res) => {
  try {
    const script = await runScriptService.addScript(req.body);
    res.status(201).json(script);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getScripts = async (req, res) => {
  try {
    const scripts = await runScriptService.getScripts();
    res.status(200).json(scripts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getScriptById = async (req, res) => {
  try {
    const script = await runScriptService.getScriptById(req.params.id);
    res.status(200).json(script);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateScript = async (req, res) => {
  try {
    const script = await runScriptService.updateScript(req.params.id, req.body);
    res.status(200).json(script);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteScript = async (req, res) => {
  try {
    await runScriptService.deleteScript(req.params.id);
    res.status(200).json({ message: 'Script deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const runScript = async (req, res) => {
  try {
    const result = await runScriptService.runScript(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message, ...error });
  }
};

module.exports = {
  addScript,
  getScripts,
  getScriptById,
  updateScript,
  deleteScript,
  runScript,
};
