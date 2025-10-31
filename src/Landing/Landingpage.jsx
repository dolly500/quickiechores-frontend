import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';
import ServiceProviderSignup from '../ServiceProviders/ServiceSignup'; 
import Quickie from '../../src/assets/frontend_assets/Quickie_Chores-removebg-preview.png'

const LandingPage = () => {
  const [activeButton, setActiveButton] = useState(null);
  const [isServiceProviderModalOpen, setIsServiceProviderModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleProviderClick = () => {
    setActiveButton('provider');
    // Open the service provider signup modal
    setIsServiceProviderModalOpen(true);
  };

  const handleCustomerClick = () => {
    setActiveButton('customer');
    // Navigate to customer auth page
    navigate('/auth');
  };

  const closeServiceProviderModal = () => {
    setIsServiceProviderModalOpen(false);
  };

  return (
    <>
      <div className="landing-container">
        {/* Background Pattern */}
        <div className="background-pattern">
          {[...Array(50)].map((_, i) => (
            <div key={i} className={`hexagon hex-${i % 6}`}></div>
          ))}
        </div>

        {/* Main Content */}
        <div className="landing-content">
          {/* Logo Section */}
          <div className="logo-section">
            <h1 className="brand-name">
              <img src={Quickie} alt="" height='150px'/>
            </h1>
            <div className="brand-tagline">We give you your time back, <br /> with trusted and fast providers.</div>
          </div>

          {/* CTA Buttons */}
          <div className="cta-container">

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

          {/* Scroll Indicator */}
          <div className="scroll-indicator">
            <div className="scroll-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Features Section */}
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
              <p>Find reliable, vetted professionals for all your home service needs. Book instantly and track progress in real-time.</p>
              <ul>
                <li>Verified professionals</li>
                <li>Instant booking</li>
                <li>Real-time tracking</li>
              </ul>
            </div>

            <div className="feature-card provider-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" 
        stroke="white" strokeWidth="2"/>
  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="white" strokeWidth="2"/>
  <path d="M9 14l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>

              </div>
              <h3>For Quickie Helper</h3>
              <p>Join our network of trusted professionals and grow your business with flexible scheduling and competitive rates.</p>
              <ul>
                <li>Set your own schedule</li>
                <li>Competitive earnings</li>
                <li>Trusted customer base</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Service Provider Signup Modal */}
      <ServiceProviderSignup 
        isOpen={isServiceProviderModalOpen} 
        onClose={closeServiceProviderModal} 
      />
    </>
  );
};

export default LandingPage;