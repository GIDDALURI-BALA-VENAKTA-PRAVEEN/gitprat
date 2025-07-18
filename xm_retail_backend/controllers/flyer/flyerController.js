import { getCromaFlyerImages, getLuluFlyerImages, getSarathCityFlyerImages, getSampleFlyerData, getSampleLuluFlyerData, getSampleSarathCityFlyerData } from '../../scrapers/flyerScraper.js';

// Use global cache from scheduler
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Get all flyers (both Croma and Lulu)
const getFlyers = async (req, res) => {
  try {
    const now = Date.now();
    
    // Check if global cache is valid
    if (global.cachedFlyers && global.cachedFlyers.length > 0 && global.lastCacheTime && (now - global.lastCacheTime) < CACHE_DURATION) {
      return res.status(200).json({
        success: true,
        data: global.cachedFlyers,
        source: 'cache',
        timestamp: global.lastCacheTime
      });
    }

    // Try to fetch from Croma
    let flyers = await getCromaFlyerImages();
    
    // If no flyers found from Croma, use sample data
    if (flyers.length === 0) {
      flyers = getSampleFlyerData();
    }

    // Update global cache
    global.cachedFlyers = flyers;
    global.lastCacheTime = now;

    res.status(200).json({
      success: true,
      data: flyers,
      source: flyers.length > 0 && flyers[0].source === 'croma' ? 'croma' : 'sample',
      timestamp: now
    });

  } catch (error) {
    // Return sample data as fallback
    const sampleFlyers = getSampleFlyerData();
    res.status(200).json({
      success: true,
      data: sampleFlyers,
      source: 'sample',
      error: 'Using sample data due to scraping error'
    });
  }
};

// Refresh flyer cache manually
const refreshFlyers = async (req, res) => {
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

    res.status(200).json({
      success: true,
      message: 'Flyer cache refreshed successfully',
      data: {
        croma: global.cachedFlyers,
        lulu: global.cachedLuluFlyers,
        sarathcity: global.cachedSarathCityFlyers
      },
      timestamp: global.lastCacheTime
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to refresh flyer cache',
      error: error.message
    });
  }
};

// Get flyer by ID
const getFlyerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!global.cachedFlyers || !global.cachedFlyers.length) {
      // Try to fetch flyers if cache is empty
      const flyers = await getCromaFlyerImages();
      global.cachedFlyers = flyers.length > 0 ? flyers : getSampleFlyerData();
    }

    const flyer = global.cachedFlyers[parseInt(id)];
    
    if (!flyer) {
      return res.status(404).json({
        success: false,
        message: 'Flyer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: flyer
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flyer',
      error: error.message
    });
  }
};

// Get cache status
const getCacheStatus = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        cromaCacheSize: global.cachedFlyers ? global.cachedFlyers.length : 0,
        luluCacheSize: global.cachedLuluFlyers ? global.cachedLuluFlyers.length : 0,
        sarathcityCacheSize: global.cachedSarathCityFlyers ? global.cachedSarathCityFlyers.length : 0,
        lastUpdate: global.lastCacheTime,
        lastSarathCityUpdate: global.lastSarathCityCacheTime,
        isExpired: global.lastCacheTime ? (Date.now() - global.lastCacheTime) > CACHE_DURATION : true,
        isSarathCityExpired: global.lastSarathCityCacheTime ? (Date.now() - global.lastSarathCityCacheTime) > CACHE_DURATION : true,
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

