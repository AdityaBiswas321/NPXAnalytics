import React from "react";
import '../CSS/common.css';

const TermsOfService = () => {
  return (
    <div className="terms-container">
      <header>
        <h1>Terms of Service</h1>
        <p>Effective Date: January 17, 2025</p>
        <p>
          Welcome to NPXComputer Analytics ("we," "our," or "us"). By accessing
          or using our website, API, or services (collectively, the "Services"),
          you agree to comply with these Terms of Service ("ToS"). If you do not
          agree, please discontinue use immediately.
        </p>
      </header>

      <section>
        <h2 className="section-title">1. Overview of Services</h2>
        <p>
          NPXComputer Analytics provides access to advanced materials analytics
          through an API, enabling real-time insights, predictive modeling, and
          data visualization.
        </p>
        <p>
          These Services are intended for businesses, developers, data
          scientists, and other professionals who require powerful analytics
          capabilities.
        </p>
      </section>

      <section>
        <h2 className="section-title">2. Eligibility</h2>
        <ul>
          <li>You must be at least 18 years old to use our Services.</li>
          <li>
            By using the Services, you affirm that you have the legal capacity
            to enter into this agreement.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="section-title">3. Payments and Subscriptions</h2>
        <h3>3.1 API Key Pricing</h3>
        <p>
          The Premium Analytics API Key costs $1 and is valid for 1 hour. Longer
          durations or custom solutions may require separate arrangements.
        </p>

        <h3>3.2 Payment Terms</h3>
        <p>
          All payments are final and non-refundable. By purchasing an API key,
          you agree to the pricing and terms listed at the time of purchase.
        </p>

        <h3>3.3 Free Trials</h3>
        <p>
          Free trials may be available upon request. Contact{" "}
          <a href="mailto:trial@dataflex.com">trial@dataflex.com</a> for
          eligibility and terms.
        </p>
      </section>

      <section>
        <h2 className="section-title">4. Refund and Dispute Policy</h2>
        <p>
          All payments for API keys and services are final. In the event of a
          billing error or verified technical issue directly caused by our
          Services, you may contact support for resolution. Refunds are at our
          sole discretion.
        </p>
      </section>

      <section>
        <h2 className="section-title">5. Cancellation Policy</h2>
        <p>
          You may cancel your subscription at any time. Upon cancellation, you
          will retain access to the Services until the end of your billing
          cycle. Payments made are non-refundable.
        </p>
      </section>

      <section>
        <h2 className="section-title">6. Legal and Export Restrictions</h2>
        <p>
          You are responsible for complying with any applicable local, national,
          or international laws and regulations regarding the use of our
          Services. You agree not to use our Services in jurisdictions where
          such use is restricted or prohibited by law.
        </p>
        <p>
          The Services may not be exported, re-exported, or used in violation of
          export control laws, including restrictions imposed by the United
          States or your local jurisdiction.
        </p>
      </section>

      <section>
        <h2 className="section-title">7. Terms and Conditions for Promotions</h2>
        <p>
          Any promotional offers provided by NPXComputer Analytics are subject
          to the following terms:
        </p>
        <ul>
          <li>Promotions are valid for the specified duration only.</li>
          <li>
            Discounts cannot be combined with other offers unless explicitly
            stated.
          </li>
          <li>
            NPXComputer Analytics reserves the right to modify or terminate
            promotions at any time without notice.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="section-title">8. Data Security and Privacy</h2>
        <p>
          We prioritize your privacy and security. For more information, please
          review our <a href="/privacy-policy">Privacy Policy</a>.
        </p>
      </section>

      <section>
        <h2 className="section-title">9. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, NPXComputer Analytics shall
          not be liable for any indirect, incidental, or consequential damages
          arising from the use of our Services.
        </p>
        <p>
          Our total liability, in any case, is limited to the amount paid by you
          for the Services.
        </p>
      </section>

      <section>
        <h2 className="section-title">10. Modifications to Terms</h2>
        <p>
          We reserve the right to update these Terms of Service at any time.
          Changes will become effective immediately upon posting.
        </p>
        <p>
          Continued use of the Services after changes are posted constitutes
          acceptance of the updated terms.
        </p>
      </section>

      <section>
        <h2 className="section-title">11. Contact Information</h2>
        <p>
          If you have any questions or concerns about these Terms of Service,
          please contact our support team at{" "}
          <a href="/contact-support">Contact Support</a>.
        </p>
      </section>

      <footer>
        <p>&copy; {new Date().getFullYear()} NPXComputer Analytics. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default TermsOfService;
