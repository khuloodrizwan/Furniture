import React from 'react'
import './CategoryGrid.css'
import { assets } from '../../assets/assets'

const CategoryGrid = () => {
    return (
        <div className="catgrid-section" id="category-grid">
            <h2 className="catgrid-heading">Curated for Every Corner</h2>
            <p className="catgrid-sub">Explore high-end designs categorized to make your furnishing journey intuitive and inspiring.</p>
            <div className="catgrid-grid">

                {/* TOP-LEFT: Large — Living Room — main image */}
                <div className="catgrid-card catgrid-large" style={{ backgroundImage: `url(${assets.t_l})` }}>
                    <div className="catgrid-overlay">
                        <span className="catgrid-label">Living Room</span>
                        <span className="catgrid-desc">Elevate your common space.</span>
                        <a href="/furniture" className="catgrid-link">Explore →</a>
                    </div>
                </div>

                {/* TOP-RIGHT: Small — Bedroom — f_1 image */}
                <div className="catgrid-card catgrid-small catgrid-top-right" style={{ backgroundImage: `url(${assets.t_r})` }}>
                    <div className="catgrid-overlay">
                        <span className="catgrid-label">Bedroom</span>
                        <a href="/furniture" className="catgrid-link">View Collection →</a>
                    </div>
                </div>

                {/* BOTTOM-LEFT: Small — Appliances — f_1 image */}
                <div className="catgrid-card catgrid-small catgrid-bottom-left" style={{ backgroundImage: `url(${assets.b_l})` }}>
                    <div className="catgrid-overlay">
                        <span className="catgrid-badge">NEW TECH</span>
                        <span className="catgrid-label">Appliances</span>
                        <span className="catgrid-desc">Top-brand smart living.</span>
                        <a href="/appliances" className="catgrid-link">View Brands →</a>
                    </div>
                </div>

                {/* BOTTOM-RIGHT: Large — Office — main image */}
                <div className="catgrid-card catgrid-large-bottom" style={{ backgroundImage: `url(${assets.b_r})` }}>
                    <div className="catgrid-overlay">
                        <span className="catgrid-label">Office</span>
                        <span className="catgrid-desc">Productivity Sets →</span>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default CategoryGrid