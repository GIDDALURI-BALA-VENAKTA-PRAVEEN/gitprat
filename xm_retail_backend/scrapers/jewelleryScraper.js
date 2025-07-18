import puppeteer from 'puppeteer';

async function getJewelleryBannerImages() {
  let browser;
  try {
    const url = 'https://www.emmadisilverjewellery.in/collections/wedding-collection';
    
    // Launch browser with better settings for reliability
    browser = await puppeteer.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();

    // Set better user agent and viewport
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1200, height: 800 });

    // Increase timeout and add better navigation options
    await page.goto(url, { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });

    // Wait for page to be fully loaded
    await page.waitForTimeout(5000);

    // Try to wait for slideshow with fallback
    try {
      await page.waitForSelector('.slideshow__slide img', { timeout: 15000 });
    } catch (error) {
      console.log('Slideshow selector not found, continuing with other selectors...');
    }

    // Collect all banner images from slideshow with error handling
    let bannerImages = [];
    try {
      bannerImages = await page.evaluate(() => {
        const imgEls = Array.from(document.querySelectorAll('.slideshow__slide img'));
        return imgEls.map((img, i) => ({
          url: img.src,
          alt: img.alt || '',
          title: img.alt || `Emmadi Jewellery Banner ${i + 1}`,
          type: 'banner'
        }));
      });
    } catch (error) {
      console.log('Error collecting banner images:', error.message);
    }

    // Collect wedding collection category images
    let categoryImages = [];
    try {
      categoryImages = await page.evaluate(() => {
        const imgEls = Array.from(document.querySelectorAll('.wedding-collection-block img'));
        return imgEls.map((img, i) => ({
          url: img.src,
          alt: img.alt || '',
          title: img.alt || `Wedding Collection ${i + 1}`,
          type: 'category'
        }));
      });
    } catch (error) {
      console.log('Error collecting category images:', error.message);
    }

    // Collect bridal collection images
    let bridalImages = [];
    try {
      bridalImages = await page.evaluate(() => {
        const imgEls = Array.from(document.querySelectorAll('.three-block-section img'));
        return imgEls.map((img, i) => ({
          url: img.src,
          alt: img.alt || '',
          title: img.alt || `Bridal Collection ${i + 1}`,
          type: 'bridal'
        }));
      });
    } catch (error) {
      console.log('Error collecting bridal images:', error.message);
    }

    // Combine all images
    const allImages = [...bannerImages, ...categoryImages, ...bridalImages];

    // Remove duplicates
    const seen = new Set();
    const uniqueImages = allImages.filter(img => {
      if (seen.has(img.url)) return false;
      seen.add(img.url);
      return true;
    });

    const jewelleryImages = uniqueImages.map(img => ({
      ...img,
      type: 'jewellery',
      source: 'emmadisilverjewellery'
    }));

    return {
      count: jewelleryImages.length,
      images: jewelleryImages
    };
  } catch (error) {
    console.error('Error scraping Emmadi Jewellery banners:', error);
    const sampleData = getSampleJewelleryBannerData();
    return {
      count: sampleData.length,
      images: sampleData
    };
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        console.log('Error closing browser:', error.message);
      }
    }
  }
}

function getSampleJewelleryBannerData() {
  return [
    {
      url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      type: 'jewellery',
      source: 'sample',
      title: 'Wedding Collection',
      alt: 'Elegant wedding jewellery collection',
      category: 'banner'
    },
    {
      url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      type: 'jewellery',
      source: 'sample',
      title: 'Bridal Necklace Set',
      alt: 'Traditional bridal necklace set',
      category: 'necklace'
    },
    {
      url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      type: 'jewellery',
      source: 'sample',
      title: 'Silver Earrings',
      alt: 'Beautiful silver earrings collection',
      category: 'earrings'
    },
    {
      url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      type: 'jewellery',
      source: 'sample',
      title: 'Traditional Bangles',
      alt: 'Traditional silver bangles',
      category: 'bangles'
    },
    {
      url: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      type: 'jewellery',
      source: 'sample',
      title: 'Wedding Day Collection',
      alt: 'Complete wedding day jewellery set',
      category: 'bridal'
    }
  ];
}

export { getJewelleryBannerImages, getSampleJewelleryBannerData }; 