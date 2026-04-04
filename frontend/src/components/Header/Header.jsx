import React from 'react'
import './Header.css'
import { assets } from '../../assets/assets'


const Header = () => {
    return (
        <div className="header">
     <img src={assets.main} alt="header" className="header-img" />
            <div className='header-contents'>
                <h2>Find your perfect furniture</h2>
                <p>Explore a wide range of stylish and comfortable furniture designed to fit your lifestyle. 
From cozy essentials to modern statement pieces, RentEase makes it easy to furnish your space 
without the hassle of ownership. Enjoy flexibility, affordability, and convenience—all in one place.</p>
                <a href='#explore-menu'> Explore Furniture</a>
            </div>
        </div>
    )
}

export default Header
