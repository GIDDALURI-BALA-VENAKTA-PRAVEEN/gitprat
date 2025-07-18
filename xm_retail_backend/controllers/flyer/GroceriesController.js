import { getDmartBannerImages, getSampleDmartBannerData, getRatnadeepFlyerImages, getRatnadeepflyerData } from '../../scrapers/GroceryScraper.js';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const getDmartBanners = async (req, res) => {
  try {
    const now = Date.now();
    if (global.cachedDmartBanners && global.cachedDmartBanners.length > 0 && global.lastDmartCacheTime && (now - global.lastDmartCacheTime) < CACHE_DURATION) {
      return res.status(200).json({
        success: true,
        data: global.cachedDmartBanners,
        source: 'cache',
        timestamp: global.lastDmartCacheTime
      });
    }
    let bannersObj = await getDmartBannerImages();
    let banners = bannersObj.images || [];
    let usingSample = false;
    if (banners.length === 0) {
      banners = getSampleDmartBannerData();
      usingSample = true;
    }
    global.cachedDmartBanners = banners;
    global.lastDmartCacheTime = now;
    res.status(200).json({
      success: true,
      data: usingSample ? [] : banners,
      source: usingSample ? 'sample' : (banners.length > 0 && banners[0].source === 'dmart' ? 'dmart' : 'sample'),
      timestamp: now,
      message: usingSample ? 'Unable to scrape DMart banners. Displaying sample data.' : undefined
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      data: [],
      source: 'sample',
      error: 'Using sample data due to scraping error',
      message: 'Unable to scrape DMart banners. Displaying sample data.'
    });
  }
};

const refreshDmartBanners = async (req, res) => {
  try {
    let bannersObj = await getDmartBannerImages();
    let banners = bannersObj.images || [];
    if (banners.length === 0) {
      banners = getSampleDmartBannerData();
    }
    global.cachedDmartBanners = banners;
    global.lastDmartCacheTime = Date.now();
    res.status(200).json({
      success: true,
      message: 'DMart banner cache refreshed successfully',
      data: banners,
      timestamp: global.lastDmartCacheTime
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to refresh DMart banner cache',
      error: error.message
    });
  }
};

const getDmartBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!global.cachedDmartBanners || !global.cachedDmartBanners.length) {
      let bannersObj = await getDmartBannerImages();
      let banners = bannersObj.images || [];
      global.cachedDmartBanners = banners.length > 0 ? banners : getSampleDmartBannerData();
    }
    const banner = global.cachedDmartBanners[parseInt(id)];
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'DMart banner not found'
      });
    }
    res.status(200).json({
      success: true,
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch DMart banner',
      error: error.message
    });
  }
};

const getDmartCacheStatus = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        dmartCacheSize: global.cachedDmartBanners ? global.cachedDmartBanners.length : 0,
        lastUpdate: global.lastDmartCacheTime,
        isExpired: global.lastDmartCacheTime ? (Date.now() - global.lastDmartCacheTime) > CACHE_DURATION : true,
        cacheDuration: CACHE_DURATION
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get DMart cache status',
      error: error.message
    });
  }
};

// --- Ratnadeep Controllers ---
const RATNADEEP_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const getRatnadeepFlyers = async (req, res) => {
  try {
    const now = Date.now();
    if (global.cachedRatnadeepFlyers && global.cachedRatnadeepFlyers.length > 0 && global.lastRatnadeepCacheTime && (now - global.lastRatnadeepCacheTime) < RATNADEEP_CACHE_DURATION) {
      return res.status(200).json({
        success: true,
        data: global.cachedRatnadeepFlyers,
        source: 'cache',
        timestamp: global.lastRatnadeepCacheTime
      });
    }
    let flyers = await getRatnadeepFlyerImages();
    let usingSample = false;
    if (!flyers || flyers.length === 0) {
      flyers = getRatnadeepflyerData();
      usingSample = true;
    }
    global.cachedRatnadeepFlyers = flyers;
    global.lastRatnadeepCacheTime = now;
    res.status(200).json({
      success: true,
      data: usingSample ? [] : flyers,
      source: usingSample ? 'sample' : (flyers.length > 0 && flyers[0].source === 'ratnadeep' ? 'ratnadeep' : 'sample'),
      timestamp: now,
      message: usingSample ? 'Unable to scrape Ratnadeep flyers. Displaying sample data.' : undefined
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      data: [],
      source: 'sample',
      error: 'Using sample data due to scraping error',
      message: 'Unable to scrape Ratnadeep flyers. Displaying sample data.'
    });
  }
};

const refreshRatnadeepFlyers = async (req, res) => {
  try {
    let flyers = await getRatnadeepFlyerImages();
    if (!flyers || flyers.length === 0) {
      flyers = getRatnadeepflyerData();
    }
    global.cachedRatnadeepFlyers = flyers;
    global.lastRatnadeepCacheTime = Date.now();
    res.status(200).json({
      success: true,
      message: 'Ratnadeep flyer cache refreshed successfully',
      data: flyers,
      timestamp: global.lastRatnadeepCacheTime
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to refresh Ratnadeep flyer cache',
      error: error.message
    });
  }
};

const getRatnadeepFlyerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!global.cachedRatnadeepFlyers || !global.cachedRatnadeepFlyers.length) {
      let flyers = await getRatnadeepFlyerImages();
      global.cachedRatnadeepFlyers = flyers.length > 0 ? flyers : getRatnadeepflyerData();
    }
    const flyer = global.cachedRatnadeepFlyers[parseInt(id)];
    if (!flyer) {
      return res.status(404).json({
        success: false,
        message: 'Ratnadeep flyer not found'
      });
    }
    res.status(200).json({
      success: true,
      data: flyer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Ratnadeep flyer',
      error: error.message
    });
  }
};

const getRatnadeepCacheStatus = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        ratnadeepCacheSize: global.cachedRatnadeepFlyers ? global.cachedRatnadeepFlyers.length : 0,
        lastUpdate: global.lastRatnadeepCacheTime,
        isExpired: global.lastRatnadeepCacheTime ? (Date.now() - global.lastRatnadeepCacheTime) > RATNADEEP_CACHE_DURATION : true,
        cacheDuration: RATNADEEP_CACHE_DURATION
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get Ratnadeep cache status',
      error: error.message
    });
  }
};

export { getDmartBanners, refreshDmartBanners, getDmartBannerById, getDmartCacheStatus, getRatnadeepFlyers, refreshRatnadeepFlyers, getRatnadeepFlyerById, getRatnadeepCacheStatus }; 