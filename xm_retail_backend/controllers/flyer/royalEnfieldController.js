import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

export const getRoyalEnfieldFlyers = (req, res) => {
  const filePath = path.join(__dirname, '../../uploads/royalEnfieldFlyers.json');
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    let parsed;
    try {
      parsed = JSON.parse(data);
    } catch {
      return res.status(500).json({ error: 'Invalid flyers data' });
    }
    if (Array.isArray(parsed)) {
      res.json({ count: parsed.length, flyers: parsed });
    } else if (parsed && typeof parsed === 'object' && parsed.flyers && typeof parsed.count === 'number') {
      res.json(parsed);
    } else {
      res.status(500).json({ error: 'Unexpected flyers data format' });
    }
  } else {
    res.status(404).json({ error: 'No flyers found' });
  }
}; 