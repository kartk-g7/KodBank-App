const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { OpenAI } = require('openai');

router.use(authenticateToken);

const client = new OpenAI({
    baseURL: 'https://router.huggingface.co/v1',
    apiKey: process.env.HF_API_KEY || '',
});

// POST /api/chat
router.post('/', async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages array is required' });
    }

    if (!process.env.HF_API_KEY) {
        return res.status(500).json({ error: 'HF_API_KEY not configured' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
        const stream = await client.chat.completions.create({
            model: 'openai/gpt-oss-20b:groq',
            messages,
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('Chat error:', error.message);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        } else {
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
        }
    }
});

module.exports = router;