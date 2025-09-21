const skillService = require('../services/skill.service');

const addSkill = async (req, res) => {
  try {
    const skill = await skillService.addSkill(req.body);
    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSkills = async (req, res) => {
  try {
    const skills = await skillService.getSkills();
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addSkill,
  getSkills,
};
