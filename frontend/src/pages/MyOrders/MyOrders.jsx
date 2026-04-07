import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import axios from 'axios'
import { StoreContext } from '../../Context/StoreContext'
import { toast } from 'react-toastify'

const MyOrders = () => {
  const [data, setData] = useState([]);
  const [expanded, setExpanded] = useState({});
  const { url, token } = useContext(StoreContext);

 const fetchOrders = async () => {
    const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token } });
    console.log("INSTALLMENTS:", JSON.stringify(response.data.data[0].installments));
    setData(response.data.data);
}
  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const toggleExpand = (orderId) => {
    setExpanded(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  const getStatusColor = (status) => {
    if (status.includes('Delivered')) return 'status-delivered';
    if (status.includes('Out')) return 'status-out';
    if (status.includes('Processing')) return 'status-processing';
    return 'status-default';
  }

  // Core Razorpay launcher for installment payments
  const launchRazorpay = async (orderId, itemId, installmentNos) => {
    try {
      const response = await axios.post(url + "/api/order/payinstallment", {
        orderId, itemId, installmentNos
      }, { headers: { token } });

      if (!response.data.success) {
        toast.error("Could not initiate payment");
        return;
      }

      const { order, key_id, meta } = response.data;

      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: "FurRent",
        description: `Installment Payment`,
        order_id: order.id,
        handler: async function (razorpayResponse) {
          try {
            const verifyRes = await axios.post(url + "/api/order/verifyinstallment", {
              orderId: meta.orderId,
              itemId: meta.itemId,
              installmentNos: meta.installmentNos,
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
            }, { headers: { token } });

            if (verifyRes.data.success) {
              toast.success("Installment paid successfully!");
              fetchOrders(); // refresh UI
            } else {
              toast.error("Payment verification failed");
            }
          } catch (err) {
            toast.error("Verification error");
          }
        },
        theme: { color: "#004E59" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      toast.error("Payment error");
    }
  }

  const handlePaySingle = (orderId, itemId, installmentNo) => {
    launchRazorpay(orderId, itemId, [installmentNo]);
  }

  const handlePayAll = (orderId, itemId, unpaidNos) => {
    launchRazorpay(orderId, itemId, unpaidNos);
  }

  return (
    <div className='my-orders'>
      <div className='my-orders-header'>
        <h1>My Orders</h1>
        <p>{data.length} {data.length === 1 ? 'order' : 'orders'}</p>
      </div>

      {data.length === 0 ? (
        <div className='my-orders-empty'>
          <p>🛋️</p>
          <h2>No orders yet</h2>
          <p>Your rental orders will appear here</p>
        </div>
      ) : (
        <div className='orders-list'>
          {data.map((order, index) => (
            <div key={index} className='order-card'>

              {/* Top */}
              <div className='order-card-top'>
                <div className='order-meta'>
                  <p className='order-id'>Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className='order-date'>{formatDate(order.date)}</p>
                </div>
                <div className={`order-status ${getStatusColor(order.status)}`}>
                  <span className='status-dot' />
                  {order.status}
                </div>
              </div>

              <hr className='order-divider' />

              {/* Items */}
              <div className='order-items'>
                {order.items.map((item, i) => (
                  <div key={i} className='order-item-row'>
                    <div className='order-item-info'>
                      <p className='order-item-name'>{item.name}</p>
                      <p className='order-item-meta'>
                        {item.months || 1} month{(item.months || 1) > 1 ? 's' : ''} rental · ₹{item.price}/mo
                      </p>
                    </div>
                    <p className='order-item-total'>₹{item.price}</p>
                  </div>
                ))}
              </div>

              {/* Amount Row */}
              <div className='order-amount-row'>
                <div className='order-amount-info'>
                  <span className='amount-label'>1st Installment Paid</span>
                  <span className='amount-value'>₹{order.amount}</span>
                </div>
                <div className='order-payment-badge'>
                  {order.payment
                    ? <span className='badge-paid'>✓ Paid</span>
                    : <span className='badge-pending'>⏳ Pending</span>
                  }
                </div>
              </div>

              {/* Installment Section per item */}
              {order.installments && Object.keys(order.installments).length > 0 && (
                <div className='order-installments'>
                  <button
                    className='toggle-schedule-btn'
                    onClick={() => toggleExpand(order._id)}
                  >
                    {expanded[order._id] ? '▲' : '▶'} View Payment Schedule
                  </button>

                  {expanded[order._id] && (
                    <div className='schedule-list'>
                      {Object.entries(order.installments).map(([itemId, inst]) => {
                        const paidCount = inst.schedule.filter(s => s.paid).length;
                        const unpaidSchedule = inst.schedule.filter(s => !s.paid);
                        const unpaidNos = unpaidSchedule.map(s => s.no);
                        const totalAmount = unpaidSchedule.length * inst.pricePerMonth;

                        return (
                          <div key={itemId} className='schedule-item'>

                            {/* Item header with summary */}
                            <div className='schedule-item-header'>
                              <p className='schedule-item-name'>{inst.itemName}</p>
                              <div className='installment-summary'>
                                <span className='inst-summary-badge paid-badge'>
                                  ✓ {paidCount} Paid
                                </span>
                                <span className='inst-summary-badge pending-badge'>
                                  ⏳ {unpaidSchedule.length} Pending
                                </span>
                                <span className='inst-summary-badge total-badge'>
                                  {inst.totalMonths} Total
                                </span>
                              </div>
                            </div>

                            {/* Schedule rows */}
                            <div className='schedule-rows'>
                              {inst.schedule.map((s, j) => (
                                <div key={j} className={`schedule-row ${s.paid ? 'paid' : 'unpaid'}`}>
                                  <span className='sch-no'>Month {s.no}</span>
                                  <span className='sch-date'>{formatDate(s.date)}</span>
                                  <span className='sch-amount'>₹{s.amount}</span>
                                  {s.paid ? (
                                    <span className='sch-status sch-paid'>✓ Paid</span>
                                  ) : (
                                    <div className='sch-actions'>
                                      <span className='sch-status sch-upcoming'>Pending</span>
                                      <button
                                        className='pay-now-btn'
                                        onClick={() => handlePaySingle(order._id, itemId, s.no)}
                                      >
                                        Pay Now
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Pay All Remaining button */}
                            {unpaidSchedule.length > 1 && (
                              <button
                                className='pay-all-btn'
                                onClick={() => handlePayAll(order._id, itemId, unpaidNos)}
                              >
                                Pay All Remaining · ₹{totalAmount}
                              </button>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <button className='track-btn' onClick={fetchOrders}>
                Refresh Status
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyOrders;