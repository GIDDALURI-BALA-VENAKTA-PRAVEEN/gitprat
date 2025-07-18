import axios from 'axios';
import * as cheerio from 'cheerio';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

export async function fetchRoyalEnfieldFlyers() {
  const url = 'https://www.royalenfield.com/in/en/motorcycles/';
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const flyers = [];

  $('.product-image-card.teaserCardAna').each((i, el) => {
    const name = $(el).find('h3').text().trim();
    const img = $(el).find('img').attr('src');
    const exploreLink = $(el).find('a.redirectionPath').first().attr('href');
    // Find the 'Book a Test Ride' link
    let bookTestRideLink = null;
    $(el).find('a.redirectionPath').each((_, a) => {
      const href = $(a).attr('href');
      if (href && href.includes('/forms/book-a-test-ride')) {
        bookTestRideLink = `https://www.royalenfield.com${href}`;
      }
    });
    flyers.push({
      name,
      img: img ? `https://www.royalenfield.com${img}` : null,
      exploreLink: exploreLink ? `https://www.royalenfield.com${exploreLink}` : null,
      bookTestRideLink
    });
  });

  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
  // Now write the file
  fs.writeFileSync(path.join(uploadsDir, 'royalEnfieldFlyers.json'), JSON.stringify(flyers, null, 2));

  return { flyers, count: flyers.length };
} 