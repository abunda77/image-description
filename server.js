import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const DIST_DIR = path.join(__dirname, 'dist');

// MIME types untuk static files
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

// Helper: Parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // Limit body size untuk security (10MB)
      if (body.length > 10 * 1024 * 1024) {
        req.connection.destroy();
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Helper: Send JSON response
function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Helper: Serve static file
function serveStaticFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found, serve index.html (SPA fallback)
        const indexPath = path.join(DIST_DIR, 'index.html');
        fs.readFile(indexPath, (err, data) => {
          if (err) {
            sendJSON(res, { error: 'Page not found' }, 404);
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
          }
        });
      } else {
        sendJSON(res, { error: 'Server error' }, 500);
      }
    } else {
      const ext = path.extname(filePath);
      const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(data);
    }
  });
}

// Main request handler
const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  // Parse URL to get pathname (remove query params)
  const pathname = url.split('?')[0];

  // Log incoming requests for debugging
  console.log(`[${new Date().toISOString()}] ${method} ${pathname}`);

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  try {
    // API: Verify Auth
    if (method === 'POST' && pathname === '/api/verify-auth') {
      const body = await parseBody(req);
      const { password } = body;
      const appPassword = process.env.APP_PASSWORD;

      if (!appPassword) {
        // If no password configured, auth is always valid
        sendJSON(res, { valid: true });
        return;
      }

      if (password === appPassword) {
        sendJSON(res, { valid: true });
      } else {
        sendJSON(res, { valid: false }, 401);
      }
      return;
    }

    // API: Generate Description
    if (method === 'POST' && pathname === '/api/generate-description') {
      // Password protection check
      const appPassword = process.env.APP_PASSWORD;
      if (appPassword) {
        const clientPassword = req.headers['x-app-password'];
        if (clientPassword !== appPassword) {
          sendJSON(res, { error: 'Unauthorized: Invalid or missing password' }, 401);
          return;
        }
      }

      console.log('📸 Processing image description request...');
      const body = await parseBody(req);
      const { imageData, mimeType } = body;

      if (!imageData || !mimeType) {
        sendJSON(res, { error: 'Image data and mimeType are required' }, 400);
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        sendJSON(res, { error: 'API key not configured on server' }, 500);
        return;
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
        const errorText = await response.text();
        console.error('❌ Gemini API error:', errorText);
        throw new Error('Failed to generate description');
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        const cleanText = generatedText
          .trim()
          .replace(/[<>]/g, '')
          .substring(0, 5000);
        console.log('✅ Description generated successfully');
        sendJSON(res, { description: cleanText });
      } else {
        console.error('❌ No description in response');
        sendJSON(res, { error: 'No description generated' }, 500);
      }

      return;
    }

    // API: Health check
    if (method === 'GET' && pathname === '/api/health') {
      sendJSON(res, { status: 'OK', timestamp: new Date().toISOString() });
      return;
    }

    // Static files / SPA fallback
    if (method === 'GET') {
      let filePath;

      if (pathname === '/') {
        filePath = path.join(DIST_DIR, 'index.html');
      } else {
        filePath = path.join(DIST_DIR, pathname);
      }

      serveStaticFile(filePath, res);
      return;
    }

    // Method not allowed
    sendJSON(res, { error: 'Method not allowed' }, 405);

  } catch (err) {
    console.error('💥 Server error:', err);
    if (err.name === 'AbortError') {
      sendJSON(res, { error: 'Request timed out' }, 408);
    } else {
      sendJSON(res, { error: err.message || 'Internal server error' }, 500);
    }
  }
});

server.listen(PORT, () => {
  console.log(`✅ Simple HTTP Server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${DIST_DIR}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});
