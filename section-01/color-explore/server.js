const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const COLORS_FILE = path.join(__dirname, 'data', 'colors.json');
const CLICKS_FILE = path.join(__dirname, 'data', 'clicks.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function readJson(file, fallback) {
  try {
    const parsed = JSON.parse(await fs.readFile(file, 'utf8'));
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

// Serialize writes so rapid clicks can't interleave; write atomically via rename.
let writeQueue = Promise.resolve();
function appendClick(entry) {
  const task = writeQueue.then(async () => {
    const clicks = await readJson(CLICKS_FILE, []);
    clicks.push(entry);
    const tmp = `${CLICKS_FILE}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(clicks, null, 2));
    await fs.rename(tmp, CLICKS_FILE);
  });
  writeQueue = task.catch(() => {});
  return task;
}

app.get('/api/colors', async (req, res) => {
  res.json(await readJson(COLORS_FILE, []));
});

app.post('/api/clicks', async (req, res) => {
  const hex = String(req.body?.hex || '').toUpperCase();
  const colors = await readJson(COLORS_FILE, []);
  const color = colors.find((c) => c.hex.toUpperCase() === hex);
  if (!color) return res.status(400).json({ error: 'Unknown color' });
  try {
    await appendClick({ hex: color.hex, name: color.name, timestamp: new Date().toISOString() });
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not save click' });
  }
});

app.get('/api/clicks/recent', async (req, res) => {
  await writeQueue;
  const clicks = await readJson(CLICKS_FILE, []);
  const seen = new Set();
  const recent = [];
  for (let i = clicks.length - 1; i >= 0 && recent.length < 5; i--) {
    if (!seen.has(clicks[i].hex)) {
      seen.add(clicks[i].hex);
      recent.push(clicks[i]);
    }
  }
  res.json(recent);
});

app.listen(PORT, () => console.log(`Color Palette Explorer running at http://localhost:${PORT}`));
