import React from 'react'
import './Header.css'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <div className="header">
            <img src={assets.main} alt="header" className="header-img" />
            <div className='header-contents'>
                <span className="header-tag">Architectural Curation</span>
                <h2>Live the lifestyle <span className="highlight">you want</span>, without the commitment.</h2>
                <p>Rent beautiful furniture and top-brand appliances on a monthly basis. Perfect for students, professionals, and the modern nomad.</p>
                <div className="header-buttons">
                    <Link to="/furnitures" className="btn-primary">Browse Furniture </Link>
            
                    <a href='#how-it-works' className="btn-secondary">How it Works</a>
                </div>
            </div>
        </div>
    )
}

export default Header