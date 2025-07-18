import axios from "axios";
import { generateWoohooSignature } from "../generateSignature.js";
import WoohooCategory from "../models/Woohoocategorymodel.js";
import dotenv from "dotenv";
import { sequelize } from "../config/db.js";
import ProductList from "../models/ProductListModel.js";
import ProductDetails from '../models/WoohooproductDetailsModel.js';
import RelatedProduct from "../models/RelatedProductsModel.js";
import CatalogProduct from "../models/CatalogModel.js";
import { getActiveToken, generateNewToken } from '../services/woohooTokenService.js';

dotenv.config();

const woohooCategoryUrl = 'https://sandbox.woohoo.in/rest/v3/catalog/categories';

// Place this at the top, after imports

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

// Block 1: Sync categories from Woohoo API to DB (call this periodically or via admin endpoint)
export const syncWoohooCategories = async (req, res) => {
  try {
    const method = 'GET';
    const response = await woohooApiWithTokenRetry(async (token) => {
      const { signature, dateAtClient } = generateWoohooSignature(
        woohooCategoryUrl,
        method,
        process.env.WOOHOO_CLIENT_SECRET // Use the correct environment variable
      );
      return axios.get(woohooCategoryUrl, {
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          signature,
          dateAtClient,
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
      });
    });

    // Success
    console.log("Full API response:", response.data);

    let apiCategories = [];
    if (Array.isArray(response.data.categories)) {
      apiCategories = response.data.categories.filter(Boolean);
    } else if (response.data.categories) {
      apiCategories = [response.data.categories];
    } else if (Array.isArray(response.data)) {
      apiCategories = response.data.filter(Boolean);
    } else if (response.data && response.data.id) {
      apiCategories = [response.data];
    } else {
      apiCategories = [];
    }

    const dbCategories = await WoohooCategory.findAll();
    const dbCategoryMap = new Map(dbCategories.map(cat => [cat.id, cat]));

    let updated = false;
    const transaction = await sequelize.transaction();
    try {
      for (const apiCat of apiCategories) {
        if (!apiCat || !apiCat.id) continue; // skip invalid
        const dbCat = dbCategoryMap.get(apiCat.id);
        const apiCatData = {
          ...apiCat,
          id: apiCat.id,
        };
        if (!dbCat || JSON.stringify(dbCat.toJSON()) !== JSON.stringify(apiCatData)) {
          await WoohooCategory.upsert(apiCatData, { transaction });
          updated = true;
        }
      }
      await transaction.commit();
      res.json({ message: updated ? "Categories updated" : "No changes detected" });
    } catch (dbError) {
      await transaction.rollback();
      console.error('Database transaction failed:', dbError);
      res.status(500).json({ error: 'Database transaction failed', details: dbError.message });
    }
  } catch (error) {
    console.error(`Woohoo Categories API error: ${error.message}`);
    res.status(500).json({
      error: 'Failed to sync categories from Woohoo API',
      details: error.message,
      tokenError: error.message.includes('token') ? 'Token related error' : null
    });
  }
};

// to get productList by categoryId



const woohooCategoryProducts = (categoryId) =>
  `https://sandbox.woohoo.in/rest/v3/catalog/categories/${categoryId}/products`;

// Controller: Sync products for all categories
export const syncProductsForAllCategories = async (req, res) => {
  try {
    const categories = await WoohooCategory.findAll();
    let updated = false;
    let lastTokenUsed = null;

    for (const category of categories) {
      const method = "GET";
      const url = woohooCategoryProducts(category.id);
      const response = await woohooApiWithTokenRetry(async (token) => {
        lastTokenUsed = token; // Save the token used for this call
        const { signature, dateAtClient } = generateWoohooSignature(
          url,
          method,
          process.env.WOOHOO_CLIENT_SECRET
        );
        return axios.get(url, {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
            signature,
            dateAtClient,
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        });
      });

      // ...existing code for processing products...

      let products = [];
      if (Array.isArray(response.data.products)) {
        products = response.data.products;
      } else if (response.data.products) {
        products = [response.data.products];
      } else if (Array.isArray(response.data)) {
        products = response.data;
      } else if (response.data && response.data.id) {
        products = [response.data];
      } else {
        products = [];
      }

      console.log(`Products to sync for category ${category.id}:`, products.length);

      const dbProducts = await ProductList.findAll({ where: { categoryId: category.id } });
      const dbProductMap = new Map(dbProducts.map((p) => [p.sku, p]));

      const transaction = await sequelize.transaction();
      try {
        for (const product of products) {
          if (!product || !product.sku) {
            console.warn("Skipping product with missing SKU:", product);
            continue;
          }
          const dbProduct = dbProductMap.get(product.sku);
          const productData = {
            sku: product.sku,
            name: product.name,
            currencyCode: product.currency?.code || null,
            currencySymbol: product.currency?.symbol || null,
            url: product.url || null,
            minPrice: product.minPrice || null,
            maxPrice: product.maxPrice || null,
            offer: product.offerShortDesc || null,
            image: product.images?.mobile || null, // store only mobile image
            categoryId: category.id,
          };
          try {
            if (!dbProduct || JSON.stringify(dbProduct.toJSON()) !== JSON.stringify(productData)) {
              const [instance, created] = await ProductList.upsert(productData, { transaction });
              updated = true;
              console.log(`Upserted product SKU: ${product.sku}, created: ${created}`);
            }
          } catch (upsertErr) {
            console.error(`Failed to upsert product SKU: ${product.sku}`, upsertErr);
          }
        }
        await transaction.commit();
        console.log("Transaction committed for category:", category.id);
      } catch (err) {
        await transaction.rollback();
        console.error("Transaction rolled back for category:", category.id, err);
        throw err;
      }
      console.log("Syncing products for category:", category.id, category.name);
    }
    res.json({ 
      success: true,
      message: updated ? "Products updated" : "No changes detected",
      tokenUsed: lastTokenUsed
        ? {
            tokenType: lastTokenUsed.tokenType,
            expiresAt: lastTokenUsed.expiresAt,
          }
        : null,
    });
  } catch (error) {
    console.error("Failed to sync products:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to sync products", 
      details: error.message,
      tokenError: error.message.includes('token') ? 'Token related error' : null
    });
  }
};




