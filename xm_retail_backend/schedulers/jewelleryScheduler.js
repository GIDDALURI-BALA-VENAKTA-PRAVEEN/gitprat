import cron from 'node-cron';
import { getJewelleryBannerImages, getSampleJewelleryBannerData } from '../scrapers/jewelleryScraper.js';

global.cachedJewelleryBanners = global.cachedJewelleryBanners || [];
global.lastJewelleryCacheTime = global.lastJewelleryCacheTime || null;

const refreshJewelleryBannerCache = async (retryCount = 0) => {
  const maxRetries = 3;
  
  try {
    console.log(`🔄 Refreshing jewellery banner cache (attempt ${retryCount + 1}/${maxRetries + 1})`);
    
    const banners = await getJewelleryBannerImages();
    if (banners.count === 0) {
      console.log('⚠️  No banners found, using sample data');
      global.cachedJewelleryBanners = getSampleJewelleryBannerData();
    } else {
      console.log(`✅ Successfully cached ${banners.count} jewellery banners`);
      global.cachedJewelleryBanners = banners.images;
    }
    global.lastJewelleryCacheTime = Date.now();
  } catch (error) {
    console.error(`❌ Error refreshing jewellery banner cache (attempt ${retryCount + 1}):`, error.message);
    
    if (retryCount < maxRetries) {
      console.log(`🔄 Retrying in 30 seconds... (${retryCount + 1}/${maxRetries})`);
      setTimeout(() => {
        refreshJewelleryBannerCache(retryCount + 1);
      }, 30000);
      return;
    }
    
    console.log('⚠️  All retries failed, using sample data');
    global.cachedJewelleryBanners = getSampleJewelleryBannerData();
    global.lastJewelleryCacheTime = Date.now();
  }
};

const scheduleJewelleryBannerCacheRefresh = () => {
  // Run every 6 hours instead of every hour to reduce load
  cron.schedule('0 */6 * * *', () => {
    refreshJewelleryBannerCache();
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata'
  });
  
  console.log('📅 Jewellery banner cache refresh scheduled for every 6 hours');
};

const initializeJewelleryBannerCache = async () => {
  console.log('🚀 Initializing jewellery banner cache...');
  await refreshJewelleryBannerCache();
  console.log('✅ Jewellery banner cache initialized');
};

const manualJewelleryRefresh = async () => {
  console.log('🔄 Manual jewellery banner refresh triggered');
  await refreshJewelleryBannerCache();
};

export {
  refreshJewelleryBannerCache,
  scheduleJewelleryBannerCacheRefresh,
  initializeJewelleryBannerCache,
  manualJewelleryRefresh
}; 