import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';
import ServiceProviderSignup from '../ServiceProviders/ServiceSignup';
import TermsModal from '../ServiceProviders/TermsModal';            // Helper terms
import CustomerTermsModal from '../Components/CustomerTermsModal';
import Quickie from '../../src/assets/frontend_assets/Quickie_Chores-removebg-preview.png';

const LandingPage = () => {
  const [activeButton, setActiveButton] = useState(null);
  
  // Helper flow
  const [showHelperTerms, setShowHelperTerms] = useState(false);
  const [isServiceProviderModalOpen, setIsServiceProviderModalOpen] = useState(false);

  // Customer flow
  const [showCustomerTerms, setShowCustomerTerms] = useState(false);
  
  const navigate = useNavigate();

  // ====================== HELPER FLOW ======================
  const handleProviderClick = () => {
    setActiveButton('provider');
    setShowHelperTerms(true);
  };

  const acceptHelperTerms = () => {
    setShowHelperTerms(false);
    setIsServiceProviderModalOpen(true);
  };

  const closeHelperTerms = () => {
    setShowHelperTerms(false);
    setActiveButton(null);
  };

  const closeServiceProviderModal = () => {
    setIsServiceProviderModalOpen(false);
    setActiveButton(null);
  };

  // ====================== CUSTOMER FLOW ======================
  const handleCustomerClick = () => {
    setActiveButton('customer');
    setShowCustomerTerms(true); // Show terms first
  };

  const acceptCustomerTerms = () => {
    setShowCustomerTerms(false);
    navigate('/auth'); // Now go to signup/login
  };

  const closeCustomerTerms = () => {
    setShowCustomerTerms(false);
    setActiveButton(null);
  };

  // ====================== RENDER ======================
  return (
    <>
      <div className="landing-container">
        {/* Background, logo, etc. — unchanged */}
        <div className="background-pattern">
          {[...Array(50)].map((_, i) => (
            <div key={i} className={`hexagon hex-${i % 6}`}></div>
          ))}
        </div>

        <div className="landing-content">
          <div className="logo-section">
            <h1 className="brand-name">
              <img src={Quickie} alt="" height='150px'/>
            </h1>
            <div className="brand-tagline">We give you your time back, <br /> with trusted and fast providers.</div>
          </div>

          <div className="cta-container">
            {/* CUSTOMER BUTTON */}
            <button
              className={`cta-button customer-btn ${activeButton === 'customer' ? 'active' : ''}`}
              onClick={handleCustomerClick}
              onMouseEnter={() => setActiveButton('customer')}
              onMouseLeave={() => setActiveButton(null)}
            >
              <span className="btn-text">Book a chore in minutes</span>
              <div className="btn-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>

            {/* PROVIDER BUTTON */}
            <button
              className={`cta-button provider-btn ${activeButton === 'provider' ? 'active' : ''}`}
              onClick={handleProviderClick}
              onMouseEnter={() => setActiveButton('provider')}
              onMouseLeave={() => setActiveButton(null)}
            >
              <span className="btn-text">Become a quickie helper</span>
              <div className="btn-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          </div>

          <div className="scroll-indicator">
            <div className="scroll-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Features Section — unchanged */}
        <div className="features-section">
          <div className="features-container">
            <div className="feature-card customer-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3>For Customers</h3>
              <p>Find reliable, vetted professional for all your home service needs. Book chores instantly.</p>
              <ul>
                <li>Verified professional chores helpers</li>
                <li>Instant booking</li>
                <li>Reliable Chores Helper</li>
                <li>Find fast help in your Neighbourhood</li>
              </ul>
            </div>

            <div className="feature-card provider-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="white" strokeWidth="2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="white" strokeWidth="2"/>
                  <path d="M9 14l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>For Chores Helper</h3>
              <p>Join our network of trusted professionals and grow your business with flexible bookings and competitive rates.</p>
              <ul>
                <li>Competitive earnings</li>
                <li>Trusted customer base</li>
                <li>Fast Payouts in less than 24hours on every Chores</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ========== HELPER TERMS MODAL ========== */}
      <TermsModal
        isOpen={showHelperTerms}
        onAccept={acceptHelperTerms}
        onClose={closeHelperTerms}
      />

      {/* ========== CUSTOMER TERMS MODAL ========== */}
      <CustomerTermsModal
        isOpen={showCustomerTerms}
        onAccept={acceptCustomerTerms}
        onClose={closeCustomerTerms}
      />

      {/* ========== SIGNUP MODAL (Helper only) ========== */}
      <ServiceProviderSignup
        isOpen={isServiceProviderModalOpen}
        onClose={closeServiceProviderModal}
      />
    </>
  );
};

export default LandingPage;