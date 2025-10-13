const projectService = require('../services/project.service');

const addProject = async (req, res) => {
  try {
    const project = await projectService.addProject(req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await projectService.getProjects();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    await projectService.deleteProject(req.params.id);
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const incrementViewCount = async (req, res) => {
  try {
    const { title, views } = await projectService.incrementViewCount(req.params.id);
    res.status(200).json({ title, views });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addProject,
  getProjects,
  updateProject,
  deleteProject,
  getProjectById,
  incrementViewCount,
};
