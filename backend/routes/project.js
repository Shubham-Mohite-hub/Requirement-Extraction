const router = require('express').Router();
const Project = require('../models/Project');

// Create a new project
router.post('/', async (req, res) => {
  try {
    const { name, description, userId } = req.body;
    const newProject = new Project({ name, description, userId });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all projects for a specific user
router.get('/:userId', async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.params.userId });
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;