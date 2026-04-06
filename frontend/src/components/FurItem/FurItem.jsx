import React, { useContext, useState } from 'react'
import './FurItem.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const FurItem = ({ id, name, price, description, image }) => {
    const { cartItems = {}, addToCart, removeFromCart, url, token } = useContext(StoreContext);
    const [isFavorited, setIsFavorited] = useState(false);
    const navigate = useNavigate();

    const handleFavorite = async () => {
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

    return (
        <div className='fur-item'>
            <div className='fur-item-img-container'>
                <img className='fur-item-image' src={url + "/images/" + image} alt="" />
                <button className={`fur-fav-btn ${isFavorited ? 'favorited' : ''}`} onClick={handleFavorite}>
                    {isFavorited ? '❤️' : '🤍'}
                </button>
                {!cartItems[id]
                    ? <img className='add' onClick={() => addToCart(id)} src={assets.add_icon_white} alt="" />
                    : <div className="fur-item-counter">
                        <img onClick={() => removeFromCart(id)} src={assets.remove_icon_red} alt="" />
                        <p>{cartItems[id]}</p>
                        <img onClick={() => addToCart(id)} src={assets.add_icon_green} alt="" />
                    </div>
                }
                {/* Quick View */}
                <button className='quick-view-btn' onClick={() => navigate(`/furview/${id}`)}>
                    Quick View
                </button>
            </div>
            <div className="fur-item-info">
                <div className="fur-item-name-rating">
                    <p>{name}</p>
                </div>
                <p className="fur-item-desc">{description}</p>
                <p className="fur-item-price">₹{price}<span>/month</span></p>
            </div>
        </div>
    )
}

export default FurItem;