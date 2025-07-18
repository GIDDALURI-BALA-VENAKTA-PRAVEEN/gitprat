import puppeteer from 'puppeteer';

async function getDmartBannerImages() {
  try {
    const url = 'https://www.dmart.in/';
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setViewport({ width: 1200, height: 800 });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

    // Wait for swiper to load
    await page.waitForSelector('.swiper-slide img', { timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 3000)); // allow slides to render

    // Swipe/click through all slides to load all images
    const totalSlides = await page.evaluate(() => {
      return document.querySelectorAll('.swiper-slide').length;
    });
    for (let i = 0; i < totalSlides; i++) {
      await page.evaluate(() => {
        const nextBtn = document.querySelector('.swiper-button-next');
        if (nextBtn) nextBtn.click();
      });
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Collect all images
    const allImages = await page.evaluate(() => {
      const imgEls = Array.from(document.querySelectorAll('.swiper-slide img'));
      return imgEls.map((img, i) => ({
        url: img.src,
        alt: img.alt || '',
        title: img.alt || `DMart Banner ${i + 1}`
      }));
    });

    await browser.close();

    // Remove duplicates
    const seen = new Set();
    const uniqueImages = allImages.filter(img => {
      if (seen.has(img.url)) return false;
      seen.add(img.url);
      return true;
    });

    const banners = uniqueImages.map(img => ({
      ...img,
      type: 'dmart',
      source: 'dmart'
    }));

    return {
      count: banners.length,
      images: banners
    };
  } catch (error) {
    console.error('Error scraping DMart banners:', error);
    const sampleData = getSampleDmartBannerData();
    return {
      count: sampleData.length,
      images: sampleData
    };
  }
}

function getSampleDmartBannerData() {
  return [
    {
      url: 'https://cdn.dmart.in/images/rwd-mobile/banners/hmpg/1aug24-crsl-womenscorner1.jpg',
      type: 'dmart',
      source: 'sample',
      title: "Women's Corner",
      alt: "Women's Corner"
    }
  ];
}

// --- Ratnadeep Scraper ---
async function getRatnadeepFlyerImages(retryCount = 0) {
  const maxRetries = 3;
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1200, height: 800 });
    await page.goto('https://www.rdclick.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Wait for the main container, with longer timeout
    try {
      await page.waitForSelector('.desktopContainer img', { timeout: 20000 });
    } catch (error) {
      console.log('Ratnadeep: .desktopContainer img selector not found, retrying...');
      throw error;
    }

    // Wait a bit for images to render
    await new Promise(resolve => setTimeout(resolve, 4000));

    const flyerImages = await page.evaluate(() => {
      // Exclude images inside the category section (goNCXJ)
      const categorySection = document.querySelector('.goNCXJ');
      const excludedImgs = new Set();
      if (categorySection) {
        categorySection.querySelectorAll('img').forEach(img => {
          excludedImgs.add(img);
        });
      }

      const flyers = [];
      document.querySelectorAll('.desktopContainer img').forEach(img => {
        const src = img.getAttribute('src');
        if (
          src &&
          src.includes('logos-section') &&
          !excludedImgs.has(img)
        ) {
          flyers.push({
            url: src.startsWith('http') ? src : `https://apigw.rdclick.com${src}`,
            link: "https://www.rdclick.com/",
            source: 'ratnadeep'
          });
        }
      });
      // Return all unique images
      return flyers.filter((flyer, idx, self) =>
        idx === self.findIndex(f => f.url === flyer.url)
      );
    });

    return flyerImages;
  } catch (error) {
    console.error(`Error scraping Ratnadeep flyers with Puppeteer (attempt ${retryCount + 1}):`, error.message);
    if (retryCount < maxRetries) {
      console.log(`Retrying Ratnadeep flyer scrape in 30 seconds... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 30000));
      return getRatnadeepFlyerImages(retryCount + 1);
    }
    // Fallback: always return the 4 known images
    return getRatnadeepflyerData();
  } finally {
    if (browser) await browser.close();
  }
}

function getRatnadeepflyerData() {
  return [
    {
      url: "https://apigw.rdclick.com/ecommerce-gateway/api/logos-section/6edcdd99-d5e5-4f7b-b824-2fc83cd11a50ThailandBanner.webp",
      link: "https://www.rdclick.com/",
      source: 'ratnadeep'
    },
    {
      url: "https://apigw.rdclick.com/ecommerce-gateway/api/logos-section/196544b5-dd14-4348-b457-c9f984ac2b01snack-stream-banner.webp",
      link: "https://www.rdclick.com/",
      source: 'ratnadeep'
    },
    {
      url: "https://apigw.rdclick.com/ecommerce-gateway/api/logos-section/74de6ab9-ac0c-4d86-a7bc-b724973f747aimported-banner.webp",
      link: "https://www.rdclick.com/",
      source: 'ratnadeep'
    },
    {
      url: "https://apigw.rdclick.com/ecommerce-gateway/api/logos-section/f1ff1e34-faef-4cdd-9ef4-df49b77677e5biscuits-banner.webp",
      link: "https://www.rdclick.com/",
      source: 'ratnadeep'
    }
  ];
}

export { getDmartBannerImages, getSampleDmartBannerData, getRatnadeepFlyerImages, getRatnadeepflyerData };
