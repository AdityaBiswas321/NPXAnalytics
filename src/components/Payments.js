// File: /src/components/Payments.js

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
 * Subscription Payment form component.
 * - Premium subscription for $15/month
 * - Collects user information and payment details
 */
const SubscriptionPaymentForm = () => {
  // Payment states
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState("");
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("Canada");
  const [province, setProvince] = useState("British Columbia");
  const [postalCode, setPostalCode] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Auth state from token in URL
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);
  const [error, setError] = useState(null);

  const backendURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";
  const monthlyPrice = 7.49;

  // On mount, check for auth token in URL
  useEffect(() => {
    const verifySession = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionToken = params.get("token");

        if (!sessionToken) {
          setError("No authentication token provided");
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
        
        // Pre-fill email if available from user data
        if (data.user && data.user.email) {
          setEmail(data.user.email);
        }
        
        setIsVerifyingSession(false);
      } catch (error) {
        console.error("Error verifying session:", error);
        setError("Authentication failed. Please try logging in again.");
        setIsVerifyingSession(false);
      }
    };

    verifySession();
  }, [backendURL]);

  // Create Subscription Intent
  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setServerMessage("Stripe has not loaded yet. Please try again later.");
      return;
    }
    
    if (!agreedToTerms) {
      setServerMessage("You must agree to the Terms & Conditions to continue.");
      return;
    }
    
    setLoadingPayment(true);
    setServerMessage("");
    
    try {
      // Create payment intent for subscription
      const res = await fetch(`${backendURL}/payments/create-subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          country,
          province,
          postalCode,
          plan: "premium"
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        setServerMessage(data.error || "Error creating subscription.");
        setLoadingPayment(false);
        return;
      }
      
      const data = await res.json();
      if (!data.clientSecret) {
        setServerMessage("Missing client secret in response.");
        setLoadingPayment(false);
        return;
      }
      
      // Process the payment with Stripe
      const cardElement = elements.getElement(CardNumberElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${firstName} ${lastName}`,
            email,
            address: {
              country,
              state: province,
              postal_code: postalCode
            }
          }
        }
      });
      
      if (error) {
        setServerMessage(`Payment failed: ${error.message}`);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Confirm subscription with backend
        const confirmRes = await fetch(`${backendURL}/payments/confirm-subscription`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            email,
          }),
        });
        
        if (confirmRes.ok) {
          setServerMessage("Your subscription has been activated successfully!");
          window.parent.postMessage({ type: "PAYMENT_SUCCESS" }, "*");
        } else {
          const errorData = await confirmRes.json();
          setServerMessage(errorData.error || "Error activating subscription.");
        }
      }
    } catch (error) {
      console.error("Error during payment:", error);
      setServerMessage("An error occurred during payment processing.");
    } finally {
      setLoadingPayment(false);
    }
  };

  // Display loading message while verifying
  if (isVerifyingSession) {
    return (
      <div className="payment-form-container">
        <div className="loading-message">Verifying authentication...</div>
      </div>
    );
  }

  // Display error message if verification failed
  if (error) {
    return (
      <div className="payment-form-container">
        <div className="loading-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="payment-form-container">
      <div className="payment-form-wrapper">
        <div className="payment-form-left">
          <form onSubmit={handleSubscribe}>
            <div className="form-field">
              <label htmlFor="firstName">First Name <span className="required">*</span></label>
              <input
                type="text"
                id="firstName"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-field">
              <label htmlFor="lastName">Last Name <span className="required">*</span></label>
              <input
                type="text"
                id="lastName"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-field">
              <label htmlFor="country">Country <span className="required">*</span></label>
              <div className="select-wrapper">
                <select
                  id="country"
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    // Reset province when country changes
                    setProvince("");
                  }}
                  required
                >
                  <option value="">Select a country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="NZ">New Zealand</option>
                  <option value="IN">India</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="IT">Italy</option>
                  <option value="ES">Spain</option>
                  <option value="NL">Netherlands</option>
                  <option value="BE">Belgium</option>
                  <option value="SE">Sweden</option>
                  <option value="NO">Norway</option>
                  <option value="DK">Denmark</option>
                  <option value="FI">Finland</option>
                  <option value="IE">Ireland</option>
                  <option value="PT">Portugal</option>
                  <option value="AT">Austria</option>
                  <option value="CH">Switzerland</option>
                  <option value="JP">Japan</option>
                  <option value="KR">South Korea</option>
                  <option value="SG">Singapore</option>
                  <option value="AE">United Arab Emirates</option>
                </select>
              </div>
            </div>
            
            <div className="form-field">
              <label htmlFor="province">State/Province <span className="required">*</span></label>
              <div className="select-wrapper">
                {country === "US" ? (
                  <select id="province" value={province} onChange={(e) => setProvince(e.target.value)} required>
                    <option value="">Select a state</option>
                    <option value="AL">Alabama</option>
                    <option value="AK">Alaska</option>
                    <option value="AZ">Arizona</option>
                    <option value="AR">Arkansas</option>
                    <option value="CA">California</option>
                    <option value="CO">Colorado</option>
                    <option value="CT">Connecticut</option>
                    <option value="DE">Delaware</option>
                    <option value="FL">Florida</option>
                    <option value="GA">Georgia</option>
                    <option value="HI">Hawaii</option>
                    <option value="ID">Idaho</option>
                    <option value="IL">Illinois</option>
                    <option value="IN">Indiana</option>
                    <option value="IA">Iowa</option>
                    <option value="KS">Kansas</option>
                    <option value="KY">Kentucky</option>
                    <option value="LA">Louisiana</option>
                    <option value="ME">Maine</option>
                    <option value="MD">Maryland</option>
                    <option value="MA">Massachusetts</option>
                    <option value="MI">Michigan</option>
                    <option value="MN">Minnesota</option>
                    <option value="MS">Mississippi</option>
                    <option value="MO">Missouri</option>
                    <option value="MT">Montana</option>
                    <option value="NE">Nebraska</option>
                    <option value="NV">Nevada</option>
                    <option value="NH">New Hampshire</option>
                    <option value="NJ">New Jersey</option>
                    <option value="NM">New Mexico</option>
                    <option value="NY">New York</option>
                    <option value="NC">North Carolina</option>
                    <option value="ND">North Dakota</option>
                    <option value="OH">Ohio</option>
                    <option value="OK">Oklahoma</option>
                    <option value="OR">Oregon</option>
                    <option value="PA">Pennsylvania</option>
                    <option value="RI">Rhode Island</option>
                    <option value="SC">South Carolina</option>
                    <option value="SD">South Dakota</option>
                    <option value="TN">Tennessee</option>
                    <option value="TX">Texas</option>
                    <option value="UT">Utah</option>
                    <option value="VT">Vermont</option>
                    <option value="VA">Virginia</option>
                    <option value="WA">Washington</option>
                    <option value="WV">West Virginia</option>
                    <option value="WI">Wisconsin</option>
                    <option value="WY">Wyoming</option>
                  </select>
                ) : country === "CA" ? (
                  <select id="province" value={province} onChange={(e) => setProvince(e.target.value)} required>
                    <option value="">Select a province</option>
                    <option value="AB">Alberta</option>
                    <option value="BC">British Columbia</option>
                    <option value="MB">Manitoba</option>
                    <option value="NB">New Brunswick</option>
                    <option value="NL">Newfoundland and Labrador</option>
                    <option value="NS">Nova Scotia</option>
                    <option value="ON">Ontario</option>
                    <option value="PE">Prince Edward Island</option>
                    <option value="QC">Quebec</option>
                    <option value="SK">Saskatchewan</option>
                    <option value="NT">Northwest Territories</option>
                    <option value="NU">Nunavut</option>
                    <option value="YT">Yukon</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    id="province"
                    placeholder="Enter state/province/region"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    required
                  />
                )}
              </div>
            </div>
            
            <div className="form-field">
              <label htmlFor="postalCode">Postal Code <span className="required">*</span></label>
              <input
                type="text"
                id="postalCode"
                placeholder="Enter postal code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
              />
            </div>
            
            <div className="form-field">
              <label htmlFor="email">Email <span className="required">*</span></label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-field card-info">
              <label>Card Info <span className="required">*</span></label>
              <div className="card-element">
                <CardNumberElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#fff",
                        "::placeholder": { color: "#888" },
                      },
                      invalid: { color: "#fa755a" },
                    },
                    placeholder: "Card number",
                  }}
                />
              </div>
            </div>
            
            <div className="card-details-row">
              <div className="form-field expiry">
                <CardExpiryElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#fff",
                        "::placeholder": { color: "#888" },
                      },
                      invalid: { color: "#fa755a" },
                    },
                    placeholder: "MM/YY",
                  }}
                />
              </div>
              
              <div className="form-field cvc">
                <CardCvcElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#fff",
                        "::placeholder": { color: "#888" },
                      },
                      invalid: { color: "#fa755a" },
                    },
                    placeholder: "CVV",
                  }}
                />
              </div>
            </div>
            
            {serverMessage && (
              <div className="server-message">
                {serverMessage}
              </div>
            )}
            
            <div className="form-footer">
              <div className="terms-checkbox">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <label htmlFor="terms">
                  I agree to the <a href="/terms" target="_blank">Terms & Conditions</a>
                </label>
              </div>
              
              <button 
                type="submit" 
                className="subscribe-btn" 
                disabled={loadingPayment || !agreedToTerms}
              >
                {loadingPayment ? "Processing..." : "Subscribe"}
              </button>
            </div>
          </form>
        </div>
        
        <div className="payment-form-right">
          <div className="order-summary">
            <h3>Premium</h3>
            
            <div className="price-details">
              <div className="price-row">
                <span>Monthly Price</span>
                <span>${monthlyPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="total-price">
              <div className="price-row">
                <span>You Pay</span>
                <span>USD ${monthlyPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="subscription-info">
              <p>
                This subscription automatically renews monthly, 
                and you'll be notified in advance of the monthly 
                charge. You can cancel anytime from your profile.
              </p>
            </div>
            
            <div className="security-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.4 0 2.8 1.1 2.8 2.5V11c.6 0 1.2.6 1.2 1.3v3.5c0 .6-.6 1.2-1.3 1.2H9.2c-.6 0-1.2-.6-1.2-1.3v-3.5c0-.6.6-1.2 1.2-1.2V9.5C9.2 8.1 10.6 7 12 7z" />
              </svg>
              <span>Payments are secure and encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPaymentForm;
