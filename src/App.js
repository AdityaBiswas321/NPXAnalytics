import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Payment from "./components/Payments"; // Payment component
import StorePage from "./pages/StorePage"; // StorePage component
import ContactSupport from "./pages/ContactSupport"; // ContactSupport component
import TermsOfService from "./pages/TermsOfService"; // TermsOfService component
import PrivacyPolicy from "./pages/PrivacyPolicy"; // PrivacyPolicy component
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  "pk_live_51JYnmdLGF4kichPFG0rO3QfGD0ALUGmo8b8yCiWuR5X05O6M1vVYfSsKbL8GxgnVVwANYIoHZowXFRtgI0XvYl9T00sTiYyH8U"
);

function App() {
  return (
    <Elements stripe={stripePromise}>
      <Router>
        <Routes>
          {/* Home route - Store Page */}
          <Route path="/" element={<StorePage />} />

          {/* Payment route */}
          <Route path="/payment-app" element={<Payment />} />

          {/* Contact Support route */}
          <Route path="/contact-support" element={<ContactSupport />} />

          {/* Terms of Service route */}
          <Route path="/terms-of-service" element={<TermsOfService />} />

          {/* Privacy Policy route */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          {/* Fallback route for invalid paths */}
          <Route
            path="*"
            element={
              <div style={{ textAlign: "center", marginTop: "50px" }}>
                <h1>404 - Page Not Found</h1>
              </div>
            }
          />
        </Routes>
      </Router>
    </Elements>
  );
}

export default App;