//get productdetails 
 



// 1. SYNC ALL PRODUCT DETAILS (ADMIN/BULK)
export const syncProductDetails = async (req, res) => {
  console.log("Received body:", req.body);
  const { skus } = req.body;
  if (!Array.isArray(skus) || skus.length === 0) {
    return res.status(400).json({ error: "Invalid SKUs array" });
  }

  try {
    let results = [];
    let lastTokenUsed = null;
    for (const productSku of skus) {
      const productUrl = `https://sandbox.woohoo.in/rest/v3/catalog/products/${productSku}`;
      const method = 'GET';
      const response = await woohooApiWithTokenRetry(async (token) => {
        lastTokenUsed = token; // Save the token used for this call
        const { signature, dateAtClient } = generateWoohooSignature(
          productUrl,
          method,
          process.env.WOOHOO_CLIENT_SECRET
        );
        return axios.get(productUrl, {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
            signature,
            dateAtClient,
            'Content-Type': 'application/json',
            Accept: '*/*',
          },
        });
      });

      // Fetch from DB
      let dbProduct = await ProductDetails.findOne({ where: { sku: productSku } });

      // Compare and upsert if needed
      let needsUpdate = false;
      if (!dbProduct) {
        needsUpdate = true;
      } else {
        const dbData = dbProduct.toJSON();
        delete dbData.createdAt;
        delete dbData.updatedAt;
        needsUpdate = JSON.stringify(dbData) !== JSON.stringify(response.data);
      }

      if (needsUpdate) {
        await ProductDetails.upsert({
          ...response.data,
          id: response.data.sku,
          createdAtWoohoo: response.data.createdAt,
          updatedAtWoohoo: response.data.updatedAt,
        });
        results.push({ sku: productSku, status: "synced/updated" });
      } else {
        results.push({ sku: productSku, status: "no change" });
      }
    }
    res.json({ 
      success: true,
      results,
      tokenUsed: lastTokenUsed
        ? {
            tokenType: lastTokenUsed.tokenType,
            expiresAt: lastTokenUsed.expiresAt
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "Failed to sync product details", 
      details: error.message,
      tokenError: error.message.includes('token') ? 'Token related error' : null
    });
  }
};

export const getAllProductSkus = async (req, res) => {
  try {
    const products = await ProductList.findAll({ attributes: ['sku'] });
    const skus = products.map(p => p.sku);
    res.json({ skus });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch SKUs", details: error.message });
  }
};



// related products

const woohooRelatedProductsURL = (productSku) =>
  `https://sandbox.woohoo.in/rest/v3/catalog/products/${productSku}/related`;

// 1. SYNC RELATED PRODUCTS (ADMIN/BULK)

export const syncAllRelatedProducts = async (req, res) => {
  try {
    console.log("Starting syncAllRelatedProducts...");
    const products = await ProductList.findAll({ attributes: ['sku'] });
    let results = [];
    let lastTokenUsed = null;

    for (const product of products) {
      const productSku = product.sku;
      const url = woohooRelatedProductsURL(productSku);
      const method = "GET";
      const response = await woohooApiWithTokenRetry(async (token) => {
        lastTokenUsed = token; // Save the token used for this call
        const { signature, dateAtClient } = generateWoohooSignature(
          url,
          method,
          process.env.WOOHOO_CLIENT_SECRET 
        );
        return axios.get(url, {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
            signature,
            dateAtClient,
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        });
      });

      let relatedProducts = [];
      if (Array.isArray(response.data.relatedProducts)) {
        relatedProducts = response.data.relatedProducts;
      } else if (response.data.relatedProducts) {
        relatedProducts = [response.data.relatedProducts];
      }

      if (!relatedProducts.length) {
        await RelatedProduct.destroy({ where: { productSku } });
        results.push({ sku: productSku, status: "no related products" });
        continue;
      }

      const transaction = await sequelize.transaction();
      try {
        for (const rel of relatedProducts) {
          if (!rel || !rel.sku) continue;
          try {
            console.log("Upserting related product:", {
              sku: rel.sku,
              name: rel.name,
              description: rel.offerShortDesc || null,
              price: rel.minPrice ? parseFloat(rel.minPrice) : null,
              image: rel.images?.mobile || null,
              productSku,
            });
            await RelatedProduct.upsert({
              sku: rel.sku,
              name: rel.name,
              description: rel.offerShortDesc || null,
              price: rel.minPrice ? parseFloat(rel.minPrice) : null,
              image: rel.images?.mobile || null,
              productSku,
            }, { transaction });
          } catch (err) {
            console.error("Upsert error for", rel.sku, ":", err);
          }
        }
        await transaction.commit();
        results.push({ sku: productSku, status: "related products synced" });
      } catch (err) {
        await transaction.rollback();
        results.push({ sku: productSku, status: "db error", error: err.message });
      }
    }
    res.json({ 
      success: true,
      results,
      tokenUsed: lastTokenUsed
        ? {
            tokenType: lastTokenUsed.tokenType,
            expiresAt: lastTokenUsed.expiresAt
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "Failed to sync all related products", 
      details: error.message,
      tokenError: error.message.includes('token') ? 'Token related error' : null
    });
  }
};
