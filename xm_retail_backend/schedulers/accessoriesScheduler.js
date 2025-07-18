// accessoriesScheduler.js
import { scrapeAccessories } from '../scrapers/accessoriesScraper.js';

let accessoriesCache = [];

export async function initializeAccessoriesCache() {
  accessoriesCache = await scrapeAccessories();
}

export function scheduleAccessoriesCacheRefresh() {
  setInterval(async () => {
    accessoriesCache = await scrapeAccessories();
    console.log('Accessories cache refreshed');
  }, 1000 * 60 * 60); // every hour
}

export function getAccessoriesCache() {
  return accessoriesCache;
}
