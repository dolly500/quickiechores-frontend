import React from 'react';

const HelperTermsModal = ({ isOpen, onAccept, onClose }) => {
  if (!isOpen) return null;

  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleOverlay}>
        <div className="terms-modal">
          <div className="terms-header">
            <h2>Chores Helper Terms & Conditions</h2>
            <button className="close-btn" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>

          <div className="terms-body">
  <div className="welcome-section">
    <h3>Welcome to QuickieChores!</h3>
    <p>
     Thank you for joining our platform as a service provider. Please carefully review these terms which govern your relationship with QuickieChores and our customers
    </p>
  </div>

  <section>
    <h3>Booking Availability</h3>
    <ul>
      <li>When a Customer completes payment, the booking becomes visible in your “Available Bookings” section.</li>
      <li>Bookings are open to all Helpers who qualify for that service category.</li>
      <li>Assignments operate on a first-come, first-served basis to ensure fairness.</li>
    </ul>
  </section>

  <section>
    <h3>Accepting or Rejecting Bookings</h3>
    <ul>
      <li>You may choose to accept or decline any booking.</li>
      <li>Once you accept a booking, you are fully responsible for completing the service as described.</li>
      <li>Accepted bookings must be honored. Repeated cancellations, late arrivals, or no-shows may lead to temporary or permanent suspension.</li>
    </ul>
  </section>

  <section>
    <h3>Completion and Payout Process</h3>
    <ul>
      <li>After completing a service, you must mark the booking as <strong>Completed</strong> in your dashboard.</li>
      <li>Once completed:
        <ul>
          <li>The payout enters a 24-hour pending window to allow for Customer feedback.</li>
          <li>If the Customer confirms the work earlier, payment may be released immediately.</li>
          <li>If no issue is reported within 24 hours, QuickieChores will automatically release the payout.</li>
        </ul>
      </li>
      <li>Payouts may be delayed if a dispute or safety concern is raised.</li>
    </ul>
  </section>

  <section>
    <h3>Dispute Resolution</h3>
    <ul>
      <li>If a Customer reports an issue, the payout for the booking will be temporarily placed on hold.</li>
      <li>QuickieChores Support will review evidence from both sides to make a fair and final decision.</li>
    </ul>
  </section>

  <section>
    <h3>Your Responsibilities</h3>
    <ul>
      <li>Deliver services professionally, safely, and in alignment with customer expectations and platform guidelines.</li>
      <li>Maintain accurate and truthful profile information at all times.</li>
      <li>Hold any licenses, certifications, or insurance applicable to your type of service (where required by law).</li>
      <li>Treat Customers and their property respectfully and maintain confidentiality of access details.</li>
      <li>Immediately report any incidents, damages, safety issues, or misconduct to QuickieChores Support.</li>
    </ul>
  </section>

  <section>
    <h3>Platform Protections and Limitations</h3>
    <ul>
      <li>QuickieChores provides a structured system for disputes, payouts, and booking visibility.</li>
      <li>The platform does not cover or insure damage caused by a Helper’s actions or negligence.</li>
      <li>Helpers are responsible for their conduct, performance, and compliance with platform rules.</li>
      <li>Any work performed <strong>outside the QuickieChores platform</strong> is not protected and may result in account suspension.</li>
    </ul>
  </section>

  <section>
    <h3>Account Suspension or Termination</h3>
    <ul>
      <li>QuickieChores may suspend or terminate your account for policy violations, low performance ratings, safety concerns, or misuse of the platform.</li>
    </ul>
  </section>

  <div className="acceptance-note">
    <p><strong>
      By clicking “I Accept,” you confirm that you have read, understood, and agree to these 
      Terms & Conditions as an independent contractor on the QuickieChores platform.
    </strong></p>
  </div>
</div>


          <div className="terms-footer">
            <button className="decline-btn" onClick={onClose}>Decline</button>
            <button className="accept-btn" onClick={onAccept}>I Accept</button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          backdrop-filter: blur(2px);
        }
        .terms-modal {
          background: #fff;
          border-radius: 16px;
          width: 90%;
          max-width: 720px;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,.3);
          animation: fadeIn .3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity:0; transform:scale(.95); }
          to   { opacity:1; transform:scale(1); }
        }
        .terms-header {
          padding: 20px 28px;
          background: linear-gradient(135deg,#667eea,#764ba2);
          color:#fff;
          display:flex;
          justify-content:space-between;
          align-items:center;
          border-radius:16px 16px 0 0;
        }
        .terms-header h2 { margin:0; font-size:22px; }
        .close-btn { 
          background:none; 
          border:none; 
          color:#fff; 
          font-size:28px; 
          cursor:pointer;
          line-height:1;
          padding:0;
          width:32px;
          height:32px;
        }
        .close-btn:hover { opacity:0.8; }

        .terms-body {
          padding:24px;
          line-height:1.6;
          color:#374151;
        }
        
        .welcome-section {
          background: linear-gradient(135deg, #ede9fe, #ddd6fe);
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          border-left: 4px solid #7c3aed;
        }
        .welcome-section h3 {
          margin: 0 0 8px;
          font-size: 19px;
          color: #5b21b6;
        }
        .welcome-section p {
          margin: 0;
          color: #6d28d9;
          font-size: 14px;
        }

        .terms-body section { margin-bottom:20px; }
        .terms-body h3 { margin:0 0 8px; font-size:18px; color:#1f2937; }
        .terms-body ul { margin:8px 0 0 20px; }
        .terms-body li { margin-bottom:6px; }
        .terms-body ul ul { margin-top:4px; }
        .terms-body p { margin:8px 0; }

        .acceptance-note {
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 8px;
          padding: 14px;
          margin-top: 24px;
        }
        .acceptance-note p {
          margin: 0;
          color: #78350f;
          font-size: 14px;
        }

        .terms-footer {
          padding:16px 24px;
          background:#f9fafb;
          display:flex;
          gap:12px;
          justify-content:flex-end;
          border-top:1px solid #e5e7eb;
        }
        .decline-btn, .accept-btn {
          padding:10px 20px;
          border-radius:8px;
          font-weight:600;
          cursor:pointer;
          transition:all .2s;
          border:none;
        }
        .decline-btn {
          background:#e5e7eb;
          color:#374151;
        }
        .decline-btn:hover { background:#d1d5db; }
        .accept-btn {
          background:#667eea;
          color:#fff;
        }
        .accept-btn:hover { background:#5a67d8; }
      `}</style>
    </>
  );
};

export default HelperTermsModal;