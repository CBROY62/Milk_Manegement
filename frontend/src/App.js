import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './components/Cart/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Orders from './pages/Orders';
import OrderTracking from './pages/OrderTracking';
import Subscriptions from './pages/Subscriptions';
import Franchise from './pages/Franchise';
import AdminDashboard from './components/Admin/AdminDashboard';
import MediatorDashboard from './components/Mediator/MediatorDashboard';
import DeliveryDashboard from './components/Delivery/DeliveryDashboard';
import B2BDashboard from './components/B2B/B2BDashboard';
import AdminProducts from './pages/AdminProducts';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
              <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
              <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/mediator/dashboard" element={<ProtectedRoute allowedRoles={['mediator']}><MediatorDashboard /></ProtectedRoute>} />
              <Route path="/delivery/dashboard" element={<ProtectedRoute allowedRoles={['delivery_boy']}><DeliveryDashboard /></ProtectedRoute>} />
              <Route path="/b2b/dashboard" element={<ProtectedRoute><B2BDashboard /></ProtectedRoute>} />
              <Route path="/franchise" element={<ProtectedRoute><Franchise /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
