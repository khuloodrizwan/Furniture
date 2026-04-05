import React from 'react'
import './HowItWorks.css'

const HowItWorks = () => {
    return (
        <div className="hiw-section" id="how-it-works">
            <p className="hiw-tag">OUR PROCESS</p>
            <h2 className="hiw-heading">Effortless living, three steps away.</h2>
            <div className="hiw-cards">
                <div className="hiw-card">
                    <div className="hiw-icon">🛒</div>
                    <h3>1. Pick your items</h3>
                    <p>Browse our curated collection of designer furniture and premium tech that fits your unique aesthetic.</p>
                </div>
                <div className="hiw-card">
                    <div className="hiw-icon">🚚</div>
                    <h3>2. Get free delivery</h3>
                    <p>Our white-glove service handles the heavy lifting, assembly, and positioning exactly where you want it.</p>
                </div>
                <div className="hiw-card">
                    <div className="hiw-icon">🔄</div>
                    <h3>3. Return or swap any time</h3>
                    <p>Moving? Upgrading? Simply schedule a swap or return. No long-term contracts, total flexibility.</p>
                </div>
            </div>
        </div>
    )
}

export default HowItWorks