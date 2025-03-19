import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import '../CSS/homepage.css';

const HomePage = () => {
  const { user } = useAppContext();

  return (
    <div className="homepage-container">
      <div className="hero-section">
        <h1>Welcome to NPXComputer Analytics</h1>
        <p className="hero-subtitle">
          Advanced materials analysis powered by tokenized API access
        </p>
        <div className="hero-buttons">
          {user ? (
            <Link to="/dashboard" className="primary-button">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="primary-button">
                Login
              </Link>
              <Link to="/signup" className="secondary-button">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="features-section">
        <h2>NPXComputer Analytics Features</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔬</div>
            <h3>Materials Analysis</h3>
            <p>
              Access detailed analysis of material properties and characteristics
              through our powerful API.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Data Visualization</h3>
            <p>
              Transform complex materials data into beautiful, insightful
              visualizations.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Real-time Updates</h3>
            <p>
              Stay current with real-time data updates on materials properties
              and research findings.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔑</div>
            <h3>Tokenized Access</h3>
            <p>
              Purchase tokens for flexible, cost-effective access to our
              premium analytics features.
            </p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to get started?</h2>
        <p>
          Purchase tokens and unlock the power of NPXComputer Analytics today.
        </p>
        <Link to="/store" className="primary-button">
          Visit Store
        </Link>
      </div>
    </div>
  );
};

export default HomePage; 