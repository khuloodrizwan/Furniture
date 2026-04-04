import React, { useContext} from 'react'
import './FurItem.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext';

const FurItem = ({id, name, price, description , image }) => {

   
    const {cartItems,addToCart,removeFromCart,url} = useContext(StoreContext);

    return (
        <div className='fur-item'>
            <div className='fur-item-img-container'>
                <img className='fur-item-image' src={url+"/images/"+image} alt="" />
                {!cartItems[id]
                ?<img className='add' onClick={() => addToCart(id)} src={assets.add_icon_white} alt="" />
                :<div className="fur-item-counter">
                        <img  onClick={()=>removeFromCart(id)} src={assets.remove_icon_red} alt="" />
                        <p>{cartItems[id]}</p>
                        <img  onClick={()=>addToCart(id)} src={assets.add_icon_green} alt="" />
                    </div>
                }
            </div>
            <div className="fur-item-info">
                <div className="fur-item-name-rating">
                    <p>{name}</p> <img src={assets.rating_starts} alt="" />
                </div>
                <p className="fur-item-desc">{description}</p>
                <p className="fur-item-price">₹{price}</p>
            </div>
        </div>
    )
}

export default FurItem
