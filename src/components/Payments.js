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
 * Payment form component.
 * - Authenticate to access payment features
 * - Purchase 1000 tokens for $5.00
 * - Manages user session state
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
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);

  // If you had ephemeral keys in older code, can remove if not needed:
  const [apiKey, setApiKey] = useState("");

  const backendURL = "https://mysterious-river-47357-494b914b38d7.herokuapp.com";

  // On mount, check for auth token in URL
  useEffect(() => {
    const verifySession = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionToken = params.get("token");

        if (!sessionToken) {
          setIsVerifyingSession(false);
          return;
        }

        const res = await fetch(`${backendURL}/auth/verify-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: sessionToken }),
        });

        if (!res.ok) {
          throw new Error("Session verification failed");
        }

        const data = await res.json();
        setUser(data.user);
        // Set token from the session token to use for subsequent requests
        setToken(sessionToken);
        setIsVerifyingSession(false);
      } catch (error) {
        console.error("Error verifying session:", error);
        setAuthError("Authentication failed. Please try logging in.");
        setIsVerifyingSession(false);
      }
    };

    verifySession();
  }, [backendURL]);

  // Periodically fetch server capacity
  useEffect(() => {
    const fetchServerCapacity = async () => {
      try {
        const res = await fetch(`${backendURL}/server/server-capacity`);
        if (!res.ok) {
          setServerCapacity("Error");
          return;
        }
        const data = await res.json();
        console.log("Server capacity data:", data);
        if (data.status === "available") {
          setServerCapacity("Available");
          setServerMessage("");
        } else if (data.status === "moderate") {
          setServerCapacity("Moderate");
          setServerMessage("");
        } else if (data.status === "full") {
          setServerCapacity("Full");
          setServerMessage("Server is at capacity. Please wait until a key becomes free.");
        } else {
          setServerCapacity("Unknown");
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

  // Handle user login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setServerMessage("");
    setLoginLoading(true);
    console.log("Login initiated with email:", email);
    try {
      const res = await fetch(`${backendURL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Login failed.");
        console.error("Login error response:", data);
        setLoginLoading(false);
        return;
      }
      setToken(data.token);
      setUser(data.user);
      setAuthError("");
      setEmail("");
      setPassword("");
      console.log("Login successful:", data);
    } catch (err) {
      console.error("Login exception:", err);
      setAuthError("Something went wrong. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Retrieve current user using token
  const fetchCurrentUser = async (authToken) => {
    try {
      const res = await fetch(`${backendURL}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const userData = await res.json();
        console.log("Fetched current user:", userData);
        setUser(userData);
      } else {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  // Create Payment Intent ($5.00 = 1000 tokens)
  const initiatePayment = async () => {
    if (!token) {
      setServerMessage("Please log in first.");
      return;
    }
    setLoadingPayment(true);
    setServerMessage("");
    setPaymentInitiated(true);
    try {
      if (serverCapacity === "Full") {
        setServerMessage("Server is at capacity; payment blocked. Please wait.");
        setLoadingPayment(false);
        return;
      }
      const res = await fetch(`${backendURL}/payments/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: 5.0 }),
      });
      if (!res.ok) {
        const data = await res.json();
        setServerMessage(data.error || "Error creating payment intent.");
        return;
      }
      const data = await res.json();
      if (!data.clientSecret) {
        setServerMessage("Missing clientSecret in response.");
        return;
      }
      console.log("Payment intent created:", data);
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error("Error initiating payment:", error);
      setServerMessage("Failed to initiate payment.");
    } finally {
      setLoadingPayment(false);
    }
  };

  // Confirm Payment with Stripe and finalize token purchase
  const handlePayment = async () => {
    if (!stripe || !elements) return;
    setLoadingPayment(true);
    setServerMessage("");
    try {
      if (serverCapacity === "Full") {
        setServerMessage("Server is full, payment cancelled. Please wait until capacity is available again.");
        setLoadingPayment(false);
        return;
      }
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
        const res = await fetch(`${backendURL}/payments/generate-key-after-payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentIntentId: result.paymentIntent.id,
            tokens: 1000,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setServerMessage(`Success! You now have ${data.newBalance} total tokens.`);
          setUser((prev) => (prev ? { ...prev, tokenBalance: data.newBalance } : prev));
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

  // Update the return statement to handle verification state
  if (isVerifyingSession) {
    return (
      <div className="llm-connector">
        <div className="loading-message">Verifying authentication...</div>
      </div>
    );
  }

  return (
    <div className="llm-connector">
      {/* Show login form only if no user */}
      {!user && (
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
            <button type="submit" disabled={loginLoading}>
              {loginLoading ? "Logging in..." : "Log In"}
            </button>
          </form>
        </div>
      )}

      {/* Show payment UI if user is authenticated */}
      {user && (
        <div className="settings-container">
          {/* Payment step 1: create PaymentIntent */}
          {!clientSecret && (
            <>
              <div className="payment-header">
                <h2>Buy 1000 Tokens</h2>
                <p className="payment-description">
                  Pay <span>$5.00</span> (USD) to add 1000 tokens to your balance.
                </p>
              </div>
              <button
                className="payment-button"
                onClick={initiatePayment}
                disabled={loadingPayment || serverCapacity === "Full"}
              >
                {loadingPayment ? "Processing Payment..." : "Pay $5.00"}
              </button>
            </>
          )}

          {/* Payment step 2: confirm card payment */}
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

          {/* Ephemeral key from older logic: can remove if not used */}
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
              : serverCapacity === "Moderate"
              ? "capacity-moderate"
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
