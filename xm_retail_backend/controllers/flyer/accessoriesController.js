// accessoriesController.js
import { scrapeAccessories } from '../../scrapers/accessoriesScraper.js';

export async function getAccessories(req, res) {
  try {
    const data = await scrapeAccessories();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function refreshAccessories(req, res) {
  // For now, just re-scrape
  try {
    const data = await scrapeAccessories();
    res.json({ success: true, message: 'Accessories refreshed', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
