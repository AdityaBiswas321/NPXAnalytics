import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Payment from "./components/Payments"; // Payment component
import StorePage from "./pages/StorePage"; // StorePage component
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51JYnmdLGF4kichPFTGiaPYHrXX6PYQZ3TkGeU8UA3pk9hwxuff6sxTp4BtmEunnWw8K74s6KQtivj4E0KSbT42Ov00K5LpCIM2");

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
