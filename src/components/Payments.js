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
  const [couponCode, setCouponCode] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Auth state from token in URL
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);

  const backendURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";
  const monthlyPrice = 15.00;
  const discountedPrice = monthlyPrice - appliedDiscount;

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
        
        // Pre-fill email if available from user data
        if (data.user && data.user.email) {
          setEmail(data.user.email);
        }
        
        setIsVerifyingSession(false);
      } catch (error) {
        console.error("Error verifying session:", error);
        setServerMessage("Authentication failed. Please try logging in again.");
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
          couponCode: couponCode || undefined,
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

  // Handle coupon application
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      return;
    }
    
    try {
      const res = await fetch(`${backendURL}/payments/apply-coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ couponCode }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.valid) {
        setAppliedDiscount(data.discount || 0);
        setServerMessage(`Coupon applied: ${data.description || "Discount applied"}`);
      } else {
        setServerMessage(data.error || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setServerMessage("Error applying coupon");
    }
  };

  // Update the return statement to handle verification state
  if (isVerifyingSession) {
    return (
      <div className="payment-form-container">
        <div className="loading-message">Verifying authentication...</div>
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
                  onChange={(e) => setCountry(e.target.value)}
                  required
                >
                  <option value="Canada">Canada</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  {/* Add more countries as needed */}
                </select>
              </div>
            </div>
            
            <div className="form-field">
              <label htmlFor="province">Province <span className="required">*</span></label>
              <div className="select-wrapper">
                <select
                  id="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  required
                >
                  <option value="British Columbia">British Columbia</option>
                  <option value="Ontario">Ontario</option>
                  <option value="Quebec">Quebec</option>
                  <option value="Alberta">Alberta</option>
                  {/* Add more provinces/states as needed */}
                </select>
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
              <label>Card Info</label>
              <div className="card-element">
                <CardNumberElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#32325d",
                        "::placeholder": { color: "#aab7c4" },
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
                        color: "#32325d",
                        "::placeholder": { color: "#aab7c4" },
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
                        color: "#32325d",
                        "::placeholder": { color: "#aab7c4" },
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
            <div className="coupon-row">
              <div className="original-plan">Omega Plan</div>
              {showCouponInput ? (
                <div className="coupon-input-group">
                  <input
                    type="text"
                    placeholder="Enter coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    type="button"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowCouponInput(true)}
                  className="apply-coupon-btn"
                  type="button"
                >
                  Apply Coupon
                </button>
              )}
            </div>
            
            <div className="price-details">
              <div className="price-row">
                <span>Monthly Price</span>
                <span>${monthlyPrice.toFixed(2)}</span>
              </div>
              
              {appliedDiscount > 0 && (
                <div className="price-row discount">
                  <span>Discount</span>
                  <span>-${appliedDiscount.toFixed(2)}</span>
                </div>
              )}
            </div>
            
            <div className="total-price">
              <div className="price-row">
                <span>You Pay</span>
                <span>USD ${discountedPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="subscription-info">
              <p>
                This subscription automatically renews monthly, 
                and you'll be notified in advance of the monthly 
                charge. Subscription can be cancelled from your profile 
                or via AI Chat on your statement and you can
                cancel anytime from your profile.
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
