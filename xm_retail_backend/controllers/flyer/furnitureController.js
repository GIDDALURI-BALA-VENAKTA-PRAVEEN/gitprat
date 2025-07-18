import { getFurnitureBannerImages, getSampleFurnitureBannerData } from '../../scrapers/furnitureScraper.js';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const getFurnitureBanners = async (req, res) => {
  try {
    const now = Date.now();
    if (global.cachedFurnitureBanners && global.cachedFurnitureBanners.length > 0 && global.lastFurnitureCacheTime && (now - global.lastFurnitureCacheTime) < CACHE_DURATION) {
      return res.status(200).json({
        success: true,
        data: global.cachedFurnitureBanners,
        source: 'cache',
        timestamp: global.lastFurnitureCacheTime
      });
    }
    
    let banners = await getFurnitureBannerImages();
    let usingSample = false;
    
    if (banners.count === 0) {
      banners = getSampleFurnitureBannerData();
      usingSample = true;
    }
    
    global.cachedFurnitureBanners = banners;
    global.lastFurnitureCacheTime = now;
    
    res.status(200).json({
      success: true,
      data: usingSample ? banners : banners.images,
      source: usingSample ? 'sample' : (banners.images && banners.images.length > 0 && banners.images[0].source === 'ikea' ? 'ikea' : 'sample'),
      timestamp: now,
      message: usingSample ? 'Unable to scrape IKEA furniture banners. Displaying sample data.' : undefined
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      data: [],
      source: 'sample',
      error: 'Using sample data due to scraping error',
      message: 'Unable to scrape IKEA furniture banners. Displaying sample data.'
    });
  }
};

const refreshFurnitureBanners = async (req, res) => {
  try {
    const banners = await getFurnitureBannerImages();
    let usingSample = false;
    
    if (banners.count === 0) {
      global.cachedFurnitureBanners = getSampleFurnitureBannerData();
      usingSample = true;
    } else {
      global.cachedFurnitureBanners = banners.images;
    }
    
    global.lastFurnitureCacheTime = Date.now();
    
    res.status(200).json({
      success: true,
      data: global.cachedFurnitureBanners,
      source: usingSample ? 'sample' : 'ikea',
      timestamp: global.lastFurnitureCacheTime,
      message: usingSample ? 'Using sample data due to scraping failure' : 'Furniture banners refreshed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to refresh furniture banners',
      message: error.message
    });
  }
};

const getFurnitureBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!global.cachedFurnitureBanners || global.cachedFurnitureBanners.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No furniture banners available'
      });
    }
    
    const banner = global.cachedFurnitureBanners.find(b => b.id === id || b._id === id);
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        error: 'Furniture banner not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch furniture banner',
      message: error.message
    });
  }
};

const getFurnitureCacheStatus = async (req, res) => {
  try {
    const now = Date.now();
    const cacheAge = global.lastFurnitureCacheTime ? now - global.lastFurnitureCacheTime : null;
    const isExpired = cacheAge && cacheAge > CACHE_DURATION;
    
    res.status(200).json({
      success: true,
      data: {
        hasCache: !!global.cachedFurnitureBanners && global.cachedFurnitureBanners.length > 0,
        cacheAge: cacheAge,
        isExpired: isExpired,
        lastUpdate: global.lastFurnitureCacheTime ? new Date(global.lastFurnitureCacheTime).toISOString() : null,
        bannerCount: global.cachedFurnitureBanners ? global.cachedFurnitureBanners.length : 0,
        cacheDuration: CACHE_DURATION
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get cache status',
      message: error.message
    });
  }
};

export {
  getFurnitureBanners,
  refreshFurnitureBanners,
  getFurnitureBannerById,
  getFurnitureCacheStatus
}; 