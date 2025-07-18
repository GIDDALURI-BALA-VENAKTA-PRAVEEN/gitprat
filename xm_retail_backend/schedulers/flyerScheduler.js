import cron from 'node-cron';
import { getCromaFlyerImages, getLuluFlyerImages, getSampleFlyerData, getSampleLuluFlyerData, getSarathCityFlyerImages, getSampleSarathCityFlyerData } from '../scrapers/flyerScraper.js';

// Global cache variables (shared with controller)
global.cachedFlyers = global.cachedFlyers || [];
global.cachedLuluFlyers = global.cachedLuluFlyers || [];
global.lastCacheTime = global.lastCacheTime || null;

// Function to refresh flyer cache
const refreshFlyerCache = async () => {
  try {
    // Get Croma flyers
    const cromaFlyers = await getCromaFlyerImages();
    if (cromaFlyers.length === 0) {
      global.cachedFlyers = getSampleFlyerData();
    } else {
      global.cachedFlyers = cromaFlyers;
    }
    
    // Get Lulu flyers
    const luluFlyers = await getLuluFlyerImages();
    if (luluFlyers.length === 0) {
      global.cachedLuluFlyers = getSampleLuluFlyerData();
    } else {
      global.cachedLuluFlyers = luluFlyers;
    }
    

       // Get Sarath City flyers
       const sarathCityFlyers = await getSarathCityFlyerImages();
       if (sarathCityFlyers.length === 0) {
         global.cachedSarathCityFlyers = getSampleSarathCityFlyerData();
       } else {
         global.cachedSarathCityFlyers = sarathCityFlyers;
       }
   
    global.lastCacheTime = Date.now();
    global.lastSarathCityCacheTime = Date.now();

  } catch (error) {
    // Use sample data as fallback for both
    global.cachedFlyers = getSampleFlyerData();
    global.cachedLuluFlyers = getSampleLuluFlyerData();
    global.lastCacheTime = Date.now();
  }
};

// Schedule cache refresh every 6 hours
const scheduleFlyerCacheRefresh = () => {
  // Refresh every 6 hours at minute 0
  cron.schedule('0 */6 * * *', refreshFlyerCache, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });
};

// Initial cache load
const initializeFlyerCache = async () => {
  await refreshFlyerCache();
};

// Manual refresh function
const manualRefresh = async () => {
  await refreshFlyerCache();
};

export {
  scheduleFlyerCacheRefresh,
  initializeFlyerCache,
  manualRefresh,
  refreshFlyerCache
}; 