import React from 'react';

const CustomerTermsModal = ({ isOpen, onAccept, onClose }) => {
  if (!isOpen) return null;

  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleOverlay}>
        <div className="terms-modal">
          <div className="terms-header">
            <h2>Customer Terms & Conditions</h2>
            <button className="close-btn" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>

          <div className="terms-body">
  <div className="welcome-section">
    <h3>Welcome to QuickieChores!</h3>
    <p>
     Thank you for choosing our platform to connect with trusted service providers. Please read these terms carefully before proceeding with your booking.
     </p>
  </div>

  <section>
    <h3>Booking and Payment</h3>
    <ul>
      <li>Customers can securely book any service through the QuickieChores Platform and complete payment using approved payment methods.</li>
      <li>Once payment is confirmed, your booking becomes active and will be assigned to a qualified Chores Helper.</li>
      <li>QuickieChores monitors all active bookings to ensure timely response from service providers.</li>
    </ul>
  </section>

  <section>
    <h3>Service Assignment and Refund Assurance</h3>
    <ul>
      <li>If no Chores Helper accepts or attends to your booking within <strong>30 minutes</strong> of payment confirmation, QuickieChores will automatically initiate a full refund to your original payment method—no action required from you.</li>
      <li>If a Chores Helper is assigned but does not show up or respond as scheduled, Customers may contact Support for prompt assistance or a refund review.</li>
    </ul>
  </section>

  <section>
    <h3>Refund Request Window</h3>
    <ul>
      <li>Customers may request a refund or report issues regarding incomplete or unsatisfactory services within <strong>24 hours</strong> of the scheduled service time.</li>
      <li>This ensures that QuickieChores can intervene quickly and protect you effectively.</li>
      <li>Requests submitted after 24 hours may not qualify for refunds due to verification limitations.</li>
    </ul>
  </section>

  <section>
    <h3>Platform Role and Customer Protection</h3>
    <ul>
      <li>
        <strong>QuickieChores serves as a trusted marketplace</strong> that connects Customers with independent Chores Helpers who have agreed to follow platform standards and guidelines.
      </li>
      <li>
        While Chores Helpers operate independently, QuickieChores provides oversight to maintain quality, safety, and accountability for all bookings made through the platform.
      </li>
    </ul>
  </section>

  <section>
    <h3>QuickieChores Protection Policy</h3>
    <ul>
      QuickieChores is committed to ensuring that every Customer receives full platform protection for all official bookings. This protection includes:
      <ul>
        <li>Coverage for verified cases of property damage, personal injury, or loss caused during a Chores Helper’s service.</li>
        <li>Active support and resolution assistance for any disputes between Customers and Chores Helpers.</li>
        <li>Guaranteed platform oversight in cases of delays, cancellations, or scheduling issues caused by service providers.</li>
        <li>Protection against theft, fraud, or misconduct by Chores Helpers assigned through the platform.</li>
      </ul>
      Customers are strongly advised to book only through the official QuickieChores Platform to ensure eligibility for full protection.
    </ul>
  </section>

  <section>
    <h3>Limitation of Liability</h3>
    <p>
      QuickieChores cannot provide protection or assume responsibility for any engagements, payments, or service arrangements made outside the official platform. Only bookings made within QuickieChores are covered by our safety, refund, and support policies.
    </p>
  </section>

  <div className="acceptance-note">
    <p><strong>By clicking "I Accept," you confirm that you have read, understood, and agree to these Terms and Conditions.</strong></p>
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
          background: linear-gradient(135deg,#10b981,#059669);
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
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          border-left: 4px solid #10b981;
        }
        .welcome-section h3 {
          margin: 0 0 8px;
          font-size: 19px;
          color: #065f46;
        }
        .welcome-section p {
          margin: 0;
          color: #047857;
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
          background:#10b981;
          color:#fff;
        }
        .accept-btn:hover { background:#059669; }
      `}</style>
    </>
  );
};

export default CustomerTermsModal;