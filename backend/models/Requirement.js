const mongoose = require('mongoose');

const RequirementSchema = new mongoose.Schema({
  project_id: { type: String, required: true },
  source: { type: String, default: 'Email' },
  predicted_category: String,
  analysis_details: {
    functional_requirements: [String],
    non_functional_requirements: [String],
    stakeholders: [String],
    decisions: [String],
    timelines: [String],
    priority: [String]
  },
  raw_text: String, // Storing the original text is useful for debugging
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Requirement', RequirementSchema);