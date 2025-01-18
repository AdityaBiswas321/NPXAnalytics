import React from "react";
import '../CSS/common.css';


const PrivacyPolicy = () => {
  return (
    <div className="privacy-container">
      <header>
        <h1>Privacy Policy</h1>
        <p>Effective Date: January 17, 2025</p>
        <p>
          NPXComputer Analytics ("we," "our," or "us") is committed to protecting your privacy. 
          This Privacy Policy outlines how we collect, use, and safeguard your information 
          when you use our website, API, and related services (collectively, the "Services").
        </p>
      </header>

      <section>
        <h2 className="section-title">1. Information We Collect</h2>
        <h3>1.1 Personal Information</h3>
        <p>
          When you interact with our Services, we may collect personal information, such as:
        </p>
        <ul>
          <li>Your name and email address (e.g., for support or trial requests).</li>
          <li>Payment details (processed securely through our payment provider).</li>
        </ul>

        <h3>1.2 Usage Data</h3>
        <p>
          We collect non-personally identifiable data, including:
        </p>
        <ul>
          <li>Your IP address and browser type.</li>
          <li>API usage statistics, such as request volume and response times.</li>
          <li>Device and operating system information.</li>
        </ul>
      </section>

      <section>
        <h2 className="section-title">2. How We Use Your Information</h2>
        <p>
          We use the information we collect to:
        </p>
        <ul>
          <li>Provide, maintain, and improve our Services.</li>
          <li>Process payments and manage subscriptions.</li>
          <li>Respond to support requests and inquiries.</li>
          <li>Analyze usage trends and improve system performance.</li>
          <li>Comply with legal obligations.</li>
        </ul>
      </section>

      <section>
        <h2 className="section-title">3. Data Sharing and Disclosure</h2>
        <h3>3.1 Third-Party Service Providers</h3>
        <p>
          We may share your information with trusted third-party service providers who assist 
          us in delivering our Services, such as payment processors (e.g., Stripe) or hosting providers.
        </p>

        <h3>3.2 Legal Obligations</h3>
        <p>
          We may disclose your information when required to comply with applicable laws, regulations, 
          or legal proceedings.
        </p>

        <h3>3.3 Aggregated Data</h3>
        <p>
          We may share anonymized and aggregated data for research, analytics, or marketing purposes. 
          This data will not identify you personally.
        </p>
      </section>

      <section>
        <h2 className="section-title">4. Data Security</h2>
        <p>
          We implement industry-standard security measures to protect your information, including:
        </p>
        <ul>
          <li>Encryption for sensitive data (e.g., HTTPS and payment information).</li>
          <li>Regular system audits and vulnerability assessments.</li>
          <li>Restricted access to personal information.</li>
        </ul>
        <p>
          While we strive to protect your data, no system is 100% secure. You acknowledge that 
          the transmission of information over the internet involves inherent risks.
        </p>
      </section>

      <section>
        <h2 className="section-title">5. Your Data Rights</h2>
        <h3>5.1 Access and Correction</h3>
        <p>
          You have the right to request access to the personal information we hold about you and 
          request corrections if it is inaccurate or incomplete.
        </p>

        <h3>5.2 Data Deletion</h3>
        <p>
          You may request the deletion of your personal data by contacting us at 
          <a href="/contact-support">Contact Support</a>. Certain data may be retained to comply 
          with legal obligations.
        </p>
      </section>

      <section>
        <h2 className="section-title">6. Cookies and Tracking</h2>
        <p>
          We use cookies and similar tracking technologies to enhance your experience and analyze 
          usage. Cookies may store information such as your preferences or login status.
        </p>
        <p>
          You can manage or disable cookies in your browser settings. However, disabling cookies 
          may impact your ability to use certain features of the Services.
        </p>
      </section>

      <section>
        <h2 className="section-title">7. Third-Party Links</h2>
        <p>
          Our website may include links to third-party sites. We are not responsible for the privacy 
          practices or content of these external websites. We encourage you to review their privacy policies.
        </p>
      </section>

      <section>
        <h2 className="section-title">8. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be effective immediately 
          upon posting on our website. We encourage you to review this policy periodically.
        </p>
      </section>

      <section>
        <h2 className="section-title">9. Contact Us</h2>
        <p>
          If you have any questions or concerns about this Privacy Policy or how we handle your data, 
          please contact us via <a href="/contact-support">Contact Support</a>.
        </p>
      </section>

      <footer>
        <p>&copy; {new Date().getFullYear()} NPXComputer Analytics. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
