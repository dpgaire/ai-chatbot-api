const skillService = require("../services/skill.service");

const addSkill = async (req, res) => {
  try {
    const skill = await skillService.addSkill(req.body, req.user.id);
    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSkills = async (req, res) => {
  try {
    const skills = await skillService.getSkills(req.user.id, req.user.role);
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSkill = async (req, res) => {
  try {
    const skill = await skillService.updateSkill(
      req.params.id,
      req.body,
      req.user.id,
      req.user.role
    );
    res.status(200).json(skill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSkill = async (req, res) => {
  try {
    await skillService.deleteSkill(req.params.id, req.user.id, req.user.role);
    res.status(200).json({ message: "Skill deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addSkill,
  getSkills,
  updateSkill,
  deleteSkill,
};
