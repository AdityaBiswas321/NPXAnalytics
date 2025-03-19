import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Navigate } from 'react-router-dom';
import '../CSS/dashboard.css';

const Dashboard = () => {
  const { user, token, spendTokens } = useAppContext();
  const [tokenCount, setTokenCount] = useState(1);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
        setMessageType('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchMaterialsData = async () => {
    try {
      const backendURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";
      const response = await fetch(`${backendURL}/inference/materials`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch materials data');
      }

      const data = await response.json();
      setApiResponse(data);
    } catch (error) {
      console.error("API Error:", error);
      // Still setting a mock response for demo purposes
      setApiResponse({
        material: "Fe2O3",
        properties: {
          formula: "Fe2O3",
          density: "5.24 g/cm³",
          structure: "Rhombohedral",
          bandgap: "2.2 eV"
        },
        analysis: "Iron(III) oxide is an inorganic compound with the formula Fe2O3. It is one of the three main oxides of iron, the other two being iron(II) oxide (FeO) and iron(II,III) oxide (Fe3O4).",
        applications: ["Pigments", "Catalysts", "Thermite reactions", "Medical applications"]
      });
    }
  };

  const handleTokenUse = async () => {
    if (tokenCount <= 0) {
      setMessage('Please enter a valid token amount');
      setMessageType('error');
      return;
    }

    if (tokenCount > user.tokenBalance) {
      setMessage('You do not have enough tokens');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const success = await spendTokens(tokenCount); // Use spendTokens instead
      if (success) {
        setMessage(`Successfully used ${tokenCount} tokens`);
        setMessageType('success');
        await fetchMaterialsData();
      } else {
        setMessage('Failed to use tokens. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error("Error using tokens:", error);
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // If no user, redirect to login
  if (!user || !token) {
    return <Navigate to="/login" />;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Welcome, {user.username}!</h1>
      
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}
      
      <div className="dashboard-grid">
        <div className="dashboard-card account-info">
          <h2>Account Information</h2>
          <div className="info-row">
            <span className="info-label">Username:</span>
            <span className="info-value">{user.username}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">{user.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Token Balance:</span>
            <span className="info-value token-balance">{user.tokenBalance}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Premium Access:</span>
            <span className="info-value">
              {user.uncensoredExpiresAt && new Date(user.uncensoredExpiresAt) > new Date() 
                ? `Active (Expires: ${formatDate(user.uncensoredExpiresAt)})` 
                : 'Inactive'}
            </span>
          </div>
        </div>
        
        <div className="dashboard-card token-usage">
          <h2>Use Tokens</h2>
          <p>Spend tokens to access premium materials analysis</p>
          
          <div className="token-input">
            <label htmlFor="tokenCount">Number of Tokens:</label>
            <input
              type="number"
              id="tokenCount"
              value={tokenCount}
              onChange={(e) => setTokenCount(Math.max(1, parseInt(e.target.value) || 0))}
              min="1"
              max={user.tokenBalance}
            />
          </div>
          
          <button 
            className="use-tokens-btn"
            onClick={handleTokenUse}
            disabled={loading || user.tokenBalance < 1}
          >
            {loading ? 'Processing...' : 'Analyze Materials Data'}
          </button>
          
          {user.tokenBalance < 1 && (
            <p className="token-warning">
              You don't have enough tokens. Please visit the <a href="/store">store</a> to purchase more.
            </p>
          )}
        </div>
      </div>
      
      {apiResponse && (
        <div className="api-response-card">
          <h2>Materials Analysis Result</h2>
          <div className="material-info">
            <h3>{apiResponse.material}</h3>
            <div className="properties-grid">
              {Object.entries(apiResponse.properties).map(([key, value]) => (
                <div className="property" key={key}>
                  <span className="property-name">{key}:</span>
                  <span className="property-value">{value}</span>
                </div>
              ))}
            </div>
            <div className="analysis-section">
              <h4>Analysis:</h4>
              <p>{apiResponse.analysis}</p>
            </div>
            <div className="applications-section">
              <h4>Applications:</h4>
              <ul>
                {apiResponse.applications.map((app, index) => (
                  <li key={index}>{app}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 