import React, { useContext, useEffect, useState } from 'react'
import './FurView.css'
import { useParams, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext'

const MONTH_OPTIONS = [1, 2, 3, 6, 12];

const FurView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fur_list, url, addToCart, cartItems } = useContext(StoreContext);

    const [fur, setFur] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const found = fur_list.find(f => f._id === id);
        if (found) {
            setFur(found);
            setActiveIndex(0);
        }
    }, [id, fur_list]);

    const [selectedMonth, setSelectedMonth] = useState(1);

    if (!fur) return <div className='furview-loading'>Loading...</div>;

    const allImages = [
        `${url}/images/${fur.image}`,
        ...(fur.images || []).map(img => `${url}/images/${img}`)
    ];

    const getDiscountedPrice = () => {
        if (!fur.isDealActive || !fur.discountValue) return null;
        if (fur.discountType === "percentage") return (fur.price * (1 - fur.discountValue / 100)).toFixed(2);
        if (fur.discountType === "flat") return (fur.price - fur.discountValue).toFixed(2);
        return null;
    }

    const discountedPrice = getDiscountedPrice();
    const effectivePrice = discountedPrice ? parseFloat(discountedPrice) : fur.price;
    const badgeLabel = fur.isDealActive && fur.discountValue
        ? (fur.discountType === "percentage" ? `${fur.discountValue}% OFF` : `₹${fur.discountValue} OFF`)
        : null;

    const totalPrice = effectivePrice * selectedMonth;

    const prevImage = () => setActiveIndex(i => (i - 1 + allImages.length) % allImages.length);
    const nextImage = () => setActiveIndex(i => (i + 1) % allImages.length);

    return (
        <div className='furview-page'>

            {/* Breadcrumb */}
            <div className='furview-breadcrumb'>
                <span onClick={() => navigate('/furnitures')}>Furniture</span>
                <span> › </span>
                <span onClick={() => navigate('/furnitures')}>{fur.category}</span>
                <span> › </span>
                <span className='active'>{fur.name}</span>
            </div>

            <div className='furview-container'>

                {/* Left: Images */}
                <div className='furview-images'>
                    <div className='furview-main-img'>
                        <img src={allImages[activeIndex]} alt={fur.name} />
                        {badgeLabel && <span className='furview-deal-badge'>{badgeLabel}</span>}
                        {allImages.length > 1 && (
                            <>
                                <button className='furview-arrow furview-arrow-left' onClick={prevImage}>&#8249;</button>
                                <button className='furview-arrow furview-arrow-right' onClick={nextImage}>&#8250;</button>
                            </>
                        )}
                    </div>

                    {allImages.length > 1 && (
                        <div className='furview-dots'>
                            {allImages.map((_, i) => (
                                <button
                                    key={i}
                                    className={`furview-dot ${activeIndex === i ? 'active' : ''}`}
                                    onClick={() => setActiveIndex(i)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Details */}
                <div className='furview-details'>
                    <h1>{fur.name}</h1>
                    <p className='furview-category'>{fur.category}</p>
                    <p className='furview-description'>{fur.description}</p>

                    {/* Price Box */}
                    <div className='furview-price-box'>
                        <p className='price-label'>STARTING FROM</p>
                        {discountedPrice ? (
                            <div className='furview-price-row'>
                                <span className='price-original'>₹{fur.price}</span>
                                <span className='price-amount'>₹{discountedPrice}<span>/month</span></span>
                            </div>
                        ) : (
                            <p className='price-amount'>₹{fur.price}<span>/month</span></p>
                        )}
                    </div>

                    {/* Month Selector */}
                    <div className='furview-month-section'>
                        <p className='month-label'>SELECT RENTAL DURATION</p>
                        <div className='month-options'>
                            {MONTH_OPTIONS.map(m => (
                                <button
                                    key={m}
                                    className={`month-btn ${selectedMonth === m ? 'active' : ''}`}
                                    onClick={() => setSelectedMonth(m)}
                                >
                                    {m} {m === 1 ? 'Month' : 'Months'}
                                    <span>₹{(effectivePrice * m).toFixed(2)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className='furview-total'>
                        <span>Total for {selectedMonth} {selectedMonth === 1 ? 'month' : 'months'}:</span>
                        <strong>₹{totalPrice.toFixed(2)}</strong>
                    </div>

                    {/* Add to Cart */}
                    <button className='furview-cart-btn' onClick={() => { addToCart(fur._id); }}>
                        🛒 Add to Cart
                    </button>
                    <p className='furview-note'>Free assembly & doorstep delivery included.</p>
                </div>
            </div>
        </div>
    )
}

export default FurView;