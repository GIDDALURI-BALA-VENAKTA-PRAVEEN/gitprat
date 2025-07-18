import cron from 'node-cron';
import { getFurnitureBannerImages, getSampleFurnitureBannerData } from '../scrapers/furnitureScraper.js';

global.cachedFurnitureBanners = global.cachedFurnitureBanners || [];
global.lastFurnitureCacheTime = global.lastFurnitureCacheTime || null;

const refreshFurnitureBannerCache = async () => {
  try {
    const banners = await getFurnitureBannerImages();
    if (banners.count === 0) {
      global.cachedFurnitureBanners = getSampleFurnitureBannerData();
    } else {
      global.cachedFurnitureBanners = banners.images;
    }
    global.lastFurnitureCacheTime = Date.now();
  } catch (error) {
    global.cachedFurnitureBanners = getSampleFurnitureBannerData();
    global.lastFurnitureCacheTime = Date.now();
  }
};

const scheduleFurnitureBannerCacheRefresh = () => {
  cron.schedule('0 */6 * * *', refreshFurnitureBannerCache, {
    scheduled: true,
    timezone: 'Asia/Kolkata'
  });
};

const initializeFurnitureBannerCache = async () => {
  await refreshFurnitureBannerCache();
};

export {
  scheduleFurnitureBannerCacheRefresh,
  initializeFurnitureBannerCache,
  refreshFurnitureBannerCache
}; 