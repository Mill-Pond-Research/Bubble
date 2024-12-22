import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['your-production-domain.com'] // Replace with your production domain
    : ['http://localhost:5173'], // Vite's default development port
}));

const SYSTEM_PROMPT = `Expand and enhance note content. Maintain core essence while enriching depth, clarity, and value. Preserve key points and intent. Add context, examples, and structure. Improve language and detail. Consider audience and practical applications. Ensure consistency and accuracy. Aim for 200% expansion. Transform into comprehensive, authoritative resource.`;

// Elaborate endpoint
app.post('/api/elaborate', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key is required' });
  }

  const { thought } = req.body;

  if (!thought) {
    return res.status(400).json({ error: 'Thought content is required' });
  }

  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Please elaborate on and enhance the following text while maintaining its original meaning and intent:\n\n${thought}`,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
      }
    );

    console.log('Response received:', response.data);

    if (response.data && response.data.content && Array.isArray(response.data.content) && response.data.content[0]?.text) {
      res.json({ elaboration: response.data.content[0].text });
    } else {
      console.error('Unexpected API response structure:', response.data);
      res.status(500).json({ error: 'Unexpected response format from Anthropic API' });
    }
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    res.status(500).json({ 
      error: 'Failed to elaborate thought',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 