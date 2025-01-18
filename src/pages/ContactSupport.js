import React from "react";
import '../CSS/common.css';


const ContactSupport = () => {
  return (
    <div className="contact-support-container">
      <header>
        <h1>Contact Support</h1>
        <p>
          We're here to help! If you have any questions, concerns, or feedback,
          feel free to reach out to us using the information below.
        </p>
      </header>

      <section>
        <h2>Contact Information</h2>
        <ul>
          <li>
            <strong>Email:</strong>{" "}
            <a href="mailto:adityabiswas1999@hotmail.com">
              adityabiswas1999@hotmail.com
            </a>
          </li>
          <li>
            <strong>Support Hours:</strong> Monday to Friday, 9:00 AM - 5:00 PM
            (PST)
          </li>
        </ul>
      </section>

      <section>
        <h2>How Can We Help?</h2>
        <p>Here are some common reasons you might need support:</p>
        <ul>
          <li>Questions about your API key or subscription</li>
          <li>Issues accessing the NPXComputer Analytics API</li>
          <li>Billing or payment inquiries</li>
          <li>Feature requests or feedback</li>
        </ul>
      </section>

      <section>
        <h2>Response Time</h2>
        <p>
          We aim to respond to all inquiries within 1-2 business days. For
          urgent issues, please include "URGENT" in the subject line of your
          email.
        </p>
      </section>

      <footer>
        <p>
          Thank you for choosing NPXComputer Analytics. We look forward to
          assisting you!
        </p>
        <p>&copy; {new Date().getFullYear()} NPXComputer Analytics. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ContactSupport;
