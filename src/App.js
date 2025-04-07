import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Import components
import Navbar from './components/Navigation/Navbar';
import Dashboard from './pages/Dashboard';
import HomePage from './pages/HomePage';
import StorePage from './pages/StorePage';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ContactSupport from './pages/ContactSupport';
import TermsOfService from './pages/TermsOfService';
import Payment from "./components/Payments"; // Payment component

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, token } = useAppContext();
  
  if (!user || !token) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// App Component
const AppContent = () => {
  return (
    <Router>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Payment route */}
        <Route path="/payment-app" element={<Payment />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/contact-support" element={<ContactSupport />} />
        {/* Fallback route for 404 pages */}
        <Route path="*" element={
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 70px)',
            textAlign: 'center',
            padding: '1rem'
          }}>
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist or has been moved.</p>
            <a href="/" style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#4caf50',
              color: 'white',
              borderRadius: '4px',
              textDecoration: 'none'
            }}>Go Back Home</a>
          </div>
        } />
      </Routes>
    </Router>
  );
};

// Main App with Providers
const App = () => {
  return (
    <AppProvider>
      <Elements stripe={stripePromise}>
        <AppContent />
      </Elements>
    </AppProvider>
  );
};

export default App;
