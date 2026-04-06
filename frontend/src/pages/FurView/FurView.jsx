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
    const [selectedMonth, setSelectedMonth] = useState(1);
    const [mainImage, setMainImage] = useState('');

    useEffect(() => {
        const found = fur_list.find(f => f._id === id);
        if (found) {
            setFur(found);
            setMainImage(`${url}/images/${found.image}`);
        }
    }, [id, fur_list]);

    if (!fur) return <div className='furview-loading'>Loading...</div>;

    const allImages = [
        `${url}/images/${fur.image}`,
        ...(fur.images || []).map(img => `${url}/images/${img}`)
    ];

    const totalPrice = fur.price * selectedMonth;

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
                        <img src={mainImage} alt={fur.name} />
                    </div>
                    {allImages.length > 1 && (
                        <div className='furview-thumbnails'>
                            {allImages.map((img, i) => (
                                <div
                                    key={i}
                                    className={`furview-thumb ${mainImage === img ? 'active' : ''}`}
                                    onClick={() => setMainImage(img)}
                                >
                                    <img src={img} alt={`thumb-${i}`} />
                                </div>
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
                        <p className='price-amount'>₹{fur.price}<span>/month</span></p>
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
                                    <span>₹{fur.price * m}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className='furview-total'>
                        <span>Total for {selectedMonth} {selectedMonth === 1 ? 'month' : 'months'}:</span>
                        <strong>₹{totalPrice}</strong>
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