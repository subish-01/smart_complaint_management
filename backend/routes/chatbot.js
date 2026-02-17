const express = require('express');
const router = express.Router();
// Use built-in fetch if available (Node 18+), otherwise require it (node-fetch or similar)
// We assume Node 18+
const fetch = global.fetch;

// Chatbot endpoint
router.post('/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('GEMINI_API_KEY not found in environment variables');
        return res.status(500).json({ error: 'Server configuration error: API Key missing' });
    }

    try {
        const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

        const systemPrompt = `
You are the official AI Assistant for the "Smart Complaint Management System" (SCMS). 
Your role is to help citizens and administrators use this specific website.

**Project Details:**
- **Name:** Smart Complaint Management System (SCMS)
- **Purpose:** digital platform for citizens to report civic issues (garbage, potholes, street lights, etc.)
- **Key Features:** Geolocation tracking, AI categorization, Real-time status updates (Pending, In Progress, Resolved), Public Dashboard, Admin Analytics.
- **Team:** Created by Team "Four Corners" (Leader: Jannathul Firdhouse, Members: Subish, Muthamil, Priya).

**Strict Rules:**
1. **Scope Restriction:** You MUST ONLY answer questions related to the SCMS website, complaint reporting, civic issues, or the project details listed above.
2. **Refusal:** If the user asks about general knowledge, math, history, coding, or anything unrelated to this project, politely reply: "I can only assist with queries related to the Smart Complaint Management System."
3. **Tone:** Professional, helpful, and concise.

**Website Navigation Context:**
- "Home": Main overview.
- "Register Complaint": Form to submit new issues.
- "My Complaints": Track submitted issues.
- "Public Dashboard": View community issues.
- "Admin": Administrative login.

User Query: "${message}"
Answer:
    `;

        const payload = {
            contents: [{
                parts: [{ text: systemPrompt }]
            }]
        };

        const response = await fetch(`${apiUrl}?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data.error?.message || data.message || "Unknown API error";
            console.error("Gemini API Error Detail:", data);
            throw new Error(errorMsg);
        }

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const reply = data.candidates[0].content.parts[0].text;
            res.json({ reply });
        } else {
            console.error("Unexpected Gemini response:", data);
            throw new Error("Invalid response format from AI");
        }

    } catch (error) {
        console.error("Chatbot Proxy Error:", error);
        res.status(500).json({ error: error.message || 'Failed to get response from AI' });
    }
});

module.exports = router;
