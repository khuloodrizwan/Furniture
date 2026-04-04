import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">

        <div className="footer-content-left">
            <h1>RentEase</h1>
            <p>
              RentEase makes furnishing your home simple, stylish, and affordable. 
              From modern essentials to premium comfort pieces, we help you create 
              a space you love—without the stress of ownership.
            </p>

            <div className="footer-social-icons">
                <img src={assets.facebook_icon} alt="" />
                <img src={assets.twitter_icon} alt="" />
                <img src={assets.linkedin_icon} alt="" />
            </div>
        </div>

        <div className="footer-content-center">
            <h2>COMPANY</h2>
            <ul>
                <li>Home</li>
                <li>About Us</li>
                <li>Rentals</li>
                <li>Privacy Policy</li>
            </ul>
        </div>

        <div className="footer-content-right">
            <h2>GET IN TOUCH</h2>
            <ul>
                <li>+91 8237152XXX</li>
                <li>support@rentease.com</li>
            </ul>
        </div>

      </div>

      <hr/>

      <p className="footer-copyright">
        Copyright 2026 © RentEase.com - All Rights Reserved.
      </p>
    </div>
  )
}

export default Footer