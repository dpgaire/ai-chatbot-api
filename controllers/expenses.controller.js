const expensesService = require('../services/expenses.service');

const addExpense = async (req, res) => {
  try {
    const expense = await expensesService.addExpense(req.body);
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    const expenses = await expensesService.getExpenses();
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const expense = await expensesService.getExpenseById(req.params.id);
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const expense = await expensesService.updateExpense(req.params.id, req.body);
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    await expensesService.deleteExpense(req.params.id);
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
