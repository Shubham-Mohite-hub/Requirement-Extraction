require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios'); // Ensure you ran: npm install axios
const analyzeRoute = require('./routes/analyze');

const app = express();

// --- 1. Mongoose Schema ---
const analysisSchema = new mongoose.Schema({
    project_id: { type: String, default: "UNKNOWN" },
    predicted_category: String,
    analysis_details: Object,
    metadata: Object,
    createdAt: { type: Date, default: Date.now }
});
const Analysis = mongoose.model('Analysis', analysisSchema);

// --- 2. Middleware ---
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(express.json());

// --- 3. Jira Sync Route ---
app.post('/api/jira-sync', async (req, res) => {
  
    const { requirements, projectKey } = req.body;
    
    // Pulling secrets safely from .env
    const domain = process.env.JIRA_DOMAIN;
    const email = process.env.JIRA_EMAIL;
    const token = process.env.JIRA_API_TOKEN;
    
    // Auth Header (Base64)
    const auth = Buffer.from(`${email}:${token}`).toString('base64');

    try {
        const issuesCreated = [];

        for (const reqText of requirements) {
          const cleanSummary = reqText.replace(/[\r\n]+/gm, " ").trim();
            const jiraIssue = {
                fields: {
                    project: { key: projectKey || 'KAN' },
                    summary: cleanSummary, // Using the actual requirement as the title
                    description: "Created via ReqMind AI Extraction",
                    issuetype: { name: 'Task' }
                }
            };

            const response = await axios.post(
                `https://${domain}/rest/api/2/issue`,
                jiraIssue,
                { 
                    headers: { 
                        'Authorization': `Basic ${auth}`, 
                        'Content-Type': 'application/json' 
                    } 
                }
            );
            issuesCreated.push(response.data.key);
        }

        res.status(200).json({ success: true, issues: issuesCreated });
    } catch (error) {
        console.error("Jira Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to sync with Jira" });
    }
});

// --- 4. Database Save Route ---
app.post('/api/save-analysis', async (req, res) => {
    try {
        const newRecord = new Analysis(req.body);
        await newRecord.save();
        res.status(200).json({ message: "Saved to MongoDB Atlas!" });
    } catch (error) {
        res.status(500).json({ error: "Database save failed" });
    }
});

// --- 5. MongoDB Connection ---
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/reqsphere';
mongoose.connect(mongoURI)
  .then(() => console.log(`✅ MongoDB Connected`))
  .catch(err => console.error("❌ MongoDB Error:", err.message));

// --- 6. Routes & Port ---
app.use('/api', analyzeRoute);
app.get('/', (req, res) => res.send('Backend Bridge Live'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Running at http://localhost:${PORT}`));