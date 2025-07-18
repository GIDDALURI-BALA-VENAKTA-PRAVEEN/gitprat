import axios from 'axios';
import * as cheerio from 'cheerio';

async function getCromaFlyerImages() {
  try {
    const url = "https://www.croma.com";
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(data);
    const flyerImages = [];

    // Look for flyer images in various selectors
    $("picture, img").each((i, el) => {
      const desktopSrc = $(el).find("source[media='(min-width: 768px)']").attr("srcset");
      const mobileSrc = $(el).find("source[media='(max-width: 768px)']").attr("srcset");
      const imgSrc = $(el).attr("src") || $(el).attr("srcset");

      if (desktopSrc && desktopSrc.includes("Croma%20Assets/CMS/LP")) {
        flyerImages.push({
          url: desktopSrc,
          type: 'desktop',
          source: 'croma'
        });
      } else if (mobileSrc && mobileSrc.includes("Croma%20Assets/CMS/LP")) {
        flyerImages.push({
          url: mobileSrc,
          type: 'mobile',
          source: 'croma'
        });
      } else if (imgSrc && imgSrc.includes("Croma%20Assets/CMS/LP")) {
        flyerImages.push({
          url: imgSrc,
          type: 'image',
          source: 'croma'
        });
      }
    });

    // Remove duplicates
    const uniqueFlyers = flyerImages.filter((flyer, index, self) => 
      index === self.findIndex(f => f.url === flyer.url)
    );

    return uniqueFlyers;
  } catch (error) {
    console.error("Error scraping Croma flyers:", error);
    return [];
  }
}

async function getLuluFlyerImages() {
  try {
    const url = "https://www.hyderabad.lulumall.in";
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(data);
    const flyerImages = [];

    // Include all images from main carousel/slider selectors, as long as they are hosted on lulumall.in
    $(".carouselItem img, .swiper-slide img, .slick-slide img, .banner img, .hero img, .slider img").each((i, el) => {
      const imgSrc = $(el).attr("src") || $(el).attr("srcset");
      const altText = $(el).attr("alt") || '';
      if (imgSrc && imgSrc.includes("lulumall.in")) {
        flyerImages.push({
          url: imgSrc,
          type: 'carousel',
          source: 'lulu',
          alt: altText,
          title: altText || `Lulu Mall Promotion ${i + 1}`
        });
      }
    });

    // Also look for images in picture elements
    $("picture source").each((i, el) => {
      const srcset = $(el).attr("srcset");
      if (srcset && srcset.includes("lulumall.in")) {
        flyerImages.push({
          url: srcset,
          type: 'picture',
          source: 'lulu',
          title: `Lulu Mall Promotion ${i + 1}`
        });
      }
    });

    // Remove duplicates
    const uniqueFlyers = flyerImages.filter((flyer, index, self) => 
      index === self.findIndex(f => f.url === flyer.url)
    );

    return uniqueFlyers;
  } catch (error) {
    console.error("Error scraping Lulu flyers:", error);
    return [];
  }
}

async function getSarathCityFlyerImages() {
  try {
    const url = "https://sarathcitycapitalmall.com";
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(data);
    const flyerImages = [];

    // Strictly select only the first slider under the navbar
    let firstSlider = $(".n2-ss-slider").first();
    if (!firstSlider.length) {
      firstSlider = $(".n2-ss-slider-1").first();
    }

    // Only get images from the first slider
    firstSlider.find(".n2-ss-slide-background-image").each((i, el) => {
      const imgSrc = $(el).attr("data-desktop") || $(el).attr("style");
      const dataHash = $(el).attr("data-hash");
      
      if (imgSrc) {
        // Extract URL from style attribute if it exists
        let url = imgSrc;
        if (imgSrc.includes("background-image:")) {
          const urlMatch = imgSrc.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (urlMatch) {
            url = urlMatch[1];
          }
        }
        // Ensure URL is absolute
        if (url && !url.startsWith('http')) {
          url = url.startsWith('//') ? `https:${url}` : `https://sarathcitycapitalmall.com${url}`;
        }
        if (url && url.includes("sarathcitycapitalmall.com")) {
          flyerImages.push({
            url: url,
            type: 'slider',
            source: 'sarathcity',
            title: `Sarath City Banner ${i + 1}`,
            hash: dataHash
          });
        }
      }
    });

    // Remove duplicates by URL
    const uniqueFlyers = flyerImages.filter((flyer, index, self) => 
      index === self.findIndex(f => f.url === flyer.url)
    );

    // Limit to first 8 images
    return uniqueFlyers.slice(0, 8);
  } catch (error) {
    console.error("Error scraping Sarath City flyers:", error);
    return [];
  }
}

