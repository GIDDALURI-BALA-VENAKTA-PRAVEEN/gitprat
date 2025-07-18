import cron from 'node-cron';
import { getDmartBannerImages, getSampleDmartBannerData, getRatnadeepFlyerImages, getRatnadeepflyerData } from '../scrapers/GroceryScraper.js';

global.cachedDmartBanners = global.cachedDmartBanners || [];
global.lastDmartCacheTime = global.lastDmartCacheTime || null;

global.cachedRatnadeepFlyers = global.cachedRatnadeepFlyers || [];
global.lastRatnadeepCacheTime = global.lastRatnadeepCacheTime || null;

const refreshDmartBannerCache = async () => {
  try {
    const banners = await getDmartBannerImages();
    if (banners.count === 0) {
      global.cachedDmartBanners = getSampleDmartBannerData();
    } else {
      global.cachedDmartBanners = banners.images;
    }
    global.lastDmartCacheTime = Date.now();
  } catch (error) {
    global.cachedDmartBanners = getSampleDmartBannerData();
    global.lastDmartCacheTime = Date.now();
  }
};

const scheduleDmartBannerCacheRefresh = () => {
  cron.schedule('0 */6 * * *', refreshDmartBannerCache, {
    scheduled: true,
    timezone: 'Asia/Kolkata'
  });
};

const initializeDmartBannerCache = async () => {
  await refreshDmartBannerCache();
};

const manualDmartRefresh = async () => {
  await refreshDmartBannerCache();
};

const refreshRatnadeepFlyerCache = async () => {
  try {
    const flyers = await getRatnadeepFlyerImages();
    if (!flyers || flyers.length === 0) {
      global.cachedRatnadeepFlyers = getRatnadeepflyerData();
    } else {
      global.cachedRatnadeepFlyers = flyers;
    }
    global.lastRatnadeepCacheTime = Date.now();
  } catch (error) {
    global.cachedRatnadeepFlyers = getRatnadeepflyerData();
    global.lastRatnadeepCacheTime = Date.now();
  }
};

const scheduleRatnadeepFlyerCacheRefresh = () => {
  cron.schedule('0 */6 * * *', refreshRatnadeepFlyerCache, {
    scheduled: true,
    timezone: 'Asia/Kolkata'
  });
};

const initializeRatnadeepFlyerCache = async () => {
  await refreshRatnadeepFlyerCache();
};

const manualRatnadeepRefresh = async () => {
  await refreshRatnadeepFlyerCache();
};

export {
  scheduleDmartBannerCacheRefresh,
  initializeDmartBannerCache,
  manualDmartRefresh,
  refreshDmartBannerCache,
  scheduleRatnadeepFlyerCacheRefresh,
  initializeRatnadeepFlyerCache,
  manualRatnadeepRefresh,
  refreshRatnadeepFlyerCache
}; 