import React from 'react';
import ProductManagement from '../components/Admin/ProductManagement';
import ProtectedRoute from '../components/Layout/ProtectedRoute';

const AdminProducts = () => {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <ProductManagement />
    </ProtectedRoute>
  );
};

export default AdminProducts;

