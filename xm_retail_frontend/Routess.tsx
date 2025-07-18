import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ProductList from "./src/Components/Cards/productslistcards"; // ✅
import App from "./src/App";
import Login from "./src/Components/Login/Login";
import ProtectedRoute from "./src/Components/ProtectedRoute";
import Home from "./src/Components/Login/Home";
import Profile from "./src/Components/Profile/Profile";
import CardDetails from "./src/Components/Cards/CardDetails";
import AdminLogin from "./src/Components/Admin/AdminLogin";
import AdminProtectedRoute from "./src/Components/AdminProtectedRoute";
import DashBoard from "./src/Components/Admin/DashBoard";
//import ProductDetails from "./src/Components/Cards/productdetails";
import ProductDetailsPage from "./src/Components/prodetailsorder/ProductDetailsPage";

import CartPage from "./src/Components/Cart/CartPage";
import LocationSelectPage from './src/Components/LocationPermission/LocationSelectPage'
import EntryCard from "./src/Components/Cards/entry";
import FlyersPage from "./src/Components/Flyers/FlyersPage";
import CromaFlyersPage from "./src/Components/Flyers/CromaFlyersPage";
import LuluFlyersPage from "./src/Components/Flyers/LuluFlyersPage";
import SarathCityFlyersPage from "./src/Components/Flyers/SarathCityFlyersPage";
// import FashionPage from "./src/Components/Flyers/FashionPage";
import GroceriesPage from "./src/Components/Flyers/GroceriesPage";
import JewelleryPage from "./src/Components/Flyers/JewelleryPage";
import FurniturePage from "./src/Components/Flyers/FurniturePage";
import SwiggyOffers from "./src/Components/Flyers/SwiggyOffers";
import RoyalEnfieldPage from "./src/Components/Flyers/RoyalEnfieldPage";
import AccessoriesPage from "./src/Components/Flyers/AccessoriesPage";
import StudioPage from "./src/Components/FlyerStudio/StudioPage";
import StudioFlyerLogin from './src/Components/FlyerStudio/StudioFlyerLogin';
//import StudioFlyerRegister from './src/Components/FlyerStudio/StudioFlyerRegister';
import StudioFlyerProfile from './src/Components/FlyerStudio/StudioFlyerProfile';


function Routess() {
  return (
    <Router>
      <Routes>
        


        <Route path="/" element={<EntryCard />}/>
       
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<App/>}/>

        <Route path="/flyers" element={<FlyersPage />} />
        <Route path="/flyers/croma" element={<CromaFlyersPage />} />
        <Route path="/flyers/lulu" element={<LuluFlyersPage />} />
        <Route path="/flyers/sarathcity" element={<SarathCityFlyersPage />} />
        <Route path="/flyers/groceries" element={<GroceriesPage />} />
        <Route path="/flyers/jewellery" element={<JewelleryPage />} />
        <Route path="/flyers/furniture" element={<FurniturePage />} />
         <Route path="/flyers/swiggy" element={<SwiggyOffers />} /> 
        <Route path="/flyers/royalenfield" element={<RoyalEnfieldPage />} />
        <Route path="/flyers/accessories" element={<AccessoriesPage />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/studio/login" element={<StudioFlyerLogin onLogin={() => { window.location.href = '/studio'; }} />} />
        <Route path="/studio/profile" element={<StudioFlyerProfile token={localStorage.getItem('studioToken') || ''} />} />

        {/* User Protected Routes */}
        <Route element={<ProtectedRoute />}>
        
          {/* <Route path="/home" element={<Home />} />  */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/cards/:id" element={<CardDetails />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/dashboard" element={<DashBoard />} />
        </Route>

        {/* ✅ Add ProductList route here */}
        <Route path="/products/:categoryId" element={<ProductList />} />
        {/* //<Route path="/product/:productSku" element={<ProductDetails />} /> */}
         <Route path="/product/:productSku" element={<ProductDetailsPage/>}/>
         <Route path="/cart" element={<CartPage/>} />
         <Route path="/location-select" element={<LocationSelectPage />} /> 

        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default Routess;
