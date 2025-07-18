import axios from 'axios';
import { generateWoohooSignature } from '../generateSignature.js';
import CatalogProduct from '../models/CatalogModel.js';
import { Op } from "sequelize";
import { getActiveToken ,generateNewToken} from '../services/woohooTokenService.js';

const woohoocatalog = 'https://sandbox.woohoo.in/rest/v3/catalog/products';

// Add these counters at the top of your file (outside the functions)
let apiSyncCount = 0;

// Sync catalog from Woohoo API, but only update DB if new/changed
export const syncWoohooCatalog = async (req, res) => {
  apiSyncCount++;
  console.log(`[Woohoo API SYNC] Called ${apiSyncCount} times`);
  try {
    const method = 'GET';
    const response = await woohooApiWithTokenRetry(async (token) => {
      const { signature, dateAtClient } = generateWoohooSignature(
        woohoocatalog,
        method,
        process.env.WOOHOO_CLIENT_SECRET
      );
      return axios.get(woohoocatalog, {
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          signature,
          dateAtClient,
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
      });
    });

    const products = response.data.products;
    console.log(`[Woohoo catalog API SYNC] Fetched ${products.length} products from Woohoo API`);

    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    let updatedCount = 0;
    for (const product of products) {
      if (!product.name || !product.sku) {
        continue;
      }
      const existing = await CatalogProduct.findOne({ where: { sku: product.sku } });
      const productData = {
        id: product.id,
        name: product.name,
        sku: product.sku,
        productType: product.productType || null,
        image:
          product.image && (
            product.image.mobile ||
            product.image.base ||
            product.image.url ||
            null
          ),
        stores: product.stores || null,
        websites: product.websites || null,
      };
      if (!existing) {
        try {
          await CatalogProduct.create(productData);
          updatedCount++;
        } catch (err) {
          console.error("Error creating product:", err, productData);
        }
      } else {
        const isChanged = JSON.stringify(existing.toJSON()) !== JSON.stringify({ ...existing.toJSON(), ...productData });
        if (isChanged) {
          await existing.update(productData);
          updatedCount++;
        }
      }
    }

    await CatalogProduct.destroy({
      where: {
        [Op.or]: [
          { name: null },
          { sku: null }
        ]
      }
    });

    res.json({ 
      success: true,
      message: `Catalog sync complete. ${updatedCount} products added/updated.`,
    });
  } catch (error) {
    console.error("Woohoo API error:", error.response ? error.response.data : error.message);
    res.status(500).json({ 
      success: false,
      error: 'Catalog sync failed', 
      details: error.message,
      tokenError: error.message.includes('token') ? 'Token related error' : null
    });
  }
};

async function woohooApiWithTokenRetry(apiCallFn) {
  let token = await getActiveToken();
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await apiCallFn(token);
    } catch (err) {
      lastError = err;
      if (
        err.response &&
        (
          err.response.status === 401 ||
          (JSON.stringify(err.response.data).includes("token_rejected")) ||
          (err.response.data?.error === "oauth_problem=token_rejected")
        )
      ) {
        console.warn("Token rejected, generating new token...");
        try {
          token = await generateNewToken();
        } catch (tokenErr) {
          console.error("Failed to generate new token:", tokenErr);
          throw tokenErr;
        }
        continue;
      } else {
        break;
      }
    }
  }
  throw lastError;
}



