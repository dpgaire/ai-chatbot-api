const goalsService = require('../services/goals.service');

const addGoal = async (req, res) => {
  try {
    const goal = await goalsService.addGoal(req.body, req.user.id);
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGoals = async (req, res) => {
  try {
    const goals = await goalsService.getGoals(req.user.id, req.user.role);
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGoalById = async (req, res) => {
  try {
    const goal = await goalsService.getGoalById(req.params.id);
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateGoal = async (req, res) => {
  try {
    const goal = await goalsService.updateGoal(req.params.id, req.body, req.user.id, req.user.role);
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteGoal = async (req, res) => {
  try {
    await goalsService.deleteGoal(req.params.id);
    res.status(200).json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createKeyResult = async (req, res) => {
  try {
    const keyResult = await goalsService.createKeyResult(req.params.goalId, req.body);
    res.status(201).json(keyResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateKeyResult = async (req, res) => {
  try {
    const keyResult = await goalsService.updateKeyResult(req.params.goalId, req.params.krId, req.body);
    res.status(200).json(keyResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteKeyResult = async (req, res) => {
  try {
    await goalsService.deleteKeyResult(req.params.goalId, req.params.krId);
    res.status(200).json({ message: 'Key Result deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  createKeyResult,
  updateKeyResult,
  deleteKeyResult,
};