// Fallback function to get sample flyer data
function getSampleFlyerData() {
  return [
    {
      url: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      type: 'desktop',
      source: 'sample',
      title: 'Electronics Sale',
      description: 'Latest gadgets and electronics at amazing prices'
    },
    {
      url: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      type: 'desktop',
      source: 'sample',
      title: 'Mobile Festival',
      description: 'Special offers on smartphones and accessories'
    },
    {
      url: "https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      type: 'desktop',
      source: 'sample',
      title: 'Home Appliances',
      description: 'Premium home appliances with great discounts'
    }
  ];
}

// Fallback function to get sample Lulu flyer data
function getSampleLuluFlyerData() {
  return [
    {
      url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      type: 'carousel',
      source: 'lulu',
      title: 'Fashion Festival',
      description: 'Latest trends in fashion and lifestyle',
      alt: 'Fashion Festival Banner'
    },
    {
      url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      type: 'carousel',
      source: 'lulu',
      title: 'Lifestyle Collection',
      description: 'Premium lifestyle and home decor',
      alt: 'Lifestyle Collection Banner'
    },
    {
      url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      type: 'carousel',
      source: 'lulu',
      title: 'Entertainment Zone',
      description: 'Movies, games, and entertainment offers',
      alt: 'Entertainment Zone Banner'
    },
    {
      url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      type: 'carousel',
      source: 'lulu',
      title: 'Food Court Specials',
      description: 'Delicious dining offers and food festivals',
      alt: 'Food Court Specials Banner'
    }
  ];
}

// Fallback function to get sample Sarath City flyer data
function getSampleSarathCityFlyerData() {
  return [
    {
      url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      type: 'slider',
      source: 'sarathcity',
      title: 'Rainy Season for Men',
      description: 'Special offers on men\'s fashion and accessories',
      alt: 'Men\'s Fashion Banner'
    },
    {
      url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      type: 'slider',
      source: 'sarathcity',
      title: 'Rainy Season for Women',
      description: 'Latest trends in women\'s fashion',
      alt: 'Women\'s Fashion Banner'
    },
    {
      url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      type: 'slider',
      source: 'sarathcity',
      title: 'Chatbot Services',
      description: '24/7 customer support and assistance',
      alt: 'Chatbot Services Banner'
    },
    {
      url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      type: 'slider',
      source: 'sarathcity',
      title: 'Rainy Season for Kids',
      description: 'Special offers for kids and family',
      alt: 'Kids Fashion Banner'
    },
    {
      url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      type: 'slider',
      source: 'sarathcity',
      title: 'Web Banner',
      description: 'Exciting offers and promotions',
      alt: 'Web Banner'
    },
    {
      url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      type: 'slider',
      source: 'sarathcity',
      title: 'Electronics Sale',
      description: 'Latest electronics at amazing prices',
      alt: 'Electronics Sale Banner'
    }
  ];
}

// Fallback function to get sample Fashion flyer data
function getSampleFashionFlyerData() {
  return [
    {
      url: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      type: 'fashion',
      source: 'sample',
      title: 'Fashion Fiesta',
      description: 'Trendy outfits and exclusive fashion deals',
      alt: 'Fashion Fiesta Banner'
    },
    {
      url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      type: 'fashion',
      source: 'sample',
      title: 'New Arrivals',
      description: 'Latest arrivals in men, women, and kids fashion',
      alt: 'New Arrivals Banner'
    },
    {
      url: "https://images.unsplash.com/photo-1469398715555-76331a6c7c9b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      type: 'fashion',
      source: 'sample',
      title: 'Seasonal Sale',
      description: 'Up to 70% off on seasonal collections',
      alt: 'Seasonal Sale Banner'
    }
  ];
}

export {
  getCromaFlyerImages,
  getLuluFlyerImages,
  getSarathCityFlyerImages,
  getSampleFlyerData,
  getSampleLuluFlyerData,
  getSampleSarathCityFlyerData,
  getSampleFashionFlyerData
}; 