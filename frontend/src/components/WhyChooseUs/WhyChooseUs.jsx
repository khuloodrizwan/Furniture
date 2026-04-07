import React from 'react'
import './WhyChooseUs.css'
import { assets } from '../../assets/assets'

const WhyChooseUs = () => {
    return (
        <div className="wcu-section" id="about">
            <div className="wcu-left">
                <div className="wcu-img-wrapper">
                    <img src={assets.last} alt="Why Choose Us" className="wcu-img-placeholder" />
                    <div className="wcu-badge">
                        <span className="wcu-badge-icon">✔</span>
                        <div>
                            <p className="wcu-badge-title">Premium Standard</p>
                            <p className="wcu-badge-desc">
                                Every piece is inspected by our curators before delivery to ensure magazine-quality condition.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="wcu-right">
                <p className="wcu-tag">WHY CHOOSE US</p>
                <h2 className="wcu-heading">Furniture that fits your life, not just your room.</h2>

                <div className="wcu-features">
                    <div className="wcu-feature">
                        <div className="wcu-feature-icon">🖼</div>
                        <div>
                            <h4>High-quality furniture</h4>
                            <p>
                                We source from premium designers to ensure your home looks and feels world-class.
                            </p>
                        </div>
                    </div>

                    <div className="wcu-feature">
                        <div className="wcu-feature-icon">🔧</div>
                        <div>
                            <h4>Professional maintenance</h4>
                            <p>
                               Free periodic cleaning and minor repairs (up to ₹500, one-time). 
                               If the furniture is damaged or broken, the customer will be charged either the full cost or up to 70–80% of the furniture value, based on damage assessment.
                           </p>
                        
                        </div>
                    </div>

                    <div className="wcu-feature">
                        <div className="wcu-feature-icon">📅</div>
                        <div>
                            <h4>Flexible rental plans</h4>
                            <p>
                                From 3 to 24 months. Change your mind? Change your plan. No hidden fees.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WhyChooseUs