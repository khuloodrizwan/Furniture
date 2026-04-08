import React, { useEffect, useState } from 'react';
import './ReturnRequests.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const ReturnRequests = ({ url }) => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState({}); // track per-order loading state

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/order/allreturns`);
      if (response.data.success) {
        setReturns(response.data.data.reverse());
      } else {
        toast.error("Failed to fetch return requests");
      }
    } catch (err) {
      toast.error("Error fetching returns");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    setUpdating(prev => ({ ...prev, [orderId]: status }));
    try {
      const response = await axios.post(`${url}/api/order/updatereturnstatus`, {
        orderId,
        status,
      });

      if (response.data.success) {
        toast.success(`Return ${status.toLowerCase()} successfully`);
        if (status === 'Approved' && response.data.refundAmount > 0) {
          toast.info(`Refund of ₹${response.data.refundAmount} to be processed`);
        }
        await fetchReturns();
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Error updating return status");
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: null }));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getStatusClass = (status) => {
    if (status === 'Approved') return 'rs-approved';
    if (status === 'Rejected') return 'rs-rejected';
    return 'rs-requested';
  };

  // Compute paid vs remaining months summary per order
  const getInstallmentSummary = (order) => {
    if (!order.installments) return { paidMonths: 0, remainingMonths: 0, refundAmount: 0 };
    let paidMonths = 0, remainingMonths = 0;

    Object.values(order.installments).forEach(inst => {
      inst.schedule.forEach(s => {
        if (s.paid) paidMonths++;
        else remainingMonths++;
      });
    });

    const refundAmount = order.returnRequest?.refundAmount || 0;
    return { paidMonths, remainingMonths, refundAmount };
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  return (
    <div className="return-requests-page">
      <div className="rr-page-header">
        <div>
          <h3>Return Requests</h3>
          <p className="rr-subtitle">{returns.length} pending return{returns.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="rr-refresh-btn" onClick={fetchReturns} disabled={loading}>
          {loading ? '⏳ Loading...' : '↻ Refresh'}
        </button>
      </div>

      {returns.length === 0 ? (
        <div className="rr-empty">
          <p className="rr-empty-icon">📦</p>
          <h4>No return requests</h4>
          <p>Return requests from users will appear here</p>
        </div>
      ) : (
        <div className="rr-list">
          {returns.map((order, index) => {
            const rr = order.returnRequest;
            const { paidMonths, remainingMonths, refundAmount } = getInstallmentSummary(order);
            const isUpdating = updating[order._id];

            return (
              <div key={index} className="rr-card">

                {/* Card Header */}
                <div className="rr-card-header">
                  <div className="rr-order-meta">
                    <span className="rr-order-id">#{order._id.slice(-8).toUpperCase()}</span>
                    <span className="rr-order-date">📅 {formatDate(rr.requestedAt)}</span>
                  </div>
                  <span className={`rr-status-badge ${getStatusClass(rr.status)}`}>
                    {rr.status === 'Approved' && '✅ '}
                    {rr.status === 'Rejected' && '❌ '}
                    {rr.status === 'Requested' && '⏳ '}
                    {rr.status}
                  </span>
                </div>

                <div className="rr-card-body">

                  {/* User Info */}
                  <div className="rr-section">
                    <p className="rr-section-label">👤 Customer</p>
                    <p className="rr-user-name">{order.userDetails?.name || 'Unknown'}</p>
                    <p className="rr-user-email">{order.userDetails?.email || '—'}</p>
                    {order.address && (
                      <p className="rr-user-address">
                        {order.address.street}, {order.address.city}, {order.address.state}
                      </p>
                    )}
                  </div>

                  {/* Items */}
                  <div className="rr-section">
                    <p className="rr-section-label">🛋️ Rented Items</p>
                    {order.items.map((item, i) => (
                      <div key={i} className="rr-item-row">
                        <span className="rr-item-name">{item.name}</span>
                        <span className="rr-item-meta">{item.months || 1} mo · ₹{item.price}/mo</span>
                      </div>
                    ))}
                  </div>

                  {/* Payment Summary */}
                  <div className="rr-section">
                    <p className="rr-section-label">💰 Payment Summary</p>
                    <div className="rr-payment-grid">
                      <div className="rr-payment-cell">
                        <span className="rr-cell-label">Paid Months</span>
                        <span className="rr-cell-value green">{paidMonths}</span>
                      </div>
                      <div className="rr-payment-cell">
                        <span className="rr-cell-label">Remaining Months</span>
                        <span className="rr-cell-value orange">{remainingMonths}</span>
                      </div>
                      <div className="rr-payment-cell">
                        <span className="rr-cell-label">Estimated Refund</span>
                        <span className="rr-cell-value blue">₹{refundAmount}</span>
                      </div>
                    </div>

                    {rr.pickupSchedule && (
                      <p className="rr-pickup-info">🚚 Pickup: {rr.pickupSchedule}</p>
                    )}
                  </div>

                  {/* Return Reason */}
                  <div className="rr-section">
                    <p className="rr-section-label">✍️ Return Reason</p>
                    <p className="rr-reason-text">"{rr.reason}"</p>
                  </div>

                </div>

                {/* Action Buttons — only if still Requested */}
                {rr.status === 'Requested' && (
                  <div className="rr-actions">
                    <button
                      className="rr-btn rr-approve-btn"
                      onClick={() => handleUpdateStatus(order._id, 'Approved')}
                      disabled={!!isUpdating}
                    >
                      {isUpdating === 'Approved' ? '⏳ Approving...' : '✅ Approve Return'}
                    </button>
                    <button
                      className="rr-btn rr-reject-btn"
                      onClick={() => handleUpdateStatus(order._id, 'Rejected')}
                      disabled={!!isUpdating}
                    >
                      {isUpdating === 'Rejected' ? '⏳ Rejecting...' : '❌ Reject Return'}
                    </button>
                  </div>
                )}

                {/* Resolved State */}
                {rr.status === 'Approved' && (
                  <div className="rr-resolved approved-resolved">
                    ✅ Return approved · Refund of <strong>₹{refundAmount}</strong> to be processed
                  </div>
                )}
                {rr.status === 'Rejected' && (
                  <div className="rr-resolved rejected-resolved">
                    ❌ Return rejected · No refund will be issued
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReturnRequests;
