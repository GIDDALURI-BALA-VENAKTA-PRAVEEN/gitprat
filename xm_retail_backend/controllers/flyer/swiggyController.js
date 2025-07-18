// Sample working Swiggy images for fallback (using more reliable URLs)
const SAMPLE_SWIGGY_IMAGES = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80'
];

// Food-specific fallback images
const FOOD_FALLBACK_IMAGES = {
  'biryani': 'https://images.unsplash.com/photo-1563379091339-03246963d8a9?w=400&h=300&fit=crop',
  'chole': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
  'bhature': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
  'pancakes': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
  'omelette': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
  'paratha': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
  'poha': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
  'upma': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
  'vada': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
  'appam': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
  'bath': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
  'salad': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  'juice': 'https://images.unsplash.com/photo-1622597489632-9c6a4c5c0c1e?w=400&h=300&fit=crop',
  'veg': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  'pongal': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
  'default': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
};

// Global cache for Swiggy banners (like Croma flyers)
let cachedSwiggyBanners = [];
let lastSwiggyCacheTime = null;
let lastSwiggyLocation = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Helper function to test if an image URL is accessible
const testImageUrl = async (url) => {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Helper function to generate Swiggy image URL with multiple patterns
const generateSwiggyImageUrl = async (imageId) => {
  if (!imageId) return null;
  
  // If imageId is already a full URL, use it directly
  if (imageId.startsWith('http')) {
    return imageId;
  }
  
  // Handle complex image IDs with paths and special characters
  let processedImageId = imageId;
  
  // If it contains slashes, it's a path-based ID
  if (imageId.includes('/')) {
    // Extract the filename from the path (last part after the last slash)
    const pathParts = imageId.split('/');
    processedImageId = pathParts[pathParts.length - 1];
    
    // Remove file extension if present
    if (processedImageId.includes('.')) {
      processedImageId = processedImageId.split('.')[0];
    }
  }
  
  // Try multiple URL patterns to find a working one
  const urlPatterns = [
    // Pattern 1: Direct Swiggy CDN
    `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_400,h_300/${processedImageId}`,
    // Pattern 2: Alternative Swiggy CDN
    `https://images.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_400,h_300/${processedImageId}`,
    // Pattern 3: Original Cloudinary with URL encoding
    `https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_400,h_300/${encodeURIComponent(imageId)}`,
    // Pattern 4: Original Cloudinary (may be disabled)
    `https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_400,h_300/${processedImageId}`,
    // Pattern 5: Try with original imageId
    `https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_400,h_300/${imageId}`,
    // Pattern 6: Try Swiggy's main website CDN
    `https://www.swiggy.com/image/upload/fl_lossy,f_auto,q_auto,w_400,h_300/${processedImageId}`,
    // Pattern 7: Try without Cloudinary transformation
    `https://res.cloudinary.com/swiggy/image/upload/${processedImageId}`,
    // Pattern 8: Try with different Cloudinary account
    `https://res.cloudinary.com/demo/image/upload/fl_lossy,f_auto,q_auto,w_400,h_300/${processedImageId}`,
    // Pattern 9: Try direct path access
    `https://media-assets.swiggy.com/${imageId}`,
    // Pattern 10: Try with base64 encoding
    `https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_400,h_300/${Buffer.from(imageId).toString('base64')}`,
  ];
  
  // Test each URL pattern
  for (let i = 0; i < urlPatterns.length; i++) {
    const url = urlPatterns[i];
    
    const isAccessible = await testImageUrl(url);
    if (isAccessible) {
      return url;
    }
  }
  
  // Try direct website access as last resort
  const directUrl = await tryFetchFromSwiggyWebsite(imageId);
  if (directUrl) {
    return directUrl;
  }
  
  return null;
};

// Helper function to try fetching image from Swiggy's website
const tryFetchFromSwiggyWebsite = async (imageId) => {
  try {
    // Try to fetch the image from Swiggy's website directly
    const swiggyImageUrl = `https://www.swiggy.com/image/${imageId}`;
    
    const response = await fetch(swiggyImageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.swiggy.com/',
        'Origin': 'https://www.swiggy.com'
      }
    });
    
    if (response.ok) {
      return swiggyImageUrl;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

// Function to get relevant fallback image based on food name
const getRelevantFallbackImage = (imageId) => {
  if (!imageId) return FOOD_FALLBACK_IMAGES.default;
  
  const lowerImageId = imageId.toLowerCase();
  
  // Check for specific food items
  for (const [food, imageUrl] of Object.entries(FOOD_FALLBACK_IMAGES)) {
    if (lowerImageId.includes(food)) {
      return imageUrl;
    }
  }
  
  // Return default if no match found
  return FOOD_FALLBACK_IMAGES.default;
};

// Location-specific fallback banners
const getLocationSpecificFallbackBanners = (lat, lng) => {
  // Determine city based on coordinates (approximate)
  let city = 'your area';
  let citySpecificFood = 'local cuisine';
  
  // Bengaluru coordinates (approximate)
  if (lat >= 12.8 && lat <= 13.2 && lng >= 77.4 && lng <= 77.8) {
    city = 'Bengaluru';
    citySpecificFood = 'Bengaluru Biryani';
  }
  // Mumbai coordinates (approximate)
  else if (lat >= 18.8 && lat <= 19.2 && lng >= 72.7 && lng <= 73.1) {
    city = 'Mumbai';
    citySpecificFood = 'Mumbai Vada Pav';
  }
  // Delhi coordinates (approximate)
  else if (lat >= 28.4 && lat <= 28.9 && lng >= 76.8 && lng <= 77.4) {
    city = 'Delhi';
    citySpecificFood = 'Delhi Chole Bhature';
  }
  // Hyderabad coordinates (approximate)
  else if (lat >= 17.2 && lat <= 17.6 && lng >= 78.2 && lng <= 78.6) {
    city = 'Hyderabad';
    citySpecificFood = 'Hyderabad Biryani';
  }
  // Chennai coordinates (approximate)
  else if (lat >= 12.9 && lat <= 13.2 && lng >= 80.1 && lng <= 80.4) {
    city = 'Chennai';
    citySpecificFood = 'Chennai Idli';
  }
  // Kolkata coordinates (approximate)
  else if (lat >= 22.4 && lat <= 22.8 && lng >= 88.2 && lng <= 88.6) {
    city = 'Kolkata';
    citySpecificFood = 'Kolkata Biryani';
  }
  
  return [
    {
      id: 'fallback-1',
      name: `${city} Biryani Special`,
      imageUrl: FOOD_FALLBACK_IMAGES.biryani,
      link: '#',
      altText: `Authentic ${city} Biryani`,
      originalImageId: `fallback-${city.toLowerCase()}-biryani`,
      isFallback: true
    },
    {
      id: 'fallback-2',
      name: 'Fresh Garden Salad',
      imageUrl: FOOD_FALLBACK_IMAGES.salad,
      link: '#',
      altText: `Fresh ${city} Garden Salad`,
      originalImageId: `fallback-${city.toLowerCase()}-salad`,
      isFallback: true
    },
    {
      id: 'fallback-3',
      name: 'Chole Bhature Delight',
      imageUrl: FOOD_FALLBACK_IMAGES.chole,
      link: '#',
      altText: 'Delicious Chole Bhature',
      originalImageId: `fallback-${city.toLowerCase()}-chole`,
      isFallback: true
    },
    {
      id: 'fallback-4',
      name: 'Fresh Fruit Juice',
      imageUrl: FOOD_FALLBACK_IMAGES.juice,
      link: '#',
      altText: `Refreshing ${city} Juice`,
      originalImageId: `fallback-${city.toLowerCase()}-juice`,
      isFallback: true
    },
    {
      id: 'fallback-5',
      name: 'Fluffy Pancakes',
      imageUrl: FOOD_FALLBACK_IMAGES.pancakes,
      link: '#',
      altText: 'Delicious Pancakes',
      originalImageId: `fallback-${city.toLowerCase()}-pancakes`,
      isFallback: true
    }
  ];
};

export const getSwiggyRestaurants = async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng are required' });

  // Check cache first (like Croma flyers)
  const now = Date.now();
  const currentLocation = `${lat},${lng}`;
  
  if (cachedSwiggyBanners.length > 0 && 
      lastSwiggyCacheTime && 
      lastSwiggyLocation === currentLocation &&
      (now - lastSwiggyCacheTime) < CACHE_DURATION) {
    return res.json({ 
      banners: cachedSwiggyBanners,
      cached: true,
      cacheAge: now - lastSwiggyCacheTime,
      location: currentLocation
    });
  }
  
  try {
    const url = `https://www.swiggy.com/mapi/restaurants/list/v5?offset=0&is-seo-homepage-enabled=true&lat=${lat}&lng=${lng}&carousel=true&third_party_vendor=1`;
    
    // Create dynamic cookies based on user's location
    const dynamicCookies = `deviceId=s%3A14bcba83-e2eb-4775-97d8-8cda5c431500.W9PKhmrFJKTjNOwn7rnhfpsvlT8B%2F%2F7I4LX1LY1iLNk; versionCode=1200; platform=web; subplatform=dweb; statusBarHeight=0; bottomOffset=0; genieTrackOn=false; isNative=false; openIMHP=false; lat=s%3A${lat}.gLsAwK5%2FyFF232bktg4PEmCCHI2k7%2BA3uHBlkQ9ILC8; lng=s%3A${lng}.2yHy53IqGusfyDs%2F6jVtm0IuWDMTpWWhJKBNxsa4hc0; address=s%3Aundefined.H4tl815DCZ6%2Fo5v13eAn2NGFexz2evmgMlUcBAJMXS8; addressId=s%3Aundefined.H4tl815DCZ6%2Fo5v13eAn2NGFexz2evmgMlUcBAJMXS8; webBottomBarHeight=0; _gcl_au=1.1.1529644303.1750317020; _fbp=fb.1.1750317019827.26934733548948212; __SW=Nrmgzndqq_7cmiULztPH2RCPvKBQ2LlQ; _device_id=146d8590-b01b-72d8-bead-25143aafb822; fontsLoaded=1; _gid=GA1.2.1100619794.1750330399; tid=s%3Ac2d96a7f-bcb4-4909-8530-e29bd474335e.%2FreNPVu2%2F8dznh4SVY4d1ley4rmC7lhIKdpgpyj8G%2Fw; ally-on=false; strId=; LocSrc=s%3AseoCty.Ln0AZvvgsCPuKj5IAqQw2NnSsBG0BSCZyoU1v9a5kXs; aws-waf-token=56cf448f-282c-4793-a4f8-98b82ce7e16d:HgoAcjkbtpgCAAAA:E3VfOn4V6HFxy+zAhssQlPu/kGKBopRfcJAww83u0dmDF6yw9+90RhMLlQ6an4QxLd2Q13HJLiohCJlhUA5SqgnkYOr0ETmGH0sE83gTeUC0mNBeAjEHc5RpJYuLw6pGehY1P2/4D2m6IujDpFUxtRbFqnGd0B2cxybYqGDc0Cp+WOtsdZHQmNClAJrBMrv0bMRanfsxc4blMib3L1V6WV2ZKSMMoqKxYSEDbafjLPtpHuJz6L+6; _ga_VEG1HFE5VZ=GS2.1.s1750391853$o2$g1$t1750391874$j39$l0$h0; _ga_8N8XRG907L=GS2.1.s1750391853$o2$g1$t1750391874$j39$l0$h0; _ga_0XZC5MS97H=GS2.1.s1750391853$o2$g1$t1750391874$j39$l0$h0; application_name=; category=; x-channel=; _swuid=146d8590-b01b-72d8-bead-25143aafb822; _is_logged_in=1; _session_tid=87b1b8d7901860352ceaeeda7c7ecd17613d7a6e05a96a24f34ab0cbba25da7e15de0d2564a951f2ed83c51df6ab08457aacfdf3cf097386d55b8114cbc65b5db6c3303e3dcf7c05efa555da2239ea0bac34957bd30465ae01a76a6d4f30687f05e42bdd2a3225a2cdc50a86f91fa0cf; _cid=MTYzMjQxMjU3; dadl=true; _sid=l9t66d0b-8528-405e-b217-fb1185cecdb3; userLocation=${encodeURIComponent(JSON.stringify({lat: parseFloat(lat), lng: parseFloat(lng), address: "Current Location", area: "", showUserDefaultAddressHint: false}))}; _ga_34JYJ0BCRN=GS2.1.s1750421754$o4$g1$t1750421784$j30$l0$h0; _ga_YE38MFJRBZ=GS2.1.s1750421754$o4$g1$t1750421784$j30$l0$h0; AMP_TOKEN=$NOT_FOUND; _ga=GA1.2.1834864280.1750317020; _ga_X3K3CELKLV=GS2.1.s1750421784$o5$g0$t1750422048$j60$l0$h0`;
    
    const response = await fetch(url, {
      headers: {
        '__fetch_req__': 'true',
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
        'cookie': dynamicCookies,
        'if-none-match': 'W/"20e75-y/iyN6svYbM9+wXzc95DmKPd5DU"',
        'platform': 'mweb',
        'priority': 'u=1, i',
        'referer': 'https://www.swiggy.com/restaurants',
        'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'usecache': 'true',
        'user-agent': 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      }
    });
    
    const data = await response.json();

    // Extract banners from imageGridCards.info
    const cards = data?.data?.cards || [];
    
    let banners = [];
    for (const card of cards) {
      const infoList = card.card?.card?.imageGridCards?.info;
      if (infoList) {
        for (const b of infoList) {
          // Handle different image URL formats
          let imageUrl = '';
          let isFallback = false;
          
          if (b.imageId) {
            imageUrl = await generateSwiggyImageUrl(b.imageId);
            
            // If no working URL found, use fallback
            if (!imageUrl) {
              // Use relevant fallback image based on food name
              imageUrl = getRelevantFallbackImage(b.imageId);
              isFallback = true;
            }
          }
          
          // Fallback to a sample image if no valid image URL
          if (!imageUrl) {
            // Use a sample image as fallback
            const randomIndex = Math.floor(Math.random() * SAMPLE_SWIGGY_IMAGES.length);
            imageUrl = SAMPLE_SWIGGY_IMAGES[randomIndex];
            isFallback = true;
          }

          banners.push({
            id: b.id,
            name: b.action?.text || 'Swiggy Offer',
            imageUrl: imageUrl,
            link: b.action?.link || '#',
            altText: b.accessibility?.altText || b.action?.text || 'Swiggy Banner',
            originalImageId: b.imageId, // Keep original for debugging
            isFallback: isFallback
          });
        }
        break;
      }
    }
    
    if (banners.length > 0) {
      // Update cache (like Croma flyers)
      cachedSwiggyBanners = banners;
      lastSwiggyCacheTime = now;
      lastSwiggyLocation = currentLocation;
      
      res.json({ 
        banners,
        cached: false,
        cacheAge: 0,
        source: 'api'
      });
    } else {
      res.json({ 
        banners: [],
        cached: false,
        cacheAge: 0,
        source: 'api'
      });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Swiggy data', details: err.message });
  }
};

// Test endpoint to verify the controller is working
export const testSwiggyEndpoint = async (req, res) => {
  res.json({ 
    message: 'Swiggy controller is working!',
    timestamp: new Date().toISOString(),
    testData: {
      sampleBanner: {
        id: 'test-1',
        name: 'Test Swiggy Offer',
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        link: '#',
        altText: 'Test Banner'
      }
    }
  });
};

// Test endpoint to demonstrate image ID normalization
export const testImageNormalization = async (req, res) => {
  const testImageIds = [
    // Simple IDs like in your working example
    'bmwn4n4bn6n1tcpc8x2h',
    'xqwpuhgnsaf18te7zvtv',
    'mdipoyzfzsa7n7igskht',
    // Complex IDs from Swiggy API
    'IMAGES/MERCH/2025/1/24/af9e1da8-4acd-4414-84c3-80ff71498a01_Salad2.png',
    'IMAGES/MERCH/2024/7/2/6ef07bda-b707-48ea-9b14-2594071593d1_Pancakes.png',
    '69e04ddf-cc9b-4b53-8f66-29f6629b_Poori1',
    'simple_image_id',
    'path/with/slashes/image.jpg',
    'MERCHANDISING_BANNERS/IMAGES/MERCH/2024/7/2/6ef07bda-b707-48ea-9b14-2594071593d1_Orange juice.png'
  ];

  const results = [];
  
  for (const originalId of testImageIds) {
    const imageUrl = await generateSwiggyImageUrl(originalId);
    
    results.push({
      original: originalId,
      generatedUrl: imageUrl,
      sampleUrl: `https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_400,h_300/${originalId}`
    });
  }

  res.json({
    message: 'Image ID normalization test',
    timestamp: new Date().toISOString(),
    results: results
  });
};

// New endpoint to get cache status (like Croma flyers)
export const getSwiggyCacheStatus = async (req, res) => {
  try {
    const now = Date.now();
    const cacheAge = lastSwiggyCacheTime ? now - lastSwiggyCacheTime : null;
    const isExpired = cacheAge && cacheAge > CACHE_DURATION;
    
    res.status(200).json({
      success: true,
      data: {
        hasCache: !!cachedSwiggyBanners && cachedSwiggyBanners.length > 0,
        cacheAge: cacheAge,
        isExpired: isExpired,
        lastUpdate: lastSwiggyCacheTime,
        lastLocation: lastSwiggyLocation,
        bannerCount: cachedSwiggyBanners ? cachedSwiggyBanners.length : 0,
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

// New endpoint to refresh cache manually (like Croma flyers)
export const refreshSwiggyCache = async (req, res) => {
  try {
    // Clear cache to force refresh
    cachedSwiggyBanners = [];
    lastSwiggyCacheTime = null;
    lastSwiggyLocation = null;
    
    res.status(200).json({
      success: true,
      message: 'Swiggy cache cleared successfully. Next request will fetch fresh data for the current location.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to refresh cache',
      error: error.message
    });
  }
};

// Test endpoint to verify fallback images are working
export const testFallbackImages = async (req, res) => {
  try {
    const testBanners = SAMPLE_SWIGGY_IMAGES.map((imageUrl, index) => ({
      id: `test-${index + 1}`,
      name: `Test Food Banner ${index + 1}`,
      imageUrl: imageUrl,
      link: '#',
      altText: `Test food image ${index + 1}`,
      originalImageId: `test-image-${index + 1}`,
      isFallback: true
    }));

    res.json({
      message: 'Fallback images test',
      timestamp: new Date().toISOString(),
      note: 'Swiggy Cloudinary is disabled, using Unsplash fallback images',
      banners: testBanners,
      totalImages: testBanners.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to test fallback images',
      error: error.message
    });
  }
};

// Test endpoint to check Swiggy image accessibility
export const testSwiggyImageAccess = async (req, res) => {
  try {
    const testImageIds = [
      'MERCHANDISING_BANNERS/IMAGES/MERCH/2024/7/2/8f508de7-e0ac-4ba8-b54d-def9db98959e_chole',
      'IMAGES/MERCH/2025/1/24/af9e1da8-4acd-4414-84c3-80ff71498a01_Salad2.png',
      'bmwn4n4bn6n1tcpc8x2h'
    ];

    const results = [];
    
    for (const imageId of testImageIds) {
      const imageUrl = await generateSwiggyImageUrl(imageId);
      
      results.push({
        originalId: imageId,
        generatedUrl: imageUrl,
        isAccessible: !!imageUrl,
        patterns: [
          `https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_400,h_300/${imageId}`,
          `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_400,h_300/${imageId}`,
          `https://images.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_400,h_300/${imageId}`,
        ]
      });
    }

    res.json({
      message: 'Swiggy image accessibility test',
      timestamp: new Date().toISOString(),
      results: results,
      note: 'Check if any patterns work for accessing Swiggy images'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to test image access',
      error: error.message
    });
  }
}; 