import React, { useContext, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { StoreContext } from '../../Context/StoreContext'
import './ReturnForm.css'

const ReturnForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { url, token } = useContext(StoreContext);
  const order = location.state?.order;

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Calculate installment summary
  const installmentSummary = useMemo(() => {
    if (!order?.installments) return [];

    return Object.values(order.installments).map((inst) => {
      const paid = inst.schedule.filter(s => s.paid).length;
      const total = inst.totalMonths;
      const remaining = total - paid;
      const refundEstimate = remaining * inst.pricePerMonth;

      return {
        itemName: inst.itemName,
        paid,
        remaining,
        total,
        pricePerMonth: inst.pricePerMonth,
        refundEstimate,
      };
    });
  }, [order]);

  const totalRefundEstimate = installmentSummary.reduce((sum, i) => sum + i.refundEstimate, 0);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please enter a reason for return");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        url + "/api/order/requestreturn",
        { orderId: order._id, reason },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Return request submitted successfully!");
        navigate('/myorders');
      } else {
        toast.error(response.data.message || "Failed to submit return request");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>No Order Found</h2>
        <button onClick={() => navigate('/myorders')}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="return-form">

      <div className="return-form-header">
        <button className="back-btn" onClick={() => navigate('/myorders')}>← Back</button>
        <h1>Return Request</h1>
        <p className="return-subtitle">Review your rental details before submitting</p>
      </div>

      {/* Order Details */}
      <div className="return-card">
        <div className="return-card-title">📦 Order Details</div>
        <div className="return-detail-row">
          <span className="detail-label">Order ID</span>
          <span className="detail-value mono">#{order._id.slice(-8).toUpperCase()}</span>
        </div>
        <div className="return-detail-row">
          <span className="detail-label">Current Status</span>
          <span className="detail-value">{order.status}</span>
        </div>
      </div>

      {/* Items */}
      <div className="return-card">
        <div className="return-card-title">🛋️ Rented Items</div>
        {order.items.map((item, i) => (
          <div key={i} className="return-item-row">
            <span className="return-item-name">{item.name}</span>
            <span className="return-item-meta">{item.months || 1} month{(item.months || 1) > 1 ? 's' : ''} · ₹{item.price}/mo</span>
          </div>
        ))}
      </div>

      {/* Installment Summary */}
      <div className="return-card">
        <div className="return-card-title">💰 Payment Summary</div>

        {installmentSummary.map((inst, i) => (
          <div key={i} className="summary-box">
            <p className="summary-item-name"><strong>{inst.itemName}</strong></p>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(inst.paid / inst.total) * 100}%` }}
              />
            </div>

            <div className="summary-stats">
              <span className="stat paid-stat">✅ {inst.paid} months completed</span>
              <span className="stat-divider">|</span>
              <span className="stat remaining-stat">⏳ {inst.remaining} months remaining</span>
            </div>

            {inst.remaining > 0 && (
              <p className="refund-estimate">
                Estimated refund: ₹{inst.remaining} × ₹{inst.pricePerMonth}/mo = <strong>₹{inst.refundEstimate}</strong>
              </p>
            )}
          </div>
        ))}

        {totalRefundEstimate > 0 && (
          <div className="total-refund-box">
            <span className="total-refund-label">Total Estimated Refund</span>
            <span className="total-refund-amount">₹{totalRefundEstimate}</span>
          </div>
        )}
      </div>

      {/* Rental Policy Notice */}
      <div className="return-card policy-card">
        <div className="return-card-title">📋 Rental Return Policy</div>
        <ul className="policy-list">
          <li>🗓️ Returns requested <strong>mid-month</strong> will be charged for the <strong>full current month</strong></li>
          <li>🚚 Pickup is scheduled at the <strong>end of the current month</strong> by default</li>
          <li>💵 Refunds are calculated based on <strong>remaining unpaid months only</strong></li>
          <li>⏳ Admin approval is required — you'll see the status update in My Orders</li>
        </ul>
      </div>

      {/* Reason */}
      <div className="return-card">
        <div className="return-card-title">✍️ Reason for Return</div>

        <textarea
          placeholder="Tell us why you want to return this item... (e.g. damaged, no longer needed, found alternative)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
        />

        <button
          className={`submit-btn ${loading ? 'submit-btn-loading' : ''}`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '⏳ Submitting...' : '↩ Submit Return Request'}
        </button>
      </div>

    </div>
  );
};

export default ReturnForm;
