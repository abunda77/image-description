import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow large images

// Gemini API proxy endpoint
app.post('/api/generate-description', async (req, res) => {
  try {
    const { imageData, mimeType } = req.body;

    if (!imageData || !mimeType) {
      return res.status(400).json({ error: 'Image data and mimeType are required' });
    }

    const apiKey = process.env.GEMINI_API_KEY; // Note: No VITE_ prefix for server-side
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured on server' });
    }

    const promptText = `
      Analyze this image and generate a strict visual description based on these rules:

      CRITICAL NEGATIVE CONSTRAINTS (DO NOT MENTION):
      - Face, head, eyes, nose, mouth, ears.
      - Hair, hairstyle, hair color, facial hair, beard, mustache.
      - Ethnicity, skin tone of the face, age, facial expressions.
      - Do NOT describe the head area at all.

      CONTENT REQUIREMENTS:
      - Focus ONLY on: Body posture, clothing (detailed), accessories, actions, objects, environment, lighting, atmosphere, perspective.

      FORMATTING RULES:
      1. Start EXACTLY with the subject and the literal text "(image reference)".
         Example: "a man "(image reference)" standing..." or "a woman "(image reference)" sitting..." or "a red car "(image reference)" parked..."
      2. Do NOT use opening phrases like "This image shows" or "A photo of".
      3. Output must be a SINGLE continuous paragraph.
      4. English only.
      5. Tone: Neutral, descriptive, factual. No opinions or storytelling.

      Generate the description now complying with all points above.
    `;

    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: mimeType
      }
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: promptText },
              imagePart
            ]
          }]
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Failed to generate description');
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (generatedText) {
      // Sanitize response
      const cleanText = generatedText
        .trim()
        .replace(/[<>]/g, '')
        .substring(0, 5000);
      res.json({ description: cleanText });
    } else {
      res.status(500).json({ error: 'No description generated' });
    }

  } catch (err) {
    console.error('Server error:', err);
    if (err.name === 'AbortError') {
      res.status(408).json({ error: 'Request timed out' });
    } else {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});