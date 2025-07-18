import Card from "./models/Card.js";
import adminRoute from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cardRoutes from "./routes/cardRoutes.js";
import cust from "./routes/customerdetails.js"
import { connectDB, sequelize } from "./config/db.js";
import cors from "cors";
import dotenv from 'dotenv';
import errorHandler from "./middleware/errorMiddleware.js";
import express from "express";
import imageRoutes from "./routes/imageRoutes.js";
import path from "path";
import userRoutes from "./routes/userRoutes.js";
import payment from "./routes/payment.js"
import woohooRoutes from "./routes/woohooRoutes.js";
import woohooTokenRoutes from "./routes/woohooTokenRoutes.js";
import orderRoutes from "./routes/orderroutes.js"; // Ensure the file extension is included
import Order from "./models/orderModel.js";
//import OrderdetailsRoutes from "./routes/OrderdetailsRoutes.js"; // Ensure the file extension is included
import searchRoutes from "./routes/search.js"; // Ensure the file extension is included
import ProductList from "./models/ProductListModel.js"; // Import ProductList model
import emailRoutes from "./routes/emailRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { startNotificationScheduler } from "./schedulers/notificationScheduler.js";
import { startTokenScheduler } from "./schedulers/tokenScheduler.js";
import flyerRoutes from "./routes/flyerRoutes.js";
import { scheduleFlyerCacheRefresh, initializeFlyerCache } from "./schedulers/flyerScheduler.js";
import { scheduleDmartBannerCacheRefresh, initializeDmartBannerCache } from "./schedulers/groceryscheduler.js";
import { scheduleJewelleryBannerCacheRefresh, initializeJewelleryBannerCache } from "./schedulers/jewelleryScheduler.js";
import { scheduleRatnadeepFlyerCacheRefresh, initializeRatnadeepFlyerCache } from "./schedulers/groceryscheduler.js";
import { scheduleFurnitureBannerCacheRefresh, initializeFurnitureBannerCache } from "./schedulers/furnitureScheduler.js";
import { runRoyalEnfieldScheduler, scheduleRoyalEnfieldFlyerRefresh } from './schedulers/royalEnfieldScheduler.js';
import { scheduleAccessoriesCacheRefresh, initializeAccessoriesCache } from "./schedulers/accessoriesScheduler.js";
import studioUserRoutes from './routes/studioUserRoutes.js';
import studioFlyerRoutes from './routes/studioFlyerRoutes.js';
import postedFlyerRoutes from "./routes/postedFlyerRoutes.js";
import PostedFlyer from './models/PostedFlyer.js';


const app = express();
const PORT = 4000;
dotenv.config();
// Connect to MongoDB
connectDB();
// Sync all models to DB (create/update tables as needed)
sequelize.sync({ alter: false })
  .then(() => {
    console.log('✅ All models were synchronized successfully.');
  })
  .catch((err) => {
    console.error('❌ Error syncing models:', err);
    if (err.original && err.original.code === 'ER_TOO_MANY_KEYS') {
      console.log('⚠️  Too many keys error detected. This might be due to existing indexes.');
      console.log('💡 Consider running with { force: true } to recreate tables, or manually clean up indexes.');
    }
  });

// Sync ProductList model (temporarily, for development only)
// ProductList.sync({ alter: true }); // or { force: true } to drop and recreate

// Middlewares
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));


// Routes
app.use("/api/admin", adminRoute);
app.use("/api", imageRoutes);
app.use("/uploads", express.static("uploads"));



// API Routes
app.use("/api/cards", cardRoutes);
app.use('/api/payment', payment);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  
  // Handle payload size errors specifically
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ 
      message: 'Request payload too large. Please reduce the size of your flyer data.',
      error: 'Payload size exceeded the limit of 100MB'
    });
  }
  
  res.status(500).send("Internal Server Error!");
});

//order routes
app.use("/api/order",orderRoutes);

//for nginx
app.use('/admin/dashboard', (req, res) => {
  res.status(403).json({ message: 'Access Forbidden' });
});

//for card

app.get("/api/cards/:id", async (req, res) => {
  try {
    const card = await Card.findByPk(req.params.id);
    if (!card) return res.status(404).json({ message: "Card not found" });
    res.json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
//app.use("/api/cards", cardRoutes);

// Error Middleware
app.use(errorHandler);


//Woohoo fetching
app.use("/api/woohoo", woohooRoutes);
app.use("/api/woohoo/token", woohooTokenRoutes);
app.use('/api/studio-users', studioUserRoutes);
app.use('/api/studio-flyers', studioFlyerRoutes);
app.use("/api/posted-flyers", postedFlyerRoutes);

 

//login
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/cust/data",cust);

//customer Order details
//app.use("/api/order",OrderdetailsRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/email", emailRoutes);

//notification routes
app.use("/api/notifications", notificationRoutes);

// Flyer routes
app.use("/api/flyers", flyerRoutes);

// Initialize and start accessories scheduler
initializeAccessoriesCache().then(() => {
  scheduleAccessoriesCacheRefresh();
  console.log('✅ Accessories scheduler started successfully');
}).catch(error => {
  console.error('❌ Failed to start accessories scheduler:', error);
});

// Start the schedulers
startNotificationScheduler();
startTokenScheduler().catch(error => {
  console.error('Failed to start token scheduler:', error);
});

// Initialize and start flyer scheduler
initializeFlyerCache().then(() => {
  scheduleFlyerCacheRefresh();
 
}).catch(error => {
  console.error('❌ Failed to start flyer scheduler:', error);
})
//initialize and start dmart banner scheduler
initializeDmartBannerCache().then(() => {
  scheduleDmartBannerCacheRefresh();
  
}).catch(error => {
  console.error('❌ Failed to start dmart banner scheduler:', error);
});

//initialize and start jewellery banner scheduler
initializeJewelleryBannerCache().then(() => {
  scheduleJewelleryBannerCacheRefresh();
  
}).catch(error => {
  console.error('❌ Failed to start jewellery banner scheduler:', error);
});

//initialize and start ratnadeep flyer scheduler
initializeRatnadeepFlyerCache().then(() => {
  scheduleRatnadeepFlyerCacheRefresh();
  
}).catch(error => {
  console.error('❌ Failed to start ratnadeep flyer scheduler:', error);
});

//initialize and start furniture banner scheduler
initializeFurnitureBannerCache().then(() => {
  scheduleFurnitureBannerCacheRefresh();
  
}).catch(error => {
  console.error('❌ Failed to start furniture banner scheduler:', error);
});

// Run Royal Enfield flyer scheduler at startup and schedule periodic refresh
runRoyalEnfieldScheduler().catch(error => {
  console.error('❌ Failed to run Royal Enfield flyer scheduler:', error);
});
scheduleRoyalEnfieldFlyerRefresh();



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
