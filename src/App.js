import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Payment from "./components/Payments"; // Payment component
import StorePage from "./pages/StorePage"; // StorePage component
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_live_51JYnmdLGF4kichPFG0rO3QfGD0ALUGmo8b8yCiWuR5X05O6M1vVYfSsKbL8GxgnVVwANYIoHZowXFRtgI0XvYl9T00sTiYyH8U");

function App() {
  return (
    <Elements stripe={stripePromise}>
      <Router>
        <Routes>
          {/* Home route - Store Page */}
          <Route path="/" element={<StorePage />} />

          {/* Payment route */}
          <Route path="/payment-app" element={<Payment />} />

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
