const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

const router = express.Router();

// Get comprehensive product analytics
router.get('/products', authenticate, async (req, res) => {
  try {
    // Fetch all orders with populated product data
    const orders = await Order.find()
      .populate({
        path: 'items.product',
        model: 'Product'
      })
      .sort({ createdAt: -1 });

    // Fetch all products
    const products = await Product.find({ isActive: true });

    // Calculate metrics
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    
    // Calculate total sales (only from delivered orders)
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const totalSales = deliveredOrders.reduce((sum, order) => sum + order.total, 0);

    // Sales by milk type
    const salesByType = {
      cow_milk: { quantity: 0, revenue: 0 },
      buffalo_milk: { quantity: 0, revenue: 0 }
    };

    // Sales by variant
    const salesByVariant = {
      full_cream: { quantity: 0, revenue: 0 },
      standardized: { quantity: 0, revenue: 0 },
      toned: { quantity: 0, revenue: 0 },
      double_toned: { quantity: 0, revenue: 0 },
      skimmed: { quantity: 0, revenue: 0 },
      null: { quantity: 0, revenue: 0 }
    };

    // Product sales details
    const productSales = {};
    const productStock = {};

    // Process orders
    deliveredOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.product) {
          const product = item.product;
          const productId = product._id.toString();
          
          // Product sales tracking
          if (!productSales[productId]) {
            productSales[productId] = {
              productId: productId,
              name: product.name,
              type: product.type,
              variant: product.variant || null,
              fatContent: product.fatContent || null,
              quantitySold: 0,
              revenue: 0,
              stock: product.stock
            };
          }
          
          productSales[productId].quantitySold += item.quantity;
          productSales[productId].revenue += item.total;

          // Sales by type
          if (product.type === 'cow_milk' || product.type === 'buffalo_milk') {
            salesByType[product.type].quantity += item.quantity;
            salesByType[product.type].revenue += item.total;
          }

          // Sales by variant
          const variantKey = product.variant || 'null';
          if (salesByVariant[variantKey]) {
            salesByVariant[variantKey].quantity += item.quantity;
            salesByVariant[variantKey].revenue += item.total;
          }
        }
      });
    });

    // Process products for stock information
    products.forEach(product => {
      const productId = product._id.toString();
      productStock[productId] = {
        productId: productId,
        name: product.name,
        type: product.type,
        variant: product.variant || null,
        fatContent: product.fatContent || null,
        stock: product.stock,
        unit: product.unit
      };
    });

    // Top selling products (by quantity)
    const topSellingProducts = Object.values(productSales)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10);

    // Cancelled orders details
    const cancelledOrdersDetails = orders
      .filter(o => o.status === 'cancelled')
      .map(order => ({
        orderNumber: order.orderNumber,
        total: order.total,
        cancelledAt: order.updatedAt,
        items: order.items.map(item => ({
          productName: item.product?.name || 'N/A',
          quantity: item.quantity,
          price: item.price
        }))
      }))
      .slice(0, 10);

    // Calculate percentage changes (mock data for now - can be enhanced with historical data)
    const previousPeriodSales = totalSales * 0.85; // Mock: assume 15% increase
    const salesChange = totalSales > 0 ? ((totalSales - previousPeriodSales) / previousPeriodSales * 100).toFixed(1) : 0;

    const previousPeriodOrders = totalOrders * 0.9; // Mock: assume 10% increase
    const ordersChange = totalOrders > 0 ? ((totalOrders - previousPeriodOrders) / previousPeriodOrders * 100).toFixed(1) : 0;

    const previousPeriodProducts = totalProducts * 0.95; // Mock: assume 5% increase
    const productsChange = totalProducts > 0 ? ((totalProducts - previousPeriodProducts) / previousPeriodProducts * 100).toFixed(1) : 0;

    const previousPeriodCancelled = cancelledOrders * 0.8; // Mock: assume 20% increase
    const cancelledChange = cancelledOrders > 0 ? ((cancelledOrders - previousPeriodCancelled) / previousPeriodCancelled * 100).toFixed(1) : 0;

    // Determine which milk type sold more
    const milkTypeComparison = {
      cow_milk: {
        label: 'Cow Milk',
        quantity: salesByType.cow_milk.quantity,
        revenue: salesByType.cow_milk.revenue,
        percentage: salesByType.cow_milk.quantity + salesByType.buffalo_milk.quantity > 0
          ? (salesByType.cow_milk.quantity / (salesByType.cow_milk.quantity + salesByType.buffalo_milk.quantity) * 100).toFixed(1)
          : 0
      },
      buffalo_milk: {
        label: 'Buffalo Milk',
        quantity: salesByType.buffalo_milk.quantity,
        revenue: salesByType.buffalo_milk.revenue,
        percentage: salesByType.cow_milk.quantity + salesByType.buffalo_milk.quantity > 0
          ? (salesByType.buffalo_milk.quantity / (salesByType.cow_milk.quantity + salesByType.buffalo_milk.quantity) * 100).toFixed(1)
          : 0
      }
    };

    // Format variant sales
    const variantSalesFormatted = [
      { name: 'Full Cream', key: 'full_cream', ...salesByVariant.full_cream },
      { name: 'Standardized', key: 'standardized', ...salesByVariant.standardized },
      { name: 'Toned', key: 'toned', ...salesByVariant.toned },
      { name: 'Double Toned', key: 'double_toned', ...salesByVariant.double_toned },
      { name: 'Skimmed', key: 'skimmed', ...salesByVariant.skimmed },
      { name: 'No Variant', key: 'null', ...salesByVariant.null }
    ].filter(v => v.quantity > 0 || v.revenue > 0);

    res.json({
      success: true,
      data: {
        metrics: {
          totalProducts: {
            value: totalProducts,
            change: productsChange,
            changeType: parseFloat(productsChange) >= 0 ? 'positive' : 'negative'
          },
          totalSales: {
            value: totalSales,
            change: salesChange,
            changeType: parseFloat(salesChange) >= 0 ? 'positive' : 'negative'
          },
          totalOrders: {
            value: totalOrders,
            change: ordersChange,
            changeType: parseFloat(ordersChange) >= 0 ? 'positive' : 'negative'
          },
          cancelledOrders: {
            value: cancelledOrders,
            change: cancelledChange,
            changeType: parseFloat(cancelledChange) >= 0 ? 'negative' : 'positive'
          }
        },
        salesByMilkType: milkTypeComparison,
        salesByVariant: variantSalesFormatted,
        productSales: Object.values(productSales),
        topSellingProducts: topSellingProducts,
        cancelledOrdersDetails: cancelledOrdersDetails,
        stockInformation: Object.values(productStock)
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics data',
      error: error.message
    });
  }
});

module.exports = router;

