const codeLogService = require('../services/code-log.service');

const addCodeLog = async (req, res) => {
  try {
    const codeLog = await codeLogService.addCodeLog(req.body);
    res.status(201).json(codeLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCodeLogs = async (req, res) => {
  try {
    const codeLogs = await codeLogService.getCodeLogs();
    res.status(200).json(codeLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCodeLogById = async (req, res) => {
  try {
    const codeLog = await codeLogService.getCodeLogById(req.params.id);
    res.status(200).json(codeLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCodeLog = async (req, res) => {
  try {
    const codeLog = await codeLogService.updateCodeLog(req.params.id, req.body);
    res.status(200).json(codeLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCodeLog = async (req, res) => {
  try {
    await codeLogService.deleteCodeLog(req.params.id);
    res.status(200).json({ message: 'CodeLog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addCodeLog,
  getCodeLogs,
  getCodeLogById,
  updateCodeLog,
  deleteCodeLog,
};