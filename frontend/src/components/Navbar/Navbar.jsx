import React, { useContext, useState } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext'

const Navbar = ({ setShowLogin }) => {

  const [menu, setMenu] = useState("home");
  const { getTotalCartAmount, token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate('/')
  }

  return (
    <div className='navbar'>
      <Link to='/' className='logo'>RentEase</Link>
      <ul className="navbar-menu">
        <Link to="/" onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>Home</Link>
        <Link to="/" onClick={() => setMenu("furniture")} className={menu === "furniture" ? "active" : ""}>Furniture</Link>
        <Link to="/" onClick={() => setMenu("appliance")} className={menu === "appliance" ? "active" : ""}>Appliances</Link>
        <Link to="/" onClick={() => setMenu("packages")} className={menu === "packages" ? "active" : ""}>Packages</Link>
        <Link to="/" onClick={() => setMenu("deals")} className={menu === "deals" ? "active" : ""}>Deals</Link>
        <a href='/#about' onClick={() => setMenu("about")} className={menu === "about" ? "active" : ""}>About Us</a>
        
      </ul>
      <div className="navbar-right">
        <Link to='/favorites' className='navbar-favorites-icon'>
          <span className="heart-icon">❤️</span>
        </Link>
        <Link to='/cart' className='navbar-search-icon'>
          <img src={assets.basket_icon} alt="" />
          <div className={getTotalCartAmount() > 0 ? "dot" : ""}></div>
        </Link>
        {!token ? (
          <button onClick={() => setShowLogin(true)}>Sign In</button>
        ) : (
          <div className="navbar-profile">
            <img src={assets.profile_icon} alt="" />
            <ul className="navbar-profile-dropdown">
              <li onClick={() => navigate('/myorders')}><img src={assets.bag_icon} alt="" /><p>Orders</p></li>
              <hr />
              <li onClick={logout}><img src={assets.logout_icon} alt="" /><p>Logout</p></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar