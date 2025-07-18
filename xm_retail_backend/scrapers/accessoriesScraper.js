// accessoriesScraper.js
// Scrapes accessories data (stub)

import axios from 'axios';
import { load } from 'cheerio';

export async function scrapeAccessories() {
  const url = 'https://www.luxurybazaar.com/brands/rolex/';

  try {
    const { data: html } = await axios.get(url);
    const $ = load(html);

    const products = [];
    $('.lb-product-tile').each((i, el) => {
      const title = $(el).find('.product-title a').text().trim();
      const price = $(el).find('.price .amount').text().trim();
      const urlPath = $(el).find('.product-title a').attr('href');
      const urlFull = urlPath ? `https://www.luxurybazaar.com${urlPath}` : '';
      const tags = [];
      $(el).find('.product-labels .label').each((j, tag) => {
        tags.push($(tag).text().trim());
      });
      // Try to extract reference and year from subtitle or description if available
      let reference = '';
      let year = '';
      const subtitle = $(el).find('.product-subtitle').text();
      if (subtitle) {
        // Example: "2023, Ref: 126711CHNR"
        const yearMatch = subtitle.match(/(19|20)\d{2}/);
        if (yearMatch) year = yearMatch[0];
        const refMatch = subtitle.match(/Ref:?\s*([A-Za-z0-9]+)/i);
        if (refMatch) reference = refMatch[1];
      }
      // Images: get all images in the tile
      const images = [];
      $(el).find('.image img').each((k, img) => {
        const src = $(img).attr('src');
        if (src) images.push(src);
      });
      products.push({
        title,
        brand: 'Rolex',
        year,
        reference,
        price,
        url: urlFull,
        tags,
        images
      });
    });
    return products;
  } catch (error) {
    console.error('Failed to fetch page:', error.response?.status, error.response?.statusText);
    return []; // Always return an array
  }
}

// For local testing only:
// const data = await scrapeAccessories();
// console.log("Number of accessories fetched:", data.length);
// if (data.length) console.log(data[0]);
