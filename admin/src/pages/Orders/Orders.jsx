import React, { useEffect, useState } from 'react'
import './Orders.css'
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from '../../assets/assets';

const Order = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState({});

  const fetchAllOrders = async () => {
    const response = await axios.get(`${url}/api/order/list`);
    if (response.data.success) {
      setOrders(response.data.data.reverse());
    } else {
      toast.error("Error fetching orders");
    }
  };

  const statusHandler = async (event, orderId) => {
    const response = await axios.post(`${url}/api/order/status`, {
      orderId,
      status: event.target.value
    });
    if (response.data.success) {
      await fetchAllOrders();
    }
  };

  const toggleExpand = (orderId) => {
    setExpanded(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div className='order add'>
      <div className='order-page-header'>
        <h3>All Orders</h3>
        <button className='refresh-btn' onClick={fetchAllOrders}>↻ Refresh</button>
      </div>

      <div className="order-list">
        {orders.map((order, index) => {
          const isExpanded = expanded[order._id];

          // Compute installment summary across all items
          let totalInstallments = 0;
          let paidInstallments = 0;
          let pendingInstallments = 0;
          let totalPaidAmount = 0;
          let totalPendingAmount = 0;

          if (order.installments) {
            Object.values(order.installments).forEach(inst => {
              inst.schedule.forEach(s => {
                totalInstallments++;
                if (s.paid) {
                  paidInstallments++;
                  totalPaidAmount += s.amount;
                } else {
                  pendingInstallments++;
                  totalPendingAmount += s.amount;
                }
              });
            });
          }

          return (
            <div key={index} className='order-item'>

              {/* Row 1: Icon + Customer + Items */}
              <div className='order-row-top'>
                <img src={assets.parcel_icon} alt="" />

                <div className='order-customer-block'>
                  <p className='order-customer-name'>
                    {order.address.firstName} {order.address.lastName}
                  </p>
                  <p className='order-phone'>{order.address.phone}</p>
                  <div className='order-item-address'>
                    <p>{order.address.street},</p>
                    <p>{order.address.city}, {order.address.state}, {order.address.country} – {order.address.zipcode}</p>
                  </div>
                </div>

                <div className='order-items-block'>
                  <p className='order-items-label'>Items Rented</p>
                  {order.items.map((item, i) => (
                    <p key={i} className='order-item-fur'>
                      {item.name} × {item.quantity || 1}
                      <span className='item-meta'> · {item.months || 1}mo · ₹{item.price}/mo</span>
                    </p>
                  ))}
                  <p className='order-items-count'>{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                </div>

                <div className='order-finance-block'>
                  <div className='finance-row'>
                    <span className='finance-label'>Checkout Paid</span>
                    <span className='finance-value'>₹{order.amount}</span>
                  </div>
                  <div className='finance-row'>
                    <span className='finance-label'>Total Collected</span>
                    <span className='finance-value green'>₹{totalPaidAmount}</span>
                  </div>
                  <div className='finance-row'>
                    <span className='finance-label'>Remaining</span>
                    <span className='finance-value orange'>₹{totalPendingAmount}</span>
                  </div>
                </div>

                <div className='order-badges-block'>
                  <span className={`payment-badge ${order.payment ? 'badge-paid' : 'badge-pending'}`}>
                    {order.payment ? '✓ Checkout Paid' : '⏳ Checkout Pending'}
                  </span>
                  <div className='inst-badges'>
                    <span className='inst-badge green-bg'>✓ {paidInstallments} Paid</span>
                    <span className='inst-badge orange-bg'>⏳ {pendingInstallments} Pending</span>
                    <span className='inst-badge blue-bg'>{totalInstallments} Total</span>
                  </div>
                  <p className='order-date-text'>📅 {formatDate(order.date)}</p>
                </div>

                <div className='order-controls'>
                  <select
                    onChange={(e) => statusHandler(e, order._id)}
                    value={order.status}
                  >
                    <option value="Fur Processing">Fur Processing</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>

                  {order.installments && Object.keys(order.installments).length > 0 && (
                    <button
                      className='toggle-inst-btn'
                      onClick={() => toggleExpand(order._id)}
                    >
                      {isExpanded ? '▲ Hide Schedule' : '▶ View Schedule'}
                    </button>
                  )}
                </div>
              </div>

              {/* Installment Schedule Expanded */}
              {isExpanded && order.installments && (
                <div className='admin-schedule-panel'>
                  {Object.entries(order.installments).map(([itemId, inst]) => {
                    const paidCount = inst.schedule.filter(s => s.paid).length;
                    const unpaidCount = inst.schedule.filter(s => !s.paid).length;
                    const collectedAmount = inst.schedule.filter(s => s.paid).reduce((a, s) => a + s.amount, 0);
                    const remainingAmount = inst.schedule.filter(s => !s.paid).reduce((a, s) => a + s.amount, 0);

                    return (
                      <div key={itemId} className='admin-schedule-item'>
                        <div className='admin-schedule-header'>
                          <p className='admin-item-name'>{inst.itemName}</p>
                          <div className='admin-inst-summary'>
                            <span className='admin-badge green-bg'>✓ {paidCount} paid · ₹{collectedAmount}</span>
                            <span className='admin-badge orange-bg'>⏳ {unpaidCount} pending · ₹{remainingAmount}</span>
                            <span className='admin-badge blue-bg'>{inst.totalMonths} months · ₹{inst.pricePerMonth}/mo</span>
                          </div>
                        </div>

                        <div className='admin-schedule-rows'>
                          {inst.schedule.map((s, j) => (
                            <div key={j} className={`admin-sch-row ${s.paid ? 'row-paid' : 'row-pending'}`}>
                              <span className='sch-month'>Month {s.no}</span>
                              <span className='sch-date'>{formatDate(s.date)}</span>
                              <span className='sch-amt'>₹{s.amount}</span>
                              <span className={`sch-tag ${s.paid ? 'tag-paid' : 'tag-pending'}`}>
                                {s.paid ? '✓ Paid' : '⏳ Pending'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Order;
