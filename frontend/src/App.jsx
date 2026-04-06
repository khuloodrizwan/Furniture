import React, { useState } from 'react'
import Home from './pages/Home/Home'
import Footer from './components/Footer/Footer'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Cart from './pages/Cart/Cart'
import LoginPopup from './components/LoginPopup/LoginPopup'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import MyOrders from './pages/MyOrders/MyOrders'
import Favorites from './pages/Favorites/Favorites'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify/Verify'
import SeasonalBanner from './components/SeasonalBanner/SeasonalBanner';
import Furnitures from "./pages/Furnitures/Furnitures";
import Deals from "./pages/Deals/Deals";
import Appliances from "./pages/Appliances/Appliances";
import FurView from './pages/FurView/FurView';


const App = () => {

  const [showLogin,setShowLogin] = useState(false);
  const url = "http://localhost:4000";

  return (
    <>
    <ToastContainer/>
    {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin}/>
        <SeasonalBanner url={url}/>
        <Routes>
          <Route path='/' element={<Home url={url}/>}/>
          <Route path='/cart' element={<Cart />}/>
          <Route path='/order' element={<PlaceOrder />}/>
          <Route path='/myorders' element={<MyOrders />}/>
          <Route path='/verify' element={<Verify />}/>
          <Route path='/favorites' element={<Favorites />}/>
          <Route path="/furnitures" element={<Furnitures />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/appliances" element={<Appliances />} />
          <Route path='/furview/:id' element={<FurView />} />
         
        </Routes>
      </div>
      <Footer />
    </>
  )
}

export default App