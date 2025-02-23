// File: /src/components/LLMConnector.js
import React, { useState, useEffect } from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import "../CSS/payment.css";

/**
 * Payment form that’s iFramed or used directly.
 * - Log in to get a JWT.
 * - If logged in, can purchase 100 tokens for $1.00.
 * - Saves token in localStorage.
 */
const LLMConnector = () => {
  // Payment states
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState("");
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [serverCapacity, setServerCapacity] = useState("Checking...");
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  // Auth states
  const [token, setToken] = useState(null); // JWT token
  const [user, setUser] = useState(null);   // user object from server
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // If you had ephemeral keys in older code, can remove:
  const [apiKey, setApiKey] = useState("");

  const backendURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";

  // On mount, check localStorage for an existing token
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    }
  }, []);

  // 1. Periodically fetch server capacity
  useEffect(() => {
    const fetchServerCapacity = async () => {
      try {
        const res = await fetch(`${backendURL}/server/server-capacity`);
        const data = await res.json();
        setServerCapacity(data.isFull ? "Full" : "Available");

        if (data.isFull && data.estimatedFreeUpTime) {
          const freeUpTime = new Date(data.estimatedFreeUpTime).toLocaleString();
          setServerMessage(
            `Server is full. Estimated free-up time: ${freeUpTime} (PST)`
          );
        } else {
          setServerMessage(""); // Clear message if server is available
        }
      } catch (error) {
        console.error("Error fetching server capacity:", error);
        setServerCapacity("Error");
      }
    };

    fetchServerCapacity();
    const interval = setInterval(fetchServerCapacity, 60000);
    return () => clearInterval(interval);
  }, [backendURL]);

  // 2. Handle user login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setServerMessage("");

    try {
      const res = await fetch(`${backendURL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Login failed.");
        return;
      }
      // Save token
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      setAuthError("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Login error:", err);
      setAuthError("Something went wrong. Check console.");
    }
  };

  // Retrieve current user from token
  const fetchCurrentUser = async (authToken) => {
    try {
      const res = await fetch(`${backendURL}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        // invalid token
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error("Error fetching user in payment app:", err);
    }
  };

  // 3. Create Payment Intent ($1 = 100 tokens)
  const initiatePayment = async () => {
    if (!token) {
      setServerMessage("Please log in first.");
      return;
    }
    setLoadingPayment(true);
    setServerMessage("");
    setPaymentInitiated(true);
    try {
      const res = await fetch(`${backendURL}/payments/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: 1.0 }), // $1
      });

      if (res.status === 429) {
        setServerMessage("Server is full. Please wait until capacity is available.");
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.clientSecret) {
        setServerMessage(data.error || "Error creating payment intent.");
        return;
      }
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error("Error initiating payment:", error);
      setServerMessage("Failed to initiate payment.");
    } finally {
      setLoadingPayment(false);
    }
  };

  // 4. Confirm Payment with Stripe, then finalize token purchase
  const handlePayment = async () => {
    if (!stripe || !elements) return;
    setLoadingPayment(true);
    setServerMessage("");

    try {
      // Check capacity again
      const capacityRes = await fetch(`${backendURL}/server/server-capacity`);
      const capacityData = await capacityRes.json();

      if (capacityData.isFull) {
        setServerMessage("Server is full, payment cancelled. Please wait until capacity is available again.");
        setLoadingPayment(false);
        return;
      }

      // Confirm card payment
      const cardNumber = elements.getElement(CardNumberElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardNumber },
      });

      if (result.error) {
        console.error("Payment error:", result.error.message);
        setServerMessage("Payment failed. Please try again.");
        return;
      }

      if (result.paymentIntent.status === "succeeded") {
        // Update tokens on server
        const res = await fetch(`${backendURL}/payments/generate-key-after-payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentIntentId: result.paymentIntent.id,
            tokens: 100, // number of tokens purchased
          }),
        });

        if (res.ok) {
          const data = await res.json();
          // Show success
          setServerMessage(`Success! You now have ${data.newBalance} total tokens.`);
          // Update local user object
          setUser((prev) => {
            if (!prev) return prev;
            return { ...prev, tokenBalance: data.newBalance };
          });
          // If ephemeral key is not used, set to "N/A"
          setApiKey("N/A (using token system now)");
        } else {
          const respData = await res.json();
          setServerMessage(respData.error || "Failed to update token balance.");
        }
      }
    } catch (error) {
      console.error("Error during payment process:", error);
      setServerMessage("An error occurred during payment.");
    } finally {
      setLoadingPayment(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="llm-connector">
      {/* If user is not logged in, show login form */}
      {!token && (
        <div className="login-form-container">
          <h2>Please Log In to Buy Tokens</h2>
          {authError && <p style={{ color: "red" }}>{authError}</p>}
          <form onSubmit={handleLogin}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Log In</button>
          </form>
          <p style={{ marginTop: "1rem" }}>
          </p>
        </div>
      )}

      {/* If user is logged in, show payment UI */}
      {token && (
        <div className="settings-container">
          {!clientSecret && (
            <>
              <div className="payment-header">
                <h2>Buy 100 Tokens</h2>
                <p className="payment-description">
                  Pay <span>$1.00</span> (USD) to add 100 tokens to your balance.
                </p>
              </div>
              <button
                className="payment-button"
                onClick={initiatePayment}
                disabled={loadingPayment || serverCapacity === "Full"}
              >
                {loadingPayment ? "Processing Payment..." : "Pay $1.00"}
              </button>
            </>
          )}

          {clientSecret && (
            <div className="card-element-container">
              {serverMessage && <p className="server-message">{serverMessage}</p>}
              <div className="card-number-wrapper">
                <label>Card Number</label>
                <div className="card-element">
                  <CardNumberElement
                    options={{
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#fff",
                          "::placeholder": { color: "#bfbfbf" },
                        },
                        invalid: { color: "#fa755a" },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="card-details-wrapper">
                <div className="card-field">
                  <label>Expiration</label>
                  <div className="card-input">
                    <CardExpiryElement
                      options={{
                        style: {
                          base: {
                            fontSize: "16px",
                            color: "#fff",
                            "::placeholder": { color: "#bfbfbf" },
                          },
                          invalid: { color: "#fa755a" },
                        },
                      }}
                    />
                  </div>
                </div>
                <div className="card-field">
                  <label>CVC</label>
                  <div className="card-input">
                    <CardCvcElement
                      options={{
                        style: {
                          base: {
                            fontSize: "16px",
                            color: "#fff",
                            "::placeholder": { color: "#bfbfbf" },
                          },
                          invalid: { color: "#fa755a" },
                        },
                      }}
                    />
                  </div>
                </div>
                <div className="card-field">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    placeholder="Postal Code"
                    className="card-input"
                  />
                </div>
              </div>

              <button
                className="confirm-payment-button"
                onClick={handlePayment}
                disabled={loadingPayment}
              >
                {loadingPayment ? "Confirming Payment..." : "Confirm Payment"}
              </button>
            </div>
          )}

          {/* Ephemeral key from old logic - you can remove if not needed */}
          {apiKey && apiKey !== "N/A (using token system now)" && (
            <div className="api-key-container">
              <p className="api-key-header">Your API Key</p>
              <div className="api-key-display">
                <span className="api-key-value">{apiKey}</span>
              </div>
              <p className="api-key-instructions">
                Please <strong>copy and save</strong> your API key.
              </p>
            </div>
          )}
        </div>
      )}

      {serverMessage && <p className="server-message">{serverMessage}</p>}

      {/* Show capacity if no payment is in progress */}
      {!paymentInitiated && (
        <div
          className={`server-status ${
            serverCapacity === "Full"
              ? "capacity-full"
              : serverCapacity === "Available"
              ? "capacity-available"
              : "capacity-error"
          }`}
        >
          <h3 className="server-capacity-header">Server Capacity</h3>
          <div className="capacity-indicator">
            <span className="status-dot"></span>
            <p>
              {serverCapacity === "Error"
                ? "Error checking capacity"
                : serverCapacity}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LLMConnector;
