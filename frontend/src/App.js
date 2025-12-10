import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import DashboardLayout from './components/Layout/DashboardLayout';
import ProfileLayout from './components/Profile/ProfileLayout';
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
import PaymentHistory from './pages/PaymentHistory';
import Profile from './pages/Profile';
import ProfileOrders from './pages/Profile/ProfileOrders';
import ManageAddresses from './pages/Profile/ManageAddresses';
import PANCardInfo from './pages/Profile/PANCardInfo';
import GiftCards from './pages/Profile/GiftCards';
import SavedUPI from './pages/Profile/SavedUPI';
import SavedCards from './pages/Profile/SavedCards';
import MyCoupons from './pages/Profile/MyCoupons';
import MyReviews from './pages/Profile/MyReviews';
import AllNotifications from './pages/Profile/AllNotifications';
import MyWishlist from './pages/Profile/MyWishlist';
import Franchise from './pages/Franchise';
import AdminDashboard from './components/Admin/AdminDashboard';
import Analytics from './components/Admin/Analytics';
import UserManagement from './components/Admin/UserManagement';
import SubscriptionManagement from './components/Admin/SubscriptionManagement';
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
              <Route path="/shop" element={<DashboardLayout><Shop /></DashboardLayout>} />
              <Route path="/cart" element={<ProtectedRoute><DashboardLayout><Cart /></DashboardLayout></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><DashboardLayout><Checkout /></DashboardLayout></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><DashboardLayout><Orders /></DashboardLayout></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><DashboardLayout><OrderTracking /></DashboardLayout></ProtectedRoute>} />
              <Route path="/subscriptions" element={<ProtectedRoute><DashboardLayout><Subscriptions /></DashboardLayout></ProtectedRoute>} />
              <Route path="/payment" element={<ProtectedRoute><DashboardLayout><Payment /></DashboardLayout></ProtectedRoute>} />
              <Route path="/payment-history" element={<ProtectedRoute><DashboardLayout><PaymentHistory /></DashboardLayout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfileLayout><Profile /></ProfileLayout></ProtectedRoute>} />
              <Route path="/profile/orders" element={<ProtectedRoute><ProfileLayout><ProfileOrders /></ProfileLayout></ProtectedRoute>} />
              <Route path="/profile/addresses" element={<ProtectedRoute><ProfileLayout><ManageAddresses /></ProfileLayout></ProtectedRoute>} />
              <Route path="/profile/pan-card" element={<ProtectedRoute><ProfileLayout><PANCardInfo /></ProfileLayout></ProtectedRoute>} />
              <Route path="/profile/gift-cards" element={<ProtectedRoute><ProfileLayout><GiftCards /></ProfileLayout></ProtectedRoute>} />
              <Route path="/profile/saved-upi" element={<ProtectedRoute><ProfileLayout><SavedUPI /></ProfileLayout></ProtectedRoute>} />
              <Route path="/profile/saved-cards" element={<ProtectedRoute><ProfileLayout><SavedCards /></ProfileLayout></ProtectedRoute>} />
              <Route path="/profile/coupons" element={<ProtectedRoute><ProfileLayout><MyCoupons /></ProfileLayout></ProtectedRoute>} />
              <Route path="/profile/reviews" element={<ProtectedRoute><ProfileLayout><MyReviews /></ProfileLayout></ProtectedRoute>} />
              <Route path="/profile/notifications" element={<ProtectedRoute><ProfileLayout><AllNotifications /></ProfileLayout></ProtectedRoute>} />
              <Route path="/profile/wishlist" element={<ProtectedRoute><ProfileLayout><MyWishlist /></ProfileLayout></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/products" element={<DashboardLayout><AdminProducts /></DashboardLayout>} />
              <Route path="/admin/analytics" element={<ProtectedRoute><DashboardLayout><Analytics /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><UserManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/admin/subscriptions" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><SubscriptionManagement /></DashboardLayout></ProtectedRoute>} />
              <Route path="/mediator/dashboard" element={<ProtectedRoute allowedRoles={['mediator']}><DashboardLayout><MediatorDashboard /></DashboardLayout></ProtectedRoute>} />
              <Route path="/delivery/dashboard" element={<ProtectedRoute allowedRoles={['delivery_boy']}><DashboardLayout><DeliveryDashboard /></DashboardLayout></ProtectedRoute>} />
              <Route path="/b2b/dashboard" element={<ProtectedRoute><DashboardLayout><B2BDashboard /></DashboardLayout></ProtectedRoute>} />
              <Route path="/franchise" element={<ProtectedRoute><DashboardLayout><Franchise /></DashboardLayout></ProtectedRoute>} />
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
