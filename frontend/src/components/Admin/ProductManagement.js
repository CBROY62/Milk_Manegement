import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { toast } from 'react-toastify';
import './ProductManagement.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'cow_milk',
    variant: '',
    fatContent: '',
    description: '',
    priceB2C: '',
    priceB2B: '',
    stock: '',
    unit: 'liter',
    image: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        priceB2C: parseFloat(formData.priceB2C),
        priceB2B: parseFloat(formData.priceB2B),
        stock: parseInt(formData.stock),
        variant: formData.variant || null,
        fatContent: formData.fatContent ? parseFloat(formData.fatContent) : null
      };

      if (editingProduct) {
        const response = await api.put(`/products/${editingProduct._id}`, submitData);
        if (response.data.success) {
          toast.success('Product updated successfully');
          setShowForm(false);
          setEditingProduct(null);
          resetForm();
          fetchProducts();
        }
      } else {
        const response = await api.post('/products', submitData);
        if (response.data.success) {
          toast.success('Product created successfully');
          setShowForm(false);
          resetForm();
          fetchProducts();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'cow_milk',
      variant: '',
      fatContent: '',
      description: '',
      priceB2C: '',
      priceB2B: '',
      stock: '',
      unit: 'liter',
      image: ''
    });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      type: product.type,
      variant: product.variant || '',
      fatContent: product.fatContent || '',
      description: product.description || '',
      priceB2C: product.priceB2C,
      priceB2B: product.priceB2B,
      stock: product.stock,
      unit: product.unit || 'liter',
      image: product.image || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await api.delete(`/products/${productId}`);
      if (response.data.success) {
        toast.success('Product deleted successfully');
        fetchProducts();
      }
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    resetForm();
  };

  if (loading) {
    return <div className="product-management-loading">Loading products...</div>;
  }

  return (
    <div className="product-management-container">
      <div className="product-management-header">
        <h2>Product Management</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          Add New Product
        </button>
      </div>

      {showForm && (
        <div className="product-form-card">
          <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Cow Milk 1L"
                  required
                />
              </div>
              <div className="form-group">
                <label>Product Type</label>
                <select name="type" value={formData.type} onChange={handleChange} required>
                  <option value="cow_milk">Cow Milk</option>
                  <option value="buffalo_milk">Buffalo Milk</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Product description"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>B2C Price (₹)</label>
                <input
                  type="number"
                  name="priceB2C"
                  value={formData.priceB2C}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>B2B Price (₹)</label>
                <input
                  type="number"
                  name="priceB2B"
                  value={formData.priceB2B}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Stock Quantity</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <select name="unit" value={formData.unit} onChange={handleChange} required>
                  <option value="liter">Liter</option>
                  <option value="ml">Milliliter</option>
                  <option value="kg">Kilogram</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Image URL (optional)</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-list">
        <h3>All Products</h3>
        {products.length === 0 ? (
          <p className="no-products">No products found. Add your first product!</p>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-icon-large">
                  {product.type === 'cow_milk' ? '🐄' : '🐃'}
                </div>
                <h4>{product.name}</h4>
                <p className="product-type">{product.type === 'cow_milk' ? 'Cow Milk' : 'Buffalo Milk'}</p>
                {product.variant && (
                  <p className="product-variant">
                    Variant: {product.variant.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    {product.fatContent && ` (${product.fatContent}% fat)`}
                  </p>
                )}
                <div className="product-pricing">
                  <p>B2C: ₹{product.priceB2C} / {product.unit}</p>
                  <p>B2B: ₹{product.priceB2B} / {product.unit}</p>
                </div>
                <p className="product-stock">Stock: {product.stock} {product.unit}</p>
                <div className="product-actions">
                  <button onClick={() => handleEdit(product)} className="btn btn-edit">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(product._id)} className="btn btn-delete">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;

