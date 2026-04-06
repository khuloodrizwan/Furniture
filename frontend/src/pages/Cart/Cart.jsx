import React, { useContext } from 'react'
import './Cart.css'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom';

const MONTH_OPTIONS = [1, 2, 3, 6, 12];

const Cart = () => {
  const { cartItems, fur_list, removeFromCart, getTotalCartAmount, url, updateCartMonths, currency, deliveryCharge } = useContext(StoreContext);
  const navigate = useNavigate();

  const cartFurs = fur_list.filter(item => cartItems[item._id]?.quantity > 0);

  const getInstallments = (price, months) => {
    const total = price * months;
    const perMonth = price;
    const schedule = [];
    const today = new Date();
    for (let i = 0; i < months; i++) {
      const date = new Date(today);
      date.setMonth(date.getMonth() + i);
      schedule.push({
        no: i + 1,
        date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: perMonth
      });
    }
    return { total, schedule };
  }

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
                const { total, schedule } = getInstallments(item.price, months);

                return (
                  <div key={item._id} className='cart-card'>
                    <div className='cart-card-top'>
                      <img src={url + "/images/" + item.image} alt={item.name} />
                      <div className='cart-card-info'>
                        <h3>{item.name}</h3>
                        <p className='cart-card-category'>{item.category}</p>
                        <p className='cart-card-price'>₹{item.price}<span>/month</span></p>

                        {/* Month Selector */}
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
                        <p className='cart-card-total'>₹{total}</p>
                        <p className='cart-card-total-label'>total</p>
                        <button className='cart-remove-btn' onClick={() => removeFromCart(item._id)}>Remove</button>
                      </div>
                    </div>

                    {/* Installment Schedule */}
                    <div className='cart-installments'>
                      <p className='installment-title'>📅 Payment Schedule ({months} installment{months > 1 ? 's' : ''})</p>
                      <div className='installment-list'>
                        {schedule.map((inst) => (
                          <div key={inst.no} className='installment-row'>
                            <span className='inst-no'>#{inst.no}</span>
                            <span className='inst-date'>{inst.date}</span>
                            <span className='inst-amount'>₹{inst.amount}</span>
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
                      <span>{item.name} × {months}mo</span>
                      <span>₹{item.price * months}</span>
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
                  <strong>Total</strong>
                  <strong>₹{getTotalCartAmount() + deliveryCharge}</strong>
                </div>
              </div>
              <p className='summary-note'>First installment charged on checkout. Remaining on monthly basis.</p>
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