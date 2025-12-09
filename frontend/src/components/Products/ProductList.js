import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import ProductCard from './ProductCard';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Products.css';

const ProductList = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, user?.isB2B]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const isB2B = user?.isB2B ? 'true' : 'false';
      const type = filter !== 'all' ? filter : '';
      const params = { isB2B };
      if (type) params.type = type;

      console.log('Fetching products with params:', params);
      const response = await api.get('/products', { params });
      console.log('Products API response:', response.data);
      
      if (response.data && response.data.success) {
        const productsData = response.data.data || [];
        console.log('Products received:', productsData.length);
        setProducts(productsData);
        if (productsData.length === 0) {
          console.log('No products found in database');
        }
      } else {
        console.error('API response not successful:', response.data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      console.error('Error details:', error.response?.data || error.message);
      console.error('Error status:', error.response?.status);
      console.error('Error config:', error.config?.url);
      toast.error('Failed to load products. Please check if backend server is running on port 5000.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="product-list-container">
      <div className="product-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Products
        </button>
        <button
          className={`filter-btn ${filter === 'cow_milk' ? 'active' : ''}`}
          onClick={() => setFilter('cow_milk')}
        >
          🐄 Cow Milk
        </button>
        <button
          className={`filter-btn ${filter === 'buffalo_milk' ? 'active' : ''}`}
          onClick={() => setFilter('buffalo_milk')}
        >
          🐃 Buffalo Milk
        </button>
      </div>

      {products.length === 0 ? (
        <div className="no-products">No products available</div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;

