const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');

router.post('/projects', projectController.addProject);
router.get('/projects', projectController.getProjects);

module.exports = router;
