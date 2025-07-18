import express from 'express';
import { 
  getFlyers, 
  refreshFlyers, 
  getFlyerById, 
  getCacheStatus,
  getCromaFlyers,
  getLuluFlyers,
  getSarathCityFlyers
} from '../controllers/flyer/flyerController.js';
import { getDmartBanners, refreshDmartBanners, getDmartBannerById, getDmartCacheStatus, getRatnadeepFlyers, refreshRatnadeepFlyers, getRatnadeepFlyerById, getRatnadeepCacheStatus } from '../controllers/flyer/GroceriesController.js';
import { getJewelleryBanners, refreshJewelleryBanners, getJewelleryBannerById, getJewelleryCacheStatus } from '../controllers/flyer/jewelleryController.js';
import { getFurnitureBanners, refreshFurnitureBanners, getFurnitureBannerById, getFurnitureCacheStatus } from '../controllers/flyer/furnitureController.js';
import { 
  getSwiggyRestaurants, 
  testSwiggyEndpoint, 
  testImageNormalization,
  getSwiggyCacheStatus,
  refreshSwiggyCache,
  testFallbackImages,
  testSwiggyImageAccess
} from '../controllers/flyer/swiggyController.js';
import { getRoyalEnfieldFlyers } from '../controllers/flyer/royalEnfieldController.js';
import { getAccessories, refreshAccessories } from '../controllers/flyer/accessoriesController.js';

const router = express.Router();

// Get all flyers
router.get('/', getFlyers);

// Get Croma flyers specifically
router.get('/croma', getCromaFlyers);

// Get Lulu flyers specifically
router.get('/lulu', getLuluFlyers);

// Get Sarath City flyers specifically
router.get('/sarathcity', getSarathCityFlyers);

// DMart banners endpoints
router.get('/dmart', getDmartBanners);
router.post('/dmart/refresh', refreshDmartBanners);
router.get('/dmart/:id', getDmartBannerById);
router.get('/dmart/cache/status', getDmartCacheStatus);

// Ratnadeep flyers endpoints
router.get('/ratnadeep', getRatnadeepFlyers);
router.post('/ratnadeep/refresh', refreshRatnadeepFlyers);
router.get('/ratnadeep/:id', getRatnadeepFlyerById);
router.get('/ratnadeep/cache/status', getRatnadeepCacheStatus);

// Jewellery banners endpoints
router.get('/jewellery', getJewelleryBanners);
router.post('/jewellery/refresh', refreshJewelleryBanners);
router.get('/jewellery/:id', getJewelleryBannerById);
router.get('/jewellery/cache/status', getJewelleryCacheStatus);

// Furniture banners endpoints
router.get('/furniture', getFurnitureBanners);
router.post('/furniture/refresh', refreshFurnitureBanners);
router.get('/furniture/:id', getFurnitureBannerById);
router.get('/furniture/cache/status', getFurnitureCacheStatus);

// Swiggy restaurants endpoints
router.get('/swiggy-restaurants', getSwiggyRestaurants);
router.get('/swiggy-test', testSwiggyEndpoint);
router.get('/swiggy-normalization-test', testImageNormalization);
router.get('/swiggy-fallback-test', testFallbackImages);
router.get('/swiggy-image-access-test', testSwiggyImageAccess);
router.get('/swiggy/cache/status', getSwiggyCacheStatus);
router.post('/swiggy/refresh', refreshSwiggyCache);

// Accessories endpoints
router.get('/accessories', getAccessories);
router.post('/accessories/refresh', refreshAccessories);

// Refresh flyer cache manually
router.post('/refresh', refreshFlyers);

// Get cache status
router.get('/cache/status', getCacheStatus);

// Get flyer by ID (generic, must be last)
router.get('/royalenfield', getRoyalEnfieldFlyers);
router.get('/:id', getFlyerById);

export default router;