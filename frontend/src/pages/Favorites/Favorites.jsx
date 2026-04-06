import React, { useState, useEffect, useContext } from 'react';
import './Favorites.css';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import { toast } from 'react-toastify';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { url, token, addToCart, fur_list } = useContext(StoreContext);

  useEffect(() => {
    if (token) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadFavorites = async () => {
    try {
      const response = await axios.post(
        `${url}/api/favorite/list`,
        { userId: 'user' },
        { headers: { token } }
      );

      if (response.data.success) {
        // Match favorites with fur_list to get full details
        const favoritesWithDetails = response.data.favorites.map(fav => {
          const furDetails = fur_list.find(fur => fur._id === fav.furId);
          return {
            ...fav,
            furDetails: furDetails || null
          };
        });
        setFavorites(favoritesWithDetails);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading favorites:", error);
      setLoading(false);
    }
  };

  const removeFavorite = async (furId) => {
    try {
      const response = await axios.post(
        `${url}/api/favorite/remove`,
        { userId: 'user', furId },
        { headers: { token } }
      );

      if (response.data.success) {
        setFavorites(prev => prev.filter(fav => fav.furId !== furId));
        toast.success("Removed from favorites");
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("Failed to remove favorite");
    }
  };

  const handleAddToCart = (furId) => {
    addToCart(furId);
    toast.success('Added to cart!');
  };

  if (!token) {
    return (
      <div className="favorites-page">
        <div className="favorites-empty">
          <h2>❤️ My Favorites</h2>
          <p>Please login to view your favorite recommendations</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="favorites-page">
        <div className="favorites-loading">
          <p>Loading favorites...</p>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="favorites-page">
        <div className="favorites-empty">
          <h2>❤️ My Favorites</h2>
          <p>You haven't added any favorites yet!</p>
          <p>Chat with AI Assistant and save your favorite recommendations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <p>{favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved</p>
      </div>

      <div className="favorites-grid">
        {favorites.map((fav) => (
          <div key={fav._id} className="favorite-card">
            {fav.furDetails ? (
              <>
                <div className="favorite-card-image">
                  <img 
                    src={`${url}/images/${fav.furDetails.image}`} 
                    alt={fav.furName} 
                  />
                  <button 
                    className="remove-favorite-btn"
                    onClick={() => removeFavorite(fav.furId)}
                  >
                    ❤️
                  </button>
                </div>
                <div className="favorite-card-content">
                  <h3>{fav.furName}</h3>
                  <p className="favorite-category">{fav.furDetails.category}</p>
            
                  <p className="favorite-recommendation">{fav.recommendation}</p>
                  <div className="favorite-card-footer">
                    <span className="favorite-price">₹{fav.furDetails.price}<span className="price-mo">/mo</span></span>
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(fav.furId)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="favorite-card-content">
                <h3>{fav.furName}</h3>
                <p className="favorite-recommendation">{fav.recommendation}</p>
                <button 
                  className="remove-favorite-btn-alt"
                  onClick={() => removeFavorite(fav.furId)}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;