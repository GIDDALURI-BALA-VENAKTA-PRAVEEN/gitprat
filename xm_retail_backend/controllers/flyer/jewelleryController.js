import { getJewelleryBannerImages, getSampleJewelleryBannerData } from '../../scrapers/jewelleryScraper.js';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const getJewelleryBanners = async (req, res) => {
  try {
    const now = Date.now();
    if (global.cachedJewelleryBanners && global.cachedJewelleryBanners.length > 0 && global.lastJewelleryCacheTime && (now - global.lastJewelleryCacheTime) < CACHE_DURATION) {
      return res.status(200).json({
        success: true,
        data: global.cachedJewelleryBanners,
        source: 'cache',
        timestamp: global.lastJewelleryCacheTime
      });
    }
    
    let banners = await getJewelleryBannerImages();
    let usingSample = false;
    
    if (banners.count === 0) {
      banners = getSampleJewelleryBannerData();
      usingSample = true;
    }
    
    global.cachedJewelleryBanners = banners;
    global.lastJewelleryCacheTime = now;
    
    res.status(200).json({
      success: true,
      data: usingSample ? banners : banners.images,
      source: usingSample ? 'sample' : (banners.images && banners.images.length > 0 && banners.images[0].source === 'emmadisilverjewellery' ? 'emmadisilverjewellery' : 'sample'),
      timestamp: now,
      message: usingSample ? 'Unable to scrape Emmadi Jewellery banners. Displaying sample data.' : undefined
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      data: [],
      source: 'sample',
      error: 'Using sample data due to scraping error',
      message: 'Unable to scrape Emmadi Jewellery banners. Displaying sample data.'
    });
  }
};

const refreshJewelleryBanners = async (req, res) => {
  try {
    let banners = await getJewelleryBannerImages();
    if (banners.count === 0) {
      banners = getSampleJewelleryBannerData();
    }
    global.cachedJewelleryBanners = banners;
    global.lastJewelleryCacheTime = Date.now();
    res.status(200).json({
      success: true,
      message: 'Jewellery banner cache refreshed successfully',
      data: banners,
      timestamp: global.lastJewelleryCacheTime
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to refresh Jewellery banner cache',
      error: error.message
    });
  }
};

const getJewelleryBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!global.cachedJewelleryBanners || !global.cachedJewelleryBanners.length) {
      let banners = await getJewelleryBannerImages();
      global.cachedJewelleryBanners = banners.count > 0 ? banners.images : getSampleJewelleryBannerData();
    }
    const banner = global.cachedJewelleryBanners[parseInt(id)];
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Jewellery banner not found'
      });
    }
    res.status(200).json({
      success: true,
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Jewellery banner',
      error: error.message
    });
  }
};

const getJewelleryCacheStatus = async (req, res) => {
  try {
    const now = Date.now();
    const cacheAge = global.lastJewelleryCacheTime ? now - global.lastJewelleryCacheTime : null;
    const isExpired = cacheAge && cacheAge > CACHE_DURATION;
    
    res.status(200).json({
      success: true,
      data: {
        hasCache: !!global.cachedJewelleryBanners && global.cachedJewelleryBanners.length > 0,
        cacheAge: cacheAge,
        isExpired: isExpired,
        lastUpdate: global.lastJewelleryCacheTime,
        bannerCount: global.cachedJewelleryBanners ? global.cachedJewelleryBanners.length : 0,
        cacheDuration: CACHE_DURATION
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get cache status',
      error: error.message
    });
  }
};

export { 
  getJewelleryBanners, 
  refreshJewelleryBanners, 
  getJewelleryBannerById, 
  getJewelleryCacheStatus 
}; 