import React, { useContext, useState } from 'react'
import './FurItem.css'
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const FurItem = ({ id, name, price, description, image, isDealActive, discountType, discountValue }) => {
    const { cartItems = {}, addToCart, removeFromCart, url, token } = useContext(StoreContext);
    const [isFavorited, setIsFavorited] = useState(false);
    const navigate = useNavigate();

    const getDiscountedPrice = () => {
        if (!isDealActive || !discountValue) return null;
        if (discountType === "percentage") return (price * (1 - discountValue / 100)).toFixed(2);
        if (discountType === "flat") return (price - discountValue).toFixed(2);
        return null;
    }

    const getBadgeLabel = () => {
        if (!isDealActive || !discountValue) return null;
        if (discountType === "percentage") return `${discountValue}% OFF`;
        return `₹${discountValue} OFF`;
    }

    const discountedPrice = getDiscountedPrice();
    const badgeLabel = getBadgeLabel();

    const handleFavorite = async (e) => {
        e.stopPropagation();
        if (!token) { toast.error("Please login to add favorites"); return; }
        try {
            if (isFavorited) {
                await axios.post(`${url}/api/favorite/remove`, { furId: id }, { headers: { token } });
                setIsFavorited(false);
                toast.success("Removed from favorites");
            } else {
                await axios.post(`${url}/api/favorite/add`, { furId: id, furName: name, recommendation: description }, { headers: { token } });
                setIsFavorited(true);
                toast.success("Added to favorites ❤️");
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    const added = cartItems[id]?.quantity > 0;

    const handleAddToCart = () => {
        if (added) {
            removeFromCart(id);
        } else {
            addToCart(id);
        }
    }

    return (
        <div className='fur-item'>
            <div className='fur-item-img-wrap'>
                <img src={url + "/images/" + image} alt={name} className='fur-item-img' />
                {badgeLabel && <span className='fur-deal-badge'>{badgeLabel}</span>}
                <button className={`fur-fav-btn ${isFavorited ? 'favorited' : ''}`} onClick={handleFavorite}>
                    {isFavorited ? '❤️' : '🤍'}
                </button>
                <div className='fur-item-overlay'>
                    <button className='fur-quick-btn' onClick={() => navigate(`/furview/${id}`)}>
                        Quick View
                    </button>
                </div>
            </div>

            <div className='fur-item-body'>
                <div className='fur-item-top'>
                    <h3 className='fur-item-name'>{name}</h3>
                    <div className='fur-item-price-wrap'>
                        {discountedPrice ? (
                            <>
                                <span className='fur-item-price-original'>₹{price}</span>
                                <span className='fur-item-price'>₹{discountedPrice}</span>
                                <span className='fur-item-per'>/mo</span>
                            </>
                        ) : (
                            <>
                                <span className='fur-item-price'>₹{price}</span>
                                <span className='fur-item-per'>/mo</span>
                            </>
                        )}
                    </div>
                </div>
                <p className='fur-item-desc'>{description}</p>

                <button
                    className={`fur-add-btn ${added ? 'added' : ''}`}
                    onClick={handleAddToCart}
                >
                    {added ? '✓ Added to Cart' : '+ Add to Cart'}
                </button>
            </div>
        </div>
    )
}

export default FurItem;