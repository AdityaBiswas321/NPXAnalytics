import React, { useState, useEffect } from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import "../CSS/payment.css";

const LLMConnector = ({ onCategorySelect }) => {
  const [inputText, setInputText] = useState("");
  const [response, setResponse] = useState("");
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [loadingKey, setLoadingKey] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [serverCapacity, setServerCapacity] = useState("Checking...");
  const [paymentInitiated, setPaymentInitiated] = useState(false); // New state

  // Payment system
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState("");
  const [loadingPayment, setLoadingPayment] = useState(false);

useEffect(() => {
  const fetchServerCapacity = async () => {
    try {
      const res = await fetch("https://mysterious-river-47357-494b914b38d7.herokuapp.com/server/server-capacity");
      const data = await res.json();
      setServerCapacity(data.isFull ? "Full" : "Available");

      if (data.isFull && data.estimatedFreeUpTime) {
        const freeUpTime = new Date(data.estimatedFreeUpTime).toLocaleString();
        setServerMessage(`Server is full. Estimated free-up time: ${freeUpTime} (PST)`);
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
}, []);

  const initiatePayment = async () => {
    setLoadingPayment(true);
    setServerMessage("");
    setPaymentInitiated(true); // Set payment as initiated
    try {
      const res = await fetch(
        "https://mysterious-river-47357-494b914b38d7.herokuapp.com/payments/create-payment-intent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: 0.50 }), // Payment amount in USD
        }
      );

      if (res.status === 429) {
        setServerMessage(
          "Server is full. Please wait until capacity is available."
        );
        return;
      }

      const data = await res.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error("Error initiating payment:", error);
      setServerMessage("Failed to initiate payment.");
    } finally {
      setLoadingPayment(false);
    }
  };

  const handlePayment = async () => {
    if (!stripe || !elements) return;
    setLoadingPayment(true);
    setServerMessage("");
  
    try {
      // Final server capacity check
      const capacityRes = await fetch("https://mysterious-river-47357-494b914b38d7.herokuapp.com/server/server-capacity");
      const capacityData = await capacityRes.json();
  
      if (capacityData.isFull) {
        setServerMessage("Server is full, payment cancelled. Please wait until capacity is available again.");
        setLoadingPayment(false);
        return; // Prevent payment from proceeding
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
        const res = await fetch(
          "https://mysterious-river-47357-494b914b38d7.herokuapp.com/payments/generate-key-after-payment",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentIntentId: result.paymentIntent.id }),
          }
        );
  
        if (res.ok) {
          const data = await res.json();
          setApiKey(data.apiKey);
          setServerMessage(`API Key generated! Expires at: ${data.expiry} UTC`);
        } else {
          setServerMessage("Failed to generate API key after payment.");
        }
      }
    } catch (error) {
      console.error("Error during payment process:", error);
      setServerMessage("An error occurred during payment.");
    } finally {
      setLoadingPayment(false);
    }
  };
  

  return (
    <div className="llm-connector">
      {/* Payment and API Key Section */}
      <div className="settings-container">
        {!apiKey && (
          <>
            <div className="payment-header">
              <h2>Get Your API Key</h2>
              <p className="payment-description">
                Pay $0.50 (in USD) to generate a time-limited API key (valid for 1 hour).
              </p>
              
            </div>
            {!clientSecret && (
              <button
                className="payment-button"
                onClick={initiatePayment}
                disabled={loadingPayment || serverCapacity === "Full"}
              >
                {loadingPayment
                  ? "Processing Payment..."
                  : "Pay $0.50 for API Key (1 hour)"}
              </button>
            )}
            {clientSecret && (
              <div className="card-element-container">
                {/* Server Message Display */}
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
                    {/*
                      If you want to hide this entirely, remove it here.
                      Or, for some Stripe configs, you could also do a <PostalCodeElement> 
                      but that’s less common.
                    */}
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
          </>
        )}

        {apiKey && (
          <div className="api-key-container">
            <p className="api-key-header">Your API Key</p>
            <div className="api-key-display">
              <span className="api-key-value">{apiKey}</span>
            </div>
            <p className="api-key-instructions">
              Please <strong>copy and save</strong> your API key. It will not be
              displayed again.
            </p>
          </div>
        )}
        {serverMessage && <p className="server-message">{serverMessage}</p>}

        {/* Server Capacity Section */}
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
    </div>
  );
};

export default LLMConnector;
