import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const PlaceOrder = () => {
    const [data, setData] = useState({
        firstName: "", lastName: "", email: "", street: "",
        city: "", state: "", zipcode: "", country: "", phone: ""
    });

    const { getTotalCartAmount, token, fur_list, cartItems, url, setCartItems, currency, deliveryCharge } = useContext(StoreContext);
    const navigate = useNavigate();

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
    }

    const placeOrder = async (e) => {
        e.preventDefault();

        let orderItems = [];
        fur_list.forEach((item) => {
            if (cartItems[item._id]?.quantity > 0) {
                orderItems.push({
                    ...item,
                    quantity: cartItems[item._id].quantity,
                    months: cartItems[item._id].months || 1,
                });
            }
        });

        const totalAmount = getTotalCartAmount() + deliveryCharge;

        let orderData = {
            address: data,
            items: orderItems,
            amount: totalAmount,
        };

        let response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });

        if (response.data.success) {
            const { order, orderId, key_id } = response.data;
            const options = {
                key: key_id,
                amount: order.amount,
                currency: order.currency,
                name: "FurRent",
                description: "Furniture Rental Payment",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verifyResponse = await axios.post(url + "/api/order/verify", {
                            orderId,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }, { headers: { token } });

                        if (verifyResponse.data.success) {
                            navigate("/myorders");
                            toast.success("Payment Successful! 🎉");
                            setCartItems({});
                        } else {
                            toast.error("Payment verification failed");
                        }
                    } catch (error) {
                        toast.error("Verification error");
                    }
                },
                prefill: {
                    name: `${data.firstName} ${data.lastName}`,
                    email: data.email,
                    contact: data.phone
                },
                theme: { color: "#004E59" }
            };
            const razorpayInstance = new window.Razorpay(options);
            razorpayInstance.open();
        } else {
            toast.error("Something went wrong");
        }
    }

    useEffect(() => {
        if (!token) {
            toast.error("Please sign in to place an order");
            navigate('/cart');
        } else if (getTotalCartAmount() === 0) {
            navigate('/cart');
        }
    }, [token]);

    const cartFurs = fur_list.filter(item => cartItems[item._id]?.quantity > 0);

    return (
        <div className='place-order'>
            <div className='place-order-inner'>
                <form onSubmit={placeOrder} className='place-order-form'>

                    {/* Left: Address */}
                    <div className="place-order-left">
                        <h2 className='section-heading'>Delivery Information</h2>
                        <div className="multi-field">
                            <input type="text" name='firstName' onChange={onChangeHandler} value={data.firstName} placeholder='First name' required />
                            <input type="text" name='lastName' onChange={onChangeHandler} value={data.lastName} placeholder='Last name' required />
                        </div>
                        <input type="email" name='email' onChange={onChangeHandler} value={data.email} placeholder='Email address' required />
                        <input type="text" name='street' onChange={onChangeHandler} value={data.street} placeholder='Street' required />
                        <div className="multi-field">
                            <input type="text" name='city' onChange={onChangeHandler} value={data.city} placeholder='City' required />
                            <input type="text" name='state' onChange={onChangeHandler} value={data.state} placeholder='State' required />
                        </div>
                        <div className="multi-field">
                            <input type="text" name='zipcode' onChange={onChangeHandler} value={data.zipcode} placeholder='Zip code' required />
                            <input type="text" name='country' onChange={onChangeHandler} value={data.country} placeholder='Country' required />
                        </div>
                        <input type="text" name='phone' onChange={onChangeHandler} value={data.phone} placeholder='Phone' required />
                    </div>

                    {/* Right: Summary + Pay */}
                    <div className="place-order-right">
                        <h2 className='section-heading'>Order Summary</h2>

                        <div className='order-items-list'>
                            {cartFurs.map(item => {
                                const months = cartItems[item._id]?.months || 1;
                                return (
                                    <div key={item._id} className='order-item-row'>
                                        <img src={url + "/images/" + item.image} alt={item.name} />
                                        <div className='order-item-info'>
                                            <p className='order-item-name'>{item.name}</p>
                                            <p className='order-item-duration'>{months} month{months > 1 ? 's' : ''} rental</p>
                                        </div>
                                        <p className='order-item-price'>₹{item.price * months}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <div className='order-totals'>
                            <div className='order-total-row'>
                                <span>Subtotal</span>
                                <span>₹{getTotalCartAmount()}</span>
                            </div>
                            <div className='order-total-row'>
                                <span>Delivery</span>
                                <span>₹{deliveryCharge}</span>
                            </div>
                            <hr />
                            <div className='order-total-row grand'>
                                <strong>Total</strong>
                                <strong>₹{getTotalCartAmount() + deliveryCharge}</strong>
                            </div>
                        </div>

                        <div className='payment-info'>
                            <p>🔒 Secure payment via Razorpay</p>
                            <p className='payment-sub'>First installment charged now. Remaining monthly.</p>
                        </div>

                        <button type='submit' className='pay-btn'>
                            Pay ₹{getTotalCartAmount() + deliveryCharge}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default PlaceOrder;