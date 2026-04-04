import React, { useState, useRef, useEffect, useContext } from 'react';
import './AIChat.css';
import axios from 'axios';
import FurCard from '../FurCard/FurCard';
import { StoreContext } from '../../Context/StoreContext';
import { toast } from 'react-toastify';

const AIChat = ({ url, token }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recommendedFurs, setRecommendedFurs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const messagesEndRef = useRef(null);
  const { addToCart } = useContext(StoreContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchSuggestions();
    if (token) {
      loadChatHistory();
      loadFavorites();
    } else {
      setMessages([
        { role: 'assistant', content: 'Hi! I\'m your AI fur assistant. Ask me anything about our menu or get personalized recommendations!' }
      ]);
    }
  }, [token]);

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(`${url}/api/ai/suggestions`);
      if (response.data.success) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const loadChatHistory = async () => {
    try {
      const response = await axios.post(
        `${url}/api/chat/history`,
        { userId: 'user' },
        { headers: { token } }
      );
      
      if (response.data.success && response.data.messages.length > 0) {
        setMessages(response.data.messages);
      } else {
        setMessages([
          { role: 'assistant', content: 'Hi! I\'m your AI fur assistant. Ask me anything about our menu or get personalized recommendations!' }
        ]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      setMessages([
        { role: 'assistant', content: 'Hi! I\'m your AI fur assistant. Ask me anything about our menu or get personalized recommendations!' }
      ]);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await axios.post(
        `${url}/api/favorite/list`,
        { userId: 'user' },
        { headers: { token } }
      );
      
      if (response.data.success) {
        setFavorites(response.data.favorites);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const saveChatMessage = async (role, content) => {
    if (!token) return;
    
    try {
      await axios.post(
        `${url}/api/chat/save`,
        { userId: 'user', role, content },
        { headers: { token } }
      );
    } catch (error) {
      console.error("Error saving chat:", error);
    }
  };

  const clearHistory = async () => {
    if (!token) {
      toast.error("Please login to clear history");
      return;
    }

    try {
      const response = await axios.post(
        `${url}/api/chat/clear`,
        { userId: 'user' },
        { headers: { token } }
      );
      
      if (response.data.success) {
        setMessages([
          { role: 'assistant', content: 'Hi! I\'m your AI food assistant. Ask me anything about our menu or get personalized recommendations!' }
        ]);
        setRecommendedFoods([]);
        toast.success("Chat history cleared");
      }
    } catch (error) {
      console.error("Error clearing history:", error);
      toast.error("Failed to clear history");
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    saveChatMessage('user', messageText);

    try {
      const response = await axios.post(
        `${url}/api/ai/recommend`,
        {
          message: messageText,
          userId: token ? 'user' : null
        },
        token ? { headers: { token } } : {}
      );

      if (response.data.success) {
        const aiMessage = { role: 'assistant', content: response.data.response };
        setMessages(prev => [...prev, aiMessage]);
        
        saveChatMessage('assistant', response.data.response);
        
        if (response.data.recommendedFurs && response.data.recommendedFurs.length > 0) {
          setRecommendedFurs(response.data.recommendedFurs);
        }
      } else {
        const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = { role: 'assistant', content: 'Sorry, something went wrong. Please try again later.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (itemId) => {
    addToCart(itemId);
    toast.success('Added to cart!');
  };

  const handleAddToFavorite = async (fur) => {
    if (!token) {
      toast.error("Please login to add favorites");
      return;
    }

    const isFavorited = favorites.some(fav => fav.furId === (fur._id || fur.id));

    if (isFavorited) {
      try {
        const response = await axios.post(
          `${url}/api/favorite/remove`,
          { userId: 'user', furId: fur._id || fur.id },
          { headers: { token } }
        );

        if (response.data.success) {
          setFavorites(prev => prev.filter(fav => fav.furId !== (fur._id || fur.id)));
          toast.success("Removed from favorites");
        }
      } catch (error) {
        console.error("Error removing favorite:", error);
        toast.error("Failed to remove favorite");
      }
    } else {
      try {
        const response = await axios.post(
          `${url}/api/favorite/add`,
          {
            userId: 'user',
            furId: fur._id || fur.id,
            furName: fur.name,
            recommendation: `AI recommended: ${fur.name}`
          },
          { headers: { token } }
        );

        if (response.data.success) {
          setFavorites(prev => [...prev, {
            furId: fur._id || fur.id,
            furName: fur.name
          }]);
          toast.success("Added to favorites!");
        }
      } catch (error) {
        console.error("Error adding favorite:", error);
        toast.error(error.response?.data?.message || "Failed to add favorite");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  return (
    <div className="ai-chat-container">
      {/* Header with Clear History Button */}
      {token && (
        <div className="chat-header">
          <button onClick={clearHistory} className="clear-history-btn">
            🗑️ Clear History
          </button>
        </div>
      )}

      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-content">
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="message-content loading">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {/* Recommended Furs Cards */}
        {recommendedFurs.length > 0 && (
          <div className="recommended-furs-section">
            <h3>🍽️ Recommended Dishes</h3>
            <div className="recommended-furs-grid">
              {recommendedFurs.map((fur) => (
                <FurCard
                  key={fur.id}
                  fur={fur}
                  url={url}
                  onAddToCart={handleAddToCart}
                  onAddToFavorite={handleAddToFavorite}
                  isFavorited={favorites.some(fav => fav.furId === fur.id)}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {suggestions.length > 0 && messages.length <= 1 && (
        <div className="quick-suggestions">
          <p>Quick suggestions:</p>
          <div className="suggestions-grid">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="suggestion-btn"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about fur..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default AIChat;