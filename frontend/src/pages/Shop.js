import React from 'react';
import ProductList from '../components/Products/ProductList';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import './Shop.css';

const Shop = () => {
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="shop-page">
      <div className="shop-header">
        <h1>Our Products</h1>
        <p>Premium quality milk products</p>
      </div>
      <ProductList onAddToCart={handleAddToCart} />
    </div>
  );
};

export default Shop;

