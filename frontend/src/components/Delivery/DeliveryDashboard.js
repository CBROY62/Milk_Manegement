import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import '../Admin/Dashboard.css';

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders?deliveryBoy=${user._id}`);
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      if (response.data.success) {
        toast.success('Order status updated');
        fetchOrders();
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Delivery Dashboard</h1>
      <div className="dashboard-section">
        <h2>Assigned Orders</h2>
        <div className="orders-table">
          {orders.length === 0 ? (
            <p>No assigned orders</p>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="order-row">
                <span>#{order.orderNumber}</span>
                <span>{order.user?.name || 'N/A'}</span>
                <span>{order.deliveryAddress || 'Store Pickup'}</span>
                <span>₹{order.total.toFixed(2)}</span>
                <span className={`status ${order.status}`}>{order.status}</span>
                {order.status === 'out_for_delivery' && (
                  <button
                    onClick={() => updateOrderStatus(order._id, 'delivered')}
                    className="btn btn-success"
                  >
                    Mark Delivered
                  </button>
                )}
                {order.status === 'processing' && (
                  <button
                    onClick={() => updateOrderStatus(order._id, 'out_for_delivery')}
                    className="btn btn-primary"
                  >
                    Start Delivery
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;