// Get Croma flyers specifically
const getCromaFlyers = async (req, res) => {
  try {
    const now = Date.now();
    
    // Check if global cache is valid
    if (global.cachedFlyers && global.cachedFlyers.length > 0 && global.lastCacheTime && (now - global.lastCacheTime) < CACHE_DURATION) {
      // Filter only Croma flyers from cache
      const cromaFlyers = global.cachedFlyers.filter(flyer => flyer.source === 'croma');
      
      return res.status(200).json({
        success: true,
        data: cromaFlyers,
        source: 'cache',
        timestamp: global.lastCacheTime,
        total: cromaFlyers.length
      });
    }

    // Try to fetch fresh Croma data
    const flyers = await getCromaFlyerImages();
    
    // Update global cache
    global.cachedFlyers = flyers;
    global.lastCacheTime = now;

    res.status(200).json({
      success: true,
      data: flyers,
      source: 'croma',
      timestamp: now,
      total: flyers.length
    });

  } catch (error) {
    // Return empty array if no Croma flyers available
    res.status(200).json({
      success: true,
      data: [],
      source: 'error',
      error: 'Failed to fetch Croma flyers',
      total: 0
    });
  }
};

// Get Lulu flyers specifically
const getLuluFlyers = async (req, res) => {
  try {
    const now = Date.now();
    
    // Check if global cache is valid
    if (global.cachedLuluFlyers && global.cachedLuluFlyers.length > 0 && global.lastCacheTime && (now - global.lastCacheTime) < CACHE_DURATION) {
      return res.status(200).json({
        success: true,
        data: global.cachedLuluFlyers,
        source: 'cache',
        timestamp: global.lastCacheTime,
        total: global.cachedLuluFlyers.length
      });
    }

    // Try to fetch fresh Lulu data
    const flyers = await getLuluFlyerImages();
    
    // If no flyers found from Lulu, use sample data
    if (flyers.length === 0) {
      const sampleFlyers = getSampleLuluFlyerData();
      global.cachedLuluFlyers = sampleFlyers;
      global.lastCacheTime = now;
      
      return res.status(200).json({
        success: true,
        data: sampleFlyers,
        source: 'sample',
        timestamp: now,
        total: sampleFlyers.length
      });
    }
    
    // Update global cache
    global.cachedLuluFlyers = flyers;
    global.lastCacheTime = now;

    res.status(200).json({
      success: true,
      data: flyers,
      source: 'lulu',
      timestamp: now,
      total: flyers.length
    });

  } catch (error) {
    // Return sample data as fallback
    const sampleFlyers = getSampleLuluFlyerData();
    res.status(200).json({
      success: true,
      data: sampleFlyers,
      source: 'sample',
      error: 'Using sample data due to scraping error',
      total: sampleFlyers.length
    });
  }
};

// Get Sarath City flyers specifically
const getSarathCityFlyers = async (req, res) => {
  try {
    const now = Date.now();
    
    // Check if global cache is valid
    if (global.cachedSarathCityFlyers && global.cachedSarathCityFlyers.length > 0 && global.lastSarathCityCacheTime && (now - global.lastSarathCityCacheTime) < CACHE_DURATION) {
      return res.status(200).json({
        success: true,
        data: global.cachedSarathCityFlyers,
        source: 'cache',
        timestamp: global.lastSarathCityCacheTime,
        total: global.cachedSarathCityFlyers.length
      });
    }

    // Try to fetch fresh Sarath City data
    const flyers = await getSarathCityFlyerImages();
    
    // If no flyers found, use sample data
    if (flyers.length === 0) {
      global.cachedSarathCityFlyers = getSampleSarathCityFlyerData();
    } else {
      global.cachedSarathCityFlyers = flyers;
    }
    
    global.lastSarathCityCacheTime = now;

    res.status(200).json({
      success: true,
      data: global.cachedSarathCityFlyers,
      source: flyers.length > 0 ? 'sarathcity' : 'sample',
      timestamp: now,
      total: global.cachedSarathCityFlyers.length
    });

  } catch (error) {
    // Return sample data as fallback
    const sampleFlyers = getSampleSarathCityFlyerData();
    res.status(200).json({
      success: true,
      data: sampleFlyers,
      source: 'sample',
      error: 'Using sample data due to scraping error',
      total: sampleFlyers.length
    });
  }
};

export {
  getFlyers,
  refreshFlyers,
  getFlyerById,
  getCacheStatus,
  getCromaFlyers,
  getLuluFlyers,
  getSarathCityFlyers
}; 