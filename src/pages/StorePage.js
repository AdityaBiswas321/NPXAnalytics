import React, { useState } from "react";
import PaymentPage from "../components/Payments";
import "../CSS/StorePage.css"

const StorePage = () => {
  const [showFAQ, setShowFAQ] = useState(false);

  return (
    <div className="store-container">
      {/* Hero Section */}
      <header className="hero-section">
        <h1 className="store-title">NPXComputer Analytics</h1>
        <p className="store-tagline">
          Unlock powerful insights with our cutting-edge materials analytics API. Make data-driven decisions with ease.
        </p>
        <button className="cta-button">Explore Features</button>
      </header>
      <footer className="store-footer">
        <p>
          <a href="/terms-of-service">Terms of Service</a> |{" "}
          <a href="/privacy-policy">Privacy Policy</a> |{" "}
          <a href="/contact-support">Contact Support</a>
        </p>
        <p>&copy; {new Date().getFullYear()} NPXComputer Analytics. All rights reserved.</p>
      </footer>

      {/* Product Section */}
      <section className="product-section">
        <div className="product-container">
          <h2 className="product-title">Premium Analytics API Key</h2>
          <p className="product-description">
            Transform your business with access to real-time analytics, predictive modeling, and stunning visualizations.
          </p>
          <ul className="product-features">
            <li>🚀 Real-time data updates for actionable insights</li>
            <li>📊 Predictive models powered by machine learning</li>
            <li>🔗 Seamless integration with any platform</li>
            <li>📈 Beautiful, shareable visualizations</li>
            <li>🛡️ Top-tier security and scalability</li>
          </ul>
          <p className="product-price">Price: $1.50 (Valid for 1 hour)</p>
          <PaymentPage />
        </div>
      </section>

      {/* Expanded Features Section */}
      <section className="expanded-features">
        <h2 className="expanded-title">Why Choose NPXComputer Analytics?</h2>
        <div className="feature-grid">
          <div className="feature-item">
            <h3>Real-Time Insights</h3>
            <p>
              Get live data updates for tracking key metrics in inorganic materials database (Quantum Espresso). Stay ahead of trends with instantaneous insights.
            </p>
          </div>
          <div className="feature-item">
            <h3>Scalable Solutions</h3>
            <p>
              From startups to enterprises, our API adapts to your needs and grows with your business.
            </p>
          </div>
          <div className="feature-item">
            <h3>Developer-Friendly Integration</h3>
            <p>
              Easy-to-follow documentation, SDKs, and pre-built integrations make setup effortless.
            </p>
          </div>
          <div className="feature-item">
            <h3>Predictive Power</h3>
            <p>
              Make informed decisions with advanced predictive analytics powered by machine learning.
            </p>
          </div>
          <div className="feature-item">
            <h3>Security & Compliance</h3>
            <p>
              Built with enterprise-grade security, ensuring GDPR compliance and robust encryption.
            </p>
          </div>
        </div>
      </section>

      {/* API Use Cases */}
      <section className="use-cases">
        <h2 className="use-cases-title">Who Is It For?</h2>
        <div className="use-case-grid">
          <div className="use-case-item">
            <h3>Data Scientists</h3>
            <p>
              Quickly access data for your machine learning models and streamline your workflows.
            </p>
          </div>
          <div className="use-case-item">
            <h3>Developers</h3>
            <p>
              Integrate powerful analytics features directly into your applications with ease.
            </p>
          </div>
          <div className="use-case-item">
            <h3>Business Analysts</h3>
            <p>
              Turn complex data into meaningful insights and actionable strategies.
            </p>
          </div>
          <div className="use-case-item">
            <h3>Enterprises</h3>
            <p>
              Scale your analytics capabilities and ensure team-wide access to critical data.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <button className="faq-toggle" onClick={() => setShowFAQ(!showFAQ)}>
          {showFAQ ? "Hide FAQ" : "View FAQ"}
        </button>
        {showFAQ && (
          <ul className="faq-list">
            <li>
              <strong>What does the API provide?</strong>
              <p>
              NPXComputer offers real-time analytics, predictive models, and visualization tools
                accessible via a powerful API.
              </p>
            </li>
            <li>
              <strong>Is there a free trial?</strong>
              <p>
                Yes! Request a 7-day trial API key by emailing{" "}
                <a href="mailto:trial@dataflex.com">trial@dataflex.com</a>.
              </p>
            </li>
            <li>
              <strong>How secure is the API?</strong>
              <p>
                We use top-tier encryption and comply with industry standards like GDPR and SOC 2.
              </p>
            </li>
            <li>
              <strong>Can I cancel my subscription?</strong>
              <p>
                Absolutely. You can cancel anytime without penalties. Contact our support team.
              </p>
            </li>
          </ul>
        )}
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2 className="testimonials-title">What Our Customers Say</h2>
        <div className="testimonials">
          <blockquote className="testimonial">
            "The predictive analytics helped us increase sales by 30%. The best investment
            we've made in years." – Sarah J.
          </blockquote>
          <blockquote className="testimonial">
            "NPXComputer is the backbone of our reporting tools. Seamless integration and
            fantastic support." – Michael R.
          </blockquote>
          <blockquote className="testimonial">
            "Our developers love NPXComputer! The documentation is top-notch, and the setup
            was a breeze." – Alex T.
          </blockquote>
        </div>
      </section>

      {/* Footer Section */}
      
    </div>
  );
};

export default StorePage;
