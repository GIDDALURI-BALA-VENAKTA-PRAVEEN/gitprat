import axios from 'axios';
import * as cheerio from 'cheerio';

async function getFurnitureBannerImages() {
  try {
    const url = "https://www.ikea.com/in/en/";
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(data);
    const bannerImages = [];

    // 1. Main banners (existing logic)
    $("img.pub__image").each((i, el) => {
      const imgSrc = $(el).attr("src");
      const altText = $(el).attr("alt") || '';
      const link = $(el).closest('a').attr('href') || '';
      if (imgSrc && imgSrc.includes("ikea.com")) {
        bannerImages.push({
          url: imgSrc,
          alt: altText,
          title: altText || `IKEA Furniture ${i + 1}`,
          link: link.startsWith('http') ? link : `https://www.ikea.com${link}`,
          source: 'ikea',
          type: 'banner'
        });
      }
    });

    // 2. Carousels (visual-pill-slider, inspiration cards, etc.)
    $(".pub__carousel-slide, .pub__teaser, .pub__carousel__body .pub__carousel-slide").each((i, el) => {
      const img = $(el).find("img.pub__image");
      const imgSrc = img.attr("src");
      const altText = img.attr("alt") || '';
      const link = $(el).find('a').attr('href') || '';
      if (imgSrc && imgSrc.includes("ikea.com")) {
        bannerImages.push({
          url: imgSrc,
          alt: altText,
          title: altText || `IKEA Carousel ${i + 1}`,
          link: link.startsWith('http') ? link : `https://www.ikea.com${link}`,
          source: 'ikea',
          type: 'carousel'
        });
      }
    });

    // Remove duplicates by URL
    const uniqueBanners = bannerImages.filter((banner, index, self) =>
      index === self.findIndex(b => b.url === banner.url)
    );

    // Limit to first 20 images
    const limitedBanners = uniqueBanners.slice(0, 20);

    return {
      count: limitedBanners.length,
      images: limitedBanners
    };
  } catch (error) {
    console.error("Error scraping IKEA furniture banners:", error);
    return {
      count: 0,
      images: []
    };
  }
}

// Fallback function to get sample furniture banner data
function getSampleFurnitureBannerData() {
  return [
    {
      url: "https://www.ikea.com/images/yellow-banner-with-a-truck-icon-offering-free-delivery-on-on-d65ace4906e866025efa7dbce1bdc81b.jpg?f=s",
      alt: "Yellow banner with a truck icon offering free delivery on online orders above Rs.1999, valid from 27th June to 13th July.",
      title: "Free Delivery Offer",
      source: 'sample',
      type: 'banner'
    },
    {
      url: "https://www.ikea.com/images/study-tables-modern-white-study-table-with-books-and-decor-p-3f48b9355b72e89a62d16faa1d303ba7.jpg?f=s",
      alt: "Study tables- Modern white study table with books and decor, paired with a grey swivel chair in a cozy home workspace.",
      title: "Study Tables Collection",
      source: 'sample',
      type: 'banner'
    },
    {
      url: "https://www.ikea.com/images/chest-of-drawers-white-chest-of-drawers-with-silver-knobs-pl-db4e66ba639312cbae12c1c92e49caff.jpg?f=s",
      alt: "Chest of drawers- White chest of drawers with silver knobs, placed in a minimalistic room with a round mirror and table lamp.",
      title: "Storage Solutions",
      source: 'sample',
      type: 'banner'
    },
    {
      url: "https://www.ikea.com/images/food-containers-glass-food-containers-filled-with-colorful-f-55d8f26118f21686f6d270684bc695a9.jpg?f=s",
      alt: "Food containers Glass food containers filled with colorful, fresh food on a kitchen countertop with bottles and utensils nearby.",
      title: "Kitchen & Dining",
      source: 'sample',
      type: 'banner'
    },
    {
      url: "https://www.ikea.com/images/dinnerware-stacked-rustic-ceramic-bowls-in-shades-of-blue-an-dca046990766ed2822019ed9c0e6f5dd.jpg?f=s",
      alt: "Dinnerware Stacked rustic ceramic bowls in shades of blue and brown being held in someone's hands.",
      title: "Dinnerware Collection",
      source: 'sample',
      type: 'banner'
    },
    {
      url: "https://www.ikea.com/images/shoe-cabinets-grey-shoe-cabinet-with-open-drawers-displaying-5ae7d81810d5cebb10ec8fe37920db80.jpg?f=s",
      alt: "Shoe cabinets Grey shoe cabinet with open drawers displaying neatly organized shoes and storage items in a home entryway.",
      title: "Storage & Organization",
      source: 'sample',
      type: 'banner'
    },
    {
      url: "https://www.ikea.com/images/artificial-plants-and-flowers-hanging-green-artificial-plant-cc59f599183fc1b1e87a614fc56a0a33.jpg?f=s",
      alt: "Artificial plants & flowers Hanging green artificial plants in white pots placed near a bright window.",
      title: "Home Decor & Plants",
      source: 'sample',
      type: 'banner'
    },
    {
      url: "https://www.ikea.com/images/storage-boxes-transparent-plastic-storage-boxes-filled-with--80609e92bbd79574f06cd6f0fc2c7166.jpg?f=s",
      alt: "Storage boxes Transparent plastic storage boxes filled with folded clothes and miscellaneous household items.",
      title: "Storage Solutions",
      source: 'sample',
      type: 'banner'
    },
    {
      url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      alt: "Modern living room furniture with sofa and coffee table",
      title: "Living Room Collection",
      source: 'sample',
      type: 'banner'
    },
    {
      url: "https://images.unsplash.com/photo-1505693314120-0d443867891c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      alt: "Bedroom furniture with bed and bedside table",
      title: "Bedroom Essentials",
      source: 'sample',
      type: 'banner'
    },
    {
      url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      alt: "Kitchen furniture and appliances",
      title: "Kitchen & Appliances",
      source: 'sample',
      type: 'banner'
    },
    {
      url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      alt: "Office furniture and workspace setup",
      title: "Home Office",
      source: 'sample',
      type: 'banner'
    }
  ];
}

export {
  getFurnitureBannerImages,
  getSampleFurnitureBannerData
}; 