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
  const [variantFilter, setVariantFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, variantFilter, user?.isB2B]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const isB2B = user?.isB2B ? 'true' : 'false';
      const type = filter !== 'all' ? filter : '';
      const params = { isB2B };
      if (type) params.type = type;
      if (variantFilter !== 'all' && filter === 'cow_milk') {
        params.variant = variantFilter;
      }

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

  const handleFilterChange = (filterKey) => {
    setFilter(filterKey);
    if (filterKey !== 'cow_milk') {
      setVariantFilter('all');
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  const filters = [
    { key: 'all', label: 'All Products', icon: '🛒' },
    { key: 'cow_milk', label: 'Cow Milk', icon: '🐄' },
    { key: 'buffalo_milk', label: 'Buffalo Milk', icon: '🐃' }
  ];

  const cowMilkVariants = [
    { key: 'all', label: 'All Variants', icon: '🥛' },
    { key: 'full_cream', label: 'Full Cream', icon: '🥛', fatContent: '6%' },
    { key: 'standardized', label: 'Standardized', icon: '🥛', fatContent: '4.5%' },
    { key: 'toned', label: 'Toned', icon: '🥛', fatContent: '3%' },
    { key: 'double_toned', label: 'Double Toned', icon: '🥛', fatContent: '1.5%' },
    { key: 'skimmed', label: 'Skimmed', icon: '🥛', fatContent: '<0.5%' }
  ];

  const getFilterCount = (filterKey) => {
    if (filterKey === 'all') return products.length;
    return products.filter(p => p.type === filterKey).length;
  };

  const getVariantCount = (variantKey) => {
    if (variantKey === 'all') {
      return products.filter(p => p.type === 'cow_milk').length;
    }
    return products.filter(p => p.type === 'cow_milk' && p.variant === variantKey).length;
  };

  return (
    <div className="product-list-container">
      <div className="product-filters">
        {filters.map((filterOption) => (
          <button
            key={filterOption.key}
            className={`filter-btn ${filter === filterOption.key ? 'active' : ''}`}
            onClick={() => handleFilterChange(filterOption.key)}
          >
            <span className="filter-icon">{filterOption.icon}</span>
            <span className="filter-label">{filterOption.label}</span>
            <span className="filter-count">({getFilterCount(filterOption.key)})</span>
          </button>
        ))}
      </div>

      {filter === 'cow_milk' && (
        <div className="variant-filters">
          <h3 className="variant-filters-title">Filter by Fat Content:</h3>
          <div className="variant-filters-buttons">
            {cowMilkVariants.map((variant) => (
              <button
                key={variant.key}
                className={`variant-filter-btn ${variantFilter === variant.key ? 'active' : ''}`}
                onClick={() => setVariantFilter(variant.key)}
              >
                <span className="variant-icon">{variant.icon}</span>
                <span className="variant-label">{variant.label}</span>
                {variant.fatContent && (
                  <span className="variant-fat">{variant.fatContent}</span>
                )}
                <span className="variant-count">({getVariantCount(variant.key)})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="no-products">
          <div className="no-products-icon">📦</div>
          <h3>No products available</h3>
          <p>Check back later for new products!</p>
        </div>
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

