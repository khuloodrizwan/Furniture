import React, { useState } from 'react';
import './FurCard.css';

const FurCard = ({ fur, url, onAddToCart, onAddToFavorite, isFavorited }) => {
  const [showNutrition, setShowNutrition] = useState(false);

  return (
    <div className="fur-card">
      <div className="fur-card-image">
        <img 
          src={fur.image ? `${url}/images/${fur.image}` : `${url}/images/f_1.png`} 
          alt={fur.name} 
        />
        <button 
          className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
          onClick={() => onAddToFavorite(fur)}
        >
          {isFavorited ? '❤️' : '🤍'}
        </button>
      </div>
      
      <div className="fur-card-content">
        <div className="fur-card-header">
          <h3>{fur.name}</h3>
          <span className="fur-price">₹{fur.price}</span>
        </div>
        
        <p className="fur-category">{fur.category}</p>
        <p className="fur-description">{fur.description}</p>
        
        {fur.nutrition && (
          <div className="nutrition-section">
            <button 
              className="nutrition-toggle"
              onClick={() => setShowNutrition(!showNutrition)}
            >
              {showNutrition ? '▼' : '▶'} Nutrition Info
            </button>
            
            {showNutrition && (
              <div className="nutrition-details">
                <div className="nutrition-item">
                  <span>Calories:</span>
                  <strong>{fur.nutrition.calories} kcal</strong>
                </div>
                <div className="nutrition-item">
                  <span>Protein:</span>
                  <strong>{fur.nutrition.protein}g</strong>
                </div>
                <div className="nutrition-item">
                  <span>Carbs:</span>
                  <strong>{fur.nutrition.carbs}g</strong>
                </div>
                <div className="nutrition-item">
                  <span>Fat:</span>
                  <strong>{fur.nutrition.fat}g</strong>
                </div>
              </div>
            )}
          </div>
        )}
        
        <button 
          className="add-to-cart-btn"
          onClick={() => onAddToCart(fur._id || fur.id)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default FurCard;