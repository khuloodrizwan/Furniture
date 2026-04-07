import React, { useContext } from 'react'
import './Cart.css'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom';

const MONTH_OPTIONS = [1, 2, 3, 6, 12];

const Cart = () => {
  const { cartItems, fur_list, removeFromCart, getTotalCartAmount, url, updateCartMonths, deliveryCharge } = useContext(StoreContext);
  const navigate = useNavigate();

  const cartFurs = fur_list.filter(item => cartItems[item._id]?.quantity > 0);

  const getInstallments = (price, months) => {
    const schedule = [];
    const today = new Date();
    for (let i = 0; i < months; i++) {
      const date = new Date(today);
      date.setMonth(date.getMonth() + i);
      schedule.push({
        no: i + 1,
        date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: price
      });
    }
    return schedule;
  }

  // First month total across all items
  const firstMonthTotal = cartFurs.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className='cart'>
      {cartFurs.length === 0 ? (
        <div className='cart-empty'>
          <h2>Your cart is empty</h2>
          <p>Add some furniture to get started</p>
          <button onClick={() => navigate('/furnitures')}>Browse Furniture</button>
        </div>
      ) : (
        <>
          <div className='cart-header'>
            <h1>Your Rental Cart</h1>
            <p>{cartFurs.length} {cartFurs.length === 1 ? 'item' : 'items'}</p>
          </div>

          <div className='cart-content'>
            <div className='cart-items-list'>
              {cartFurs.map((item) => {
                const months = cartItems[item._id]?.months || 1;
                const schedule = getInstallments(item.price, months);

                return (
                  <div key={item._id} className='cart-card'>
                    <div className='cart-card-top'>
                      <img src={url + "/images/" + item.image} alt={item.name} />
                      <div className='cart-card-info'>
                        <h3>{item.name}</h3>
                        <p className='cart-card-category'>{item.category}</p>
                        <p className='cart-card-price'>₹{item.price}<span>/month</span></p>

                        <div className='cart-month-selector'>
                          <p>Rental Duration:</p>
                          <div className='cart-month-options'>
                            {MONTH_OPTIONS.map(m => (
                              <button
                                key={m}
                                className={`cart-month-btn ${months === m ? 'active' : ''}`}
                                onClick={() => updateCartMonths(item._id, m)}
                              >
                                {m}mo
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className='cart-card-right'>
                        <p className='cart-card-total'>₹{item.price}</p>
                        <p className='cart-card-total-label'>due now</p>
                        <button className='cart-remove-btn' onClick={() => removeFromCart(item._id)}>Remove</button>
                      </div>
                    </div>

                    {/* Installment Schedule - reference only */}
                    <div className='cart-installments'>
                      <p className='installment-title'>📅 Upcoming Payment Schedule ({months} month{months > 1 ? 's' : ''})</p>
                      <div className='installment-list'>
                        {schedule.map((inst) => (
                          <div key={inst.no} className={`installment-row ${inst.no === 1 ? 'inst-current' : ''}`}>
                            <span className='inst-no'>#{inst.no}</span>
                            <span className='inst-date'>{inst.date}</span>
                            <span className='inst-amount'>₹{inst.amount}</span>
                            {inst.no === 1 && <span className='inst-badge'>Pay Now</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className='cart-summary'>
              <h2>Order Summary</h2>
              <div className='summary-rows'>
                {cartFurs.map(item => {
                  const months = cartItems[item._id]?.months || 1;
                  return (
                    <div key={item._id} className='summary-row'>
                      <span>{item.name} <span style={{color:'#bbb', fontSize:'11px'}}>({months}mo)</span></span>
                      <span>₹{item.price}</span>
                    </div>
                  );
                })}
                <hr />
                <div className='summary-row'>
                  <span>Delivery</span>
                  <span>₹{deliveryCharge}</span>
                </div>
                <hr />
                <div className='summary-row total-row'>
                  <strong>Due Today</strong>
                  <strong>₹{firstMonthTotal + deliveryCharge}</strong>
                </div>
              </div>
              <p className='summary-note'>Only first month's rent is charged now. Remaining installments billed monthly.</p>
              <button className='cart-checkout-btn' onClick={() => navigate('/order')}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Cart;