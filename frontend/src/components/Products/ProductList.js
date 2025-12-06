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
  }, [filter, user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const isB2B = user?.isB2B ? 'true' : 'false';
      const type = filter !== 'all' ? filter : '';
      const params = { isB2B };
      if (type) params.type = type;

      const response = await api.get('/products', { params });
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
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

