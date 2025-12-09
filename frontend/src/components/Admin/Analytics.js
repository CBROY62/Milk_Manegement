import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import { toast } from 'react-toastify';
import './Analytics.css';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/products');
      if (response.data.success) {
        setAnalyticsData(response.data.data);
      } else {
        setAnalyticsData(null);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        toast.error('You do not have permission to view analytics');
      } else {
        toast.error('Failed to load analytics data');
      }
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  if (!analyticsData) {
    return <div className="analytics-error">No analytics data available</div>;
  }

  const { metrics, salesByMilkType, salesByVariant, productSales, topSellingProducts, cancelledOrdersDetails, stockInformation } = analyticsData;

  // Calculate percentages for circular progress
  const getProgressPercentage = (value, max) => {
    return Math.min((value / max) * 100, 100);
  };

  const maxSales = Math.max(salesByMilkType.cow_milk.revenue, salesByMilkType.buffalo_milk.revenue) || 1;
  const maxVariantSales = Math.max(...salesByVariant.map(v => v.revenue), 1);
  const maxStock = Math.max(...stockInformation.map(p => p.stock), 1);

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Product Analytics Dashboard</h1>
        <button onClick={() => navigate('/admin/dashboard')} className="back-btn">← Back to Dashboard</button>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <h3>TOTAL PRODUCTS</h3>
            <div className="metric-value">
              <span className={metrics.totalProducts.changeType === 'positive' ? 'positive' : 'negative'}>
                {metrics.totalProducts.value} {metrics.totalProducts.changeType === 'positive' ? '↑' : '↓'}
              </span>
              <span className={`change ${metrics.totalProducts.changeType}`}>
                {metrics.totalProducts.change}%
              </span>
            </div>
          </div>
          <div className="circular-progress">
            <svg className="progress-ring" width="80" height="80">
              <circle
                className="progress-ring-circle-bg"
                stroke="#e0e0e0"
                strokeWidth="8"
                fill="transparent"
                r="32"
                cx="40"
                cy="40"
              />
              <circle
                className="progress-ring-circle"
                stroke="#667eea"
                strokeWidth="8"
                fill="transparent"
                r="32"
                cx="40"
                cy="40"
                strokeDasharray={`${getProgressPercentage(metrics.totalProducts.value, 100)} ${200 - getProgressPercentage(metrics.totalProducts.value, 100)}`}
                strokeDashoffset="25"
              />
            </svg>
            <span className="progress-text">{Math.round(getProgressPercentage(metrics.totalProducts.value, 100))}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>TOTAL SALES</h3>
            <div className="metric-value">
              <span className={metrics.totalSales.changeType === 'positive' ? 'positive' : 'negative'}>
                ₹{metrics.totalSales.value.toLocaleString()} {metrics.totalSales.changeType === 'positive' ? '↑' : '↓'}
              </span>
              <span className={`change ${metrics.totalSales.changeType}`}>
                {metrics.totalSales.change}%
              </span>
            </div>
          </div>
          <div className="circular-progress">
            <svg className="progress-ring" width="80" height="80">
              <circle
                className="progress-ring-circle-bg"
                stroke="#e0e0e0"
                strokeWidth="8"
                fill="transparent"
                r="32"
                cx="40"
                cy="40"
              />
              <circle
                className="progress-ring-circle"
                stroke="#28a745"
                strokeWidth="8"
                fill="transparent"
                r="32"
                cx="40"
                cy="40"
                strokeDasharray={`${getProgressPercentage(metrics.totalSales.value, 1000000)} ${200 - getProgressPercentage(metrics.totalSales.value, 1000000)}`}
                strokeDashoffset="25"
              />
            </svg>
            <span className="progress-text">{Math.round(getProgressPercentage(metrics.totalSales.value, 1000000))}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>TOTAL ORDERS</h3>
            <div className="metric-value">
              <span className={metrics.totalOrders.changeType === 'positive' ? 'positive' : 'negative'}>
                {metrics.totalOrders.value} {metrics.totalOrders.changeType === 'positive' ? '↑' : '↓'}
              </span>
              <span className={`change ${metrics.totalOrders.changeType}`}>
                {metrics.totalOrders.change}%
              </span>
            </div>
          </div>
          <div className="circular-progress">
            <svg className="progress-ring" width="80" height="80">
              <circle
                className="progress-ring-circle-bg"
                stroke="#e0e0e0"
                strokeWidth="8"
                fill="transparent"
                r="32"
                cx="40"
                cy="40"
              />
              <circle
                className="progress-ring-circle"
                stroke="#ff6b6b"
                strokeWidth="8"
                fill="transparent"
                r="32"
                cx="40"
                cy="40"
                strokeDasharray={`${getProgressPercentage(metrics.totalOrders.value, 1000)} ${200 - getProgressPercentage(metrics.totalOrders.value, 1000)}`}
                strokeDashoffset="25"
              />
            </svg>
            <span className="progress-text">{Math.round(getProgressPercentage(metrics.totalOrders.value, 1000))}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>CANCELLED ORDERS</h3>
            <div className="metric-value">
              <span className={metrics.cancelledOrders.changeType === 'positive' ? 'positive' : 'negative'}>
                {metrics.cancelledOrders.value} {metrics.cancelledOrders.changeType === 'positive' ? '↑' : '↓'}
              </span>
              <span className={`change ${metrics.cancelledOrders.changeType}`}>
                {metrics.cancelledOrders.change}%
              </span>
            </div>
          </div>
          <div className="circular-progress">
            <svg className="progress-ring" width="80" height="80">
              <circle
                className="progress-ring-circle-bg"
                stroke="#e0e0e0"
                strokeWidth="8"
                fill="transparent"
                r="32"
                cx="40"
                cy="40"
              />
              <circle
                className="progress-ring-circle"
                stroke="#ffa500"
                strokeWidth="8"
                fill="transparent"
                r="32"
                cx="40"
                cy="40"
                strokeDasharray={`${getProgressPercentage(metrics.cancelledOrders.value, metrics.totalOrders.value || 1)} ${200 - getProgressPercentage(metrics.cancelledOrders.value, metrics.totalOrders.value || 1)}`}
                strokeDashoffset="25"
              />
            </svg>
            <span className="progress-text">{metrics.totalOrders.value > 0 ? Math.round((metrics.cancelledOrders.value / metrics.totalOrders.value) * 100) : 0}</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Sales by Milk Type */}
        <div className="chart-card">
          <h3>Sales by Milk Type</h3>
          <div className="milk-type-comparison">
            <div className="milk-type-bar">
              <div className="milk-type-label">
                <span>{salesByMilkType.cow_milk.label}</span>
                <span className="milk-type-value">₹{salesByMilkType.cow_milk.revenue.toLocaleString()}</span>
              </div>
              <div className="bar-container">
                <div 
                  className="bar cow-milk-bar" 
                  style={{ width: `${salesByMilkType.cow_milk.percentage}%` }}
                >
                  <span>{salesByMilkType.cow_milk.quantity} units</span>
                </div>
              </div>
            </div>
            <div className="milk-type-bar">
              <div className="milk-type-label">
                <span>{salesByMilkType.buffalo_milk.label}</span>
                <span className="milk-type-value">₹{salesByMilkType.buffalo_milk.revenue.toLocaleString()}</span>
              </div>
              <div className="bar-container">
                <div 
                  className="bar buffalo-milk-bar" 
                  style={{ width: `${salesByMilkType.buffalo_milk.percentage}%` }}
                >
                  <span>{salesByMilkType.buffalo_milk.quantity} units</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sales by Variant */}
        <div className="chart-card">
          <h3>Sales by Variant</h3>
          <div className="variant-chart">
            {salesByVariant.map((variant, index) => (
              <div key={variant.key || index} className="variant-bar-item">
                <div className="variant-label">{variant.name}</div>
                <div className="bar-container">
                  <div 
                    className="bar variant-bar" 
                    style={{ 
                      width: `${(variant.revenue / maxVariantSales) * 100}%`,
                      backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                    }}
                  >
                    <span>₹{variant.revenue.toLocaleString()} ({variant.quantity} units)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="tables-grid">
        {/* Product Sales Table */}
        <div className="table-card">
          <h3>Product Sales Details</h3>
          <div className="table-container">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Type</th>
                  <th>Variant</th>
                  <th>Fat Content</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {productSales.slice(0, 10).map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>{product.type === 'cow_milk' ? 'Cow Milk' : 'Buffalo Milk'}</td>
                    <td>{product.variant ? product.variant.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}</td>
                    <td>{product.fatContent ? `${product.fatContent}%` : 'N/A'}</td>
                    <td>{product.quantitySold}</td>
                    <td>₹{product.revenue.toFixed(2)}</td>
                    <td className={product.stock < 50 ? 'low-stock' : ''}>{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="table-card">
          <h3>Top Selling Products</h3>
          <div className="table-container">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Product Name</th>
                  <th>Type</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topSellingProducts.map((product, index) => (
                  <tr key={index}>
                    <td>#{index + 1}</td>
                    <td>{product.name}</td>
                    <td>{product.type === 'cow_milk' ? 'Cow Milk' : 'Buffalo Milk'}</td>
                    <td>{product.quantitySold}</td>
                    <td>₹{product.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Information */}
        <div className="table-card">
          <h3>Stock Information</h3>
          <div className="table-container">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Type</th>
                  <th>Variant</th>
                  <th>Stock</th>
                  <th>Unit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stockInformation.slice(0, 15).map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>{product.type === 'cow_milk' ? 'Cow Milk' : 'Buffalo Milk'}</td>
                    <td>{product.variant ? product.variant.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}</td>
                    <td>{product.stock}</td>
                    <td>{product.unit}</td>
                    <td>
                      <span className={`stock-status ${product.stock < 50 ? 'low' : product.stock < 100 ? 'medium' : 'high'}`}>
                        {product.stock < 50 ? 'Low' : product.stock < 100 ? 'Medium' : 'High'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cancelled Orders */}
        <div className="table-card">
          <h3>Cancelled Orders</h3>
          <div className="table-container">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Total Amount</th>
                  <th>Cancelled Date</th>
                  <th>Items</th>
                </tr>
              </thead>
              <tbody>
                {cancelledOrdersDetails.map((order, index) => (
                  <tr key={index}>
                    <td>{order.orderNumber}</td>
                    <td>₹{order.total.toFixed(2)}</td>
                    <td>{new Date(order.cancelledAt).toLocaleDateString()}</td>
                    <td>
                      {order.items.map((item, i) => (
                        <div key={i} className="order-item">
                          {item.productName} (Qty: {item.quantity})
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

