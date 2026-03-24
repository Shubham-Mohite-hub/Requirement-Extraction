require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const analyzeRoute = require('./routes/analyze');

const app = express();

// --- 1. Middleware ---
app.use(cors({
    // Added every possible port your frontend might be using
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json());

// --- 2. Jira Sync Route ---
app.post('/api/jira-sync', async (req, res) => {
    const { requirements, projectKey } = req.body;
    const domain = process.env.JIRA_DOMAIN;
    const email = process.env.JIRA_EMAIL;
    const token = process.env.JIRA_API_TOKEN;
    const auth = Buffer.from(`${email}:${token}`).toString('base64');

    try {
        const issuesCreated = [];
        for (const reqText of requirements) {
            let cleanSummary = reqText.replace(/[\r\n]+/gm, " ").trim();
            if (cleanSummary.length > 250) cleanSummary = cleanSummary.substring(0, 247) + "...";

            const jiraIssue = {
                fields: {
                    project: { key: projectKey || 'KAN' },
                    summary: cleanSummary, 
                    description: reqText, 
                    issuetype: { name: 'Task' }
                }
            };

            const response = await axios.post(
                `https://${domain}/rest/api/2/issue`,
                jiraIssue,
                { headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' } }
            );
            issuesCreated.push(response.data.key);
        }
        res.status(200).json({ success: true, issues: issuesCreated });
    } catch (error) {
        console.error("Jira Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to sync with Jira" });
    }
});

// --- 3. MongoDB Connection ---
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/reqsphere';
mongoose.connect(mongoURI)
  .then(() => console.log(`✅ MongoDB Connected`))
  .catch(err => console.error("❌ MongoDB Error:", err.message));

// --- 4. Mounting the Analyze Route ---
// This handles /api/projects, /api/analyze-requirements, and /api/history
app.use('/api', analyzeRoute); 

app.get('/', (req, res) => res.send('Backend Bridge Live'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Running at http://0.0.0.0:${PORT}`));