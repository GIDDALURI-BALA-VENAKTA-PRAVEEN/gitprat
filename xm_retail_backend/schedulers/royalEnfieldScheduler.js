import { fetchRoyalEnfieldFlyers } from '../scrapers/royalEnfieldScraper.js';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
const __dirname = dirname(fileURLToPath(import.meta.url));

export async function runRoyalEnfieldScheduler() {
  const { flyers, count } = await fetchRoyalEnfieldFlyers();
  fs.writeFileSync(
    path.join(__dirname, '../uploads/royalEnfieldFlyers.json'),
    JSON.stringify(flyers, null, 2)
  );
  //console.log(`Royal Enfield flyers updated. Total motorcycles scraped: ${count}`);
}

export function scheduleRoyalEnfieldFlyerRefresh() {
  cron.schedule('0 */6 * * *', runRoyalEnfieldScheduler, {
    scheduled: true,
    timezone: 'Asia/Kolkata'
  });
}