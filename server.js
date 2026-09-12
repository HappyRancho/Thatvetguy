import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve static assets with automatic .html extension resolution
app.use(express.static(__dirname, { extensions: ['html'] }));

// Fallback route for extensionless URLs or case variations (e.g. /shivam -> Shivam.html)
app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  const directPath = path.join(__dirname, `${page}.html`);
  if (fs.existsSync(directPath)) {
    return res.sendFile(directPath);
  }

  try {
    const files = fs.readdirSync(__dirname);
    const match = files.find(f => f.toLowerCase() === `${page.toLowerCase()}.html`);
    if (match) {
      return res.sendFile(path.join(__dirname, match));
    }
  } catch {
    // Continue to next handler if directory reading fails
  }

  next();
});

// Root fallback to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ThatVetGuy server listening on http://0.0.0.0:${PORT}`);
});
