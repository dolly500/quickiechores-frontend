import React from 'react';

const TermsOfService = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff 0%, #fff 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: '#fff',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        animation: 'slideUp 0.5s ease-out'
      }}>
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div style={{
          background: 'linear-gradient(135deg, #fff, #fff)',
          padding: '40px 30px',
          color: '#000',
          textAlign: 'center'
        }}>
          <h1 style={{
            margin: '0 0 10px 0',
            fontSize: '36px',
            fontWeight: '700',
            letterSpacing: '-0.5px'
          }}>Terms of Service</h1>
          <p style={{
            margin: 0,
            fontSize: '16px',
            opacity: 0.95
          }}>Quickie Chores Platform Agreement</p>
        </div>

        <div style={{
          padding: '40px 30px',
          lineHeight: '1.7',
          color: '#2c3e50'
        }}>
          <section style={{ marginBottom: '35px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '15px',
              paddingBottom: '10px',
            }}>
              
              <h2 style={{
                margin: 0,
                fontSize: '24px',
                color: '#1a1a1a',
                fontWeight: '600'
              }}>Acceptance of Terms</h2>
            </div>
            <p style={{ margin: '15px 0 0 0', lineHeight: '1.8' }}>
              By accessing or using Quickie Chores platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the platform. We reserve the right to modify these terms at any time, and your continued use of the platform constitutes acceptance of any changes.
            </p>
          </section>

          <section style={{ marginBottom: '35px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '15px',
              paddingBottom: '10px',

            }}>
              
              <h2 style={{
                margin: 0,
                fontSize: '24px',
                color: '#1a1a1a',
                fontWeight: '600'
              }}>User Accounts</h2>
            </div>
            <ul style={{
              margin: '15px 0 0 0',
              paddingLeft: '20px',
              listStyle: 'none'
            }}>
              <li style={{
                marginBottom: '12px',
                paddingLeft: '20px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  color: '#ff6b35',
                  fontWeight: '700'
                }}>•</span>
                You must create an account to access platform services
              </li>
              <li style={{
                marginBottom: '12px',
                paddingLeft: '20px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  color: '#ff6b35',
                  fontWeight: '700'
                }}>•</span>
                All information provided must be accurate and up-to-date
              </li>
              <li style={{
                marginBottom: '12px',
                paddingLeft: '20px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  color: '#ff6b35',
                  fontWeight: '700'
                }}>•</span>
                You are responsible for maintaining account security and confidentiality
              </li>
              <li style={{
                marginBottom: '12px',
                paddingLeft: '20px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  color: '#ff6b35',
                  fontWeight: '700'
                }}>•</span>
                Users must be at least 18 years old to create an account
              </li>
              <li style={{
                marginBottom: '12px',
                paddingLeft: '20px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  color: '#ff6b35',
                  fontWeight: '700'
                }}>•</span>
                You agree to notify us immediately of any unauthorized account access
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '35px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '15px',
              paddingBottom: '10px',
            }}>
              
              <h2 style={{
                margin: 0,
                fontSize: '24px',
                color: '#1a1a1a',
                fontWeight: '600'
              }}>Platform Usage</h2>
            </div>
            <ul style={{
              margin: '15px 0 0 0',
              paddingLeft: '20px',
              listStyle: 'none'
            }}>
              <li style={{
                marginBottom: '12px',
                paddingLeft: '20px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  color: '#ff6b35',
                  fontWeight: '700'
                }}>•</span>
                Quickie Chores connects customers with independent service providers (Chores Helpers)
              </li>
              <li style={{
                marginBottom: '12px',
                paddingLeft: '20px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  color: '#ff6b35',
                  fontWeight: '700'
                }}>•</span>
                The platform facilitates bookings but is not a party to service agreements
              </li>
              <li style={{
                marginBottom: '12px',
                paddingLeft: '20px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  color: '#ff6b35',
                  fontWeight: '700'
                }}>•</span>
                Users must not misuse the platform or engage in fraudulent activities
              </li>
              <li style={{
                marginBottom: '12px',
                paddingLeft: '20px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  color: '#ff6b35',
                  fontWeight: '700'
                }}>•</span>
                Users agree to comply with all applicable laws and regulations
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '35px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '15px',
              paddingBottom: '10px',
            }}>
              
              <h2 style={{
                margin: 0,
                fontSize: '24px',
                color: '#1a1a1a',
                fontWeight: '600'
              }}>Payment Terms</h2>
            </div>
            <ul style={{
              margin: '15px 0 0 0',
              paddingLeft: '20px',
              listStyle: 'none'
            }}>
              <li style={{
                marginBottom: '12px',
                paddingLeft: '20px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  color: '#ff6b35',
                  fontWeight: '700'
                }}>•</span>
                All payments must be made through the platform's secure payment system
              </li>
              <li style={{
                marginBottom: '12px',
                paddingLeft: '20px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  color: '#ff6b35',
                  fontWeight: '700'
                }}>•</span>
                Platform fees and service charges are clearly displayed before booking
              </li>
              <li style={{
                marginBottom: '12px',
                paddingLeft: '20px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  color: '#ff6b35',
                  fontWeight: '700'
                }}>•</span>
                Payments are processed securely through third-party payment processors
              </li>
              <li style={{
                marginBottom: '12px',
                paddingLeft: '20px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  color: '#ff6b35',
                  fontWeight: '700'
                }}>•</span>
                Users are responsible for any fees charged by their financial institutions
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '35px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '15px',
              paddingBottom: '10px',
            }}>
             
              <h2 style={{
                margin: 0,
                fontSize: '24px',
                color: '#1a1a1a',
                fontWeight: '600'
              }}>Liability and Disclaimers</h2>
            </div>
            <ul style={{
              margin: '15px 0 0 0',
              paddingLeft: '20px',
              listStyle: 'none'
            }}>
              <li style={{
                marginBottom: '12px',
                paddingLeft: '20px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  color: '#ff6b35',
                  fontWeight: '700'
                }}>•</span>
                Quickie Chores acts as an intermediary and is not liable for service quality
              </li>
              <li style={{
                marginBottom: '12px',
                paddingLeft: '20px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  color: '#ff6b35',
                  fontWeight: '700'
                }}>•</span>
                Users engage with Chores Helpers at their own risk
              </li>
              <li style={{
                marginBottom: '12px',
                paddingLeft: '20px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  color: '#ff6b35',
                  fontWeight: '700'
                }}>•</span>
                The platform is provided "as is" without warranties of any kind
              </li>
              <li style={{
                marginBottom: '12px',
                paddingLeft: '20px',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  color: '#ff6b35',
                  fontWeight: '700'
                }}>•</span>
                We are not responsible for damages arising from platform use
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '35px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '15px',
              paddingBottom: '10px',
            }}>
              
              <h2 style={{
                margin: 0,
                fontSize: '24px',
                color: '#1a1a1a',
                fontWeight: '600'
              }}>Privacy and Data Protection</h2>
            </div>
            <p style={{ margin: '15px 0 0 0', lineHeight: '1.8' }}>
              We collect and process personal data in accordance with our Privacy Policy. By using the platform, you consent to such processing and warrant that all data provided is accurate. We implement appropriate security measures to protect your information.
            </p>
          </section>

          <section style={{
            padding: '25px',
            borderRadius: '12px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '24px',
                color: '#1a1a1a',
                fontWeight: '600'
              }}>Termination</h2>
            </div>
            <p style={{ margin: '15px 0 0 0', lineHeight: '1.8' }}>
              We reserve the right to suspend or terminate user accounts that violate these Terms of Service or engage in activities harmful to the platform or other users. Users may also terminate their accounts at any time by contacting support. Upon termination, certain provisions of these terms will continue to apply.
            </p>
          </section>

          <div style={{
            marginTop: '40px',
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '10px',
            textAlign: 'center',
            borderLeft: '4px solid #ff6b35'
          }}>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#666'
            }}>
              For questions about these Terms of Service, please contact support@quickiechores.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;