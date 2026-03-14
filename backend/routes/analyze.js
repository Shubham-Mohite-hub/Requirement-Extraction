const express = require('express');
const router = express.Router();
const axios = require('axios');
const Requirement = require('../models/Requirement');

router.post('/analyze-requirements', async (req, res) => {
  const { text, projectId } = req.body;

  try {
    // 1. Call the Python AI API
    const mlResponse = await axios.post('http://localhost:8000/analyze', {
      text: text
    });

    const mlData = mlResponse.data;

    // 2. Map the Python JSON to our MongoDB Model
    const newRequirement = new Requirement({
      project_id: projectId || mlData.metadata.project_id,
      source: mlData.metadata.source,
      predicted_category: mlData.predicted_category,
      analysis_details: {
        functional_requirements: mlData.analysis_details["Functional Requirements"],
        non_functional_requirements: mlData.analysis_details["Non Functional Requirements"],
        stakeholders: mlData.analysis_details["Stakeholders"],
        decisions: mlData.analysis_details["Decisions"],
        timelines: mlData.analysis_details["Timelines"],
        priority: mlData.analysis_details["Feature Priority"]
      },
      raw_text: text
    });

    // 3. Save it
    const savedData = await newRequirement.save();

    // 4. Send it back to the React frontend
    res.status(200).json(savedData);

  } catch (error) {
    console.error("Bridge Error:", error.message);
    res.status(500).json({ error: "ML Server not responding. Is main_api.py running?" });
  }
});

module.exports = router;