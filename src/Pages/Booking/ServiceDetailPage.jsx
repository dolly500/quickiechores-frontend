import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Components/context/storeContext'; 
import BookingForm from './BookingForm';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { service_list, token, setToken, url } = useContext(StoreContext);
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/auth?returnTo=' + encodeURIComponent(window.location.pathname));
      return;
    }

    const fetchServiceDetails = async () => {
      try {
        const contextService = service_list.find(s => s._id === id);
        
        if (contextService) {
          setService(contextService);
          setLoading(false);
        } else {
          const response = await fetch(`${url}/api/service/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          
          if (data.success) {
            setService(data.data);
          } else {
            setError('Service not found');
          }
        }
      } catch (err) {
        console.error('Error fetching service:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          setToken('');
          navigate('/auth?returnTo=' + encodeURIComponent(window.location.pathname));
        } else {
          setError('Failed to load service details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchServiceDetails();
    }
  }, [id, service_list, url, token, setToken, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GBP'
    }).format(price);
  };

  const handleBookNow = () => {
    setShowBookingForm(true);
  };

  const handleBackToServices = () => {
    navigate(-1);
  };

  const handleBookingSuccess = (bookingData) => {
    console.log('Booking successful:', bookingData);
    
    if (bookingData.paymentOrder && bookingData.paymentOrder.approvalLink) {
      window.location.href = bookingData.paymentOrder.approvalLink;
    } else {
      alert('Booking created successfully!');
      navigate('/bookings');
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>Service Not Found</h2>
          <p style={styles.errorText}>{error || 'The requested service could not be found.'}</p>
          <button style={styles.backButton} onClick={handleBackToServices}>
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  if (showBookingForm) {
    return (
      <BookingForm 
        service={service}
        onBack={() => setShowBookingForm(false)}
        onBookingSuccess={handleBookingSuccess}
      />
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={handleBackToServices}>
          ← Back to Services
        </button>
      </div>

      <div style={styles.serviceCard}>
        <div style={styles.contentSection}>
          <div style={styles.serviceHeader}>
            <h1 style={styles.serviceName}>{service.name}</h1>
            <div style={styles.priceTag}>
              {formatPrice(service.price)}
            </div>
          </div>

          {service.category && (
            <div style={styles.categorySection}>
              <span style={styles.categoryTag}>
                {typeof service.category === 'object' ? service.category.name : service.category}
              </span>
            </div>
          )}

          <div style={styles.descriptionSection}>
            <h3 style={styles.descriptionTitle}>Service Description</h3>
            <p style={styles.description}>
              {service.description || 'No description available for this service.'}
            </p>
          </div>

          {/* <div style={styles.featuresSection}>
            <h3 style={styles.featuresTitle}>What's Included</h3>
            <ul style={styles.featuresList}>
              <li style={styles.featureItem}>Professional service delivery</li>
              <li style={styles.featureItem}>Quality materials and tools</li>
              <li style={styles.featureItem}>Satisfaction guarantee</li>
              <li style={styles.featureItem}>Follow-up support</li>
            </ul>
          </div> */}

          <div style={styles.actionSection}>
            <button style={styles.bookButton} onClick={handleBookNow}>
              Book This Service Now
            </button>
            <p style={styles.bookingNote}>
              * You'll be able to select your preferred date and time in the next step
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    marginBottom: '20px'
  },
  backButton: {
    background: 'linear-gradient(135deg, #6c757d, #495057)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  serviceCard: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(26, 35, 126, 0.1)',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '0',
    minHeight: '600px'
  },
  contentSection: {
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  serviceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px'
  },
  serviceName: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'black',
    margin: '0',
    lineHeight: '1.2',
    flex: '1'
  },
  priceTag: {
    background: 'rgb(78, 205, 196)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '25px',
    fontSize: '24px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 15px rgba(26, 35, 126, 0.3)'
  },
  categorySection: {
    display: 'flex',
    gap: '12px'
  },
  categoryTag: {
    background: 'rgba(26, 35, 126, 0.1)',
    color: '#1a237e',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  descriptionSection: {
    borderTop: '1px solid rgba(26, 35, 126, 0.1)',
    paddingTop: '24px'
  },
  descriptionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'black',
    margin: '0 0 12px 0'
  },
  description: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#666',
    margin: '0'
  },
  featuresSection: {
    background: 'rgba(26, 35, 126, 0.05)',
    padding: '24px',
    borderRadius: '12px'
  },
  featuresTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a237e',
    margin: '0 0 16px 0'
  },
  featuresList: {
    listStyle: 'none',
    padding: '0',
    margin: '0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  featureItem: {
    fontSize: '14px',
    color: '#555',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  actionSection: {
    marginTop: 'auto',
    paddingTop: '24px',
    borderTop: '1px solid rgba(26, 35, 126, 0.1)'
  },
  bookButton: {
    background: 'rgb(78, 205, 196)',
    color: 'white',
    border: 'none',
    padding: '16px 32px',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    width: '100%',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 15px rgba(26, 35, 126, 0.3)'
  },
  bookingNote: {
    fontSize: '12px',
    color: '#999',
    textAlign: 'center',
    margin: '12px 0 0 0',
    fontStyle: 'italic'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #1a237e',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },
  loadingText: {
    color: '#666',
    fontSize: '16px',
    margin: '0'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center'
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#d32f2f',
    margin: '0 0 12px 0'
  },
  errorText: {
    color: '#666',
    fontSize: '16px',
    margin: '0 0 20px 0'
  }
};

if (!document.querySelector('#service-details-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'service-details-styles';
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .service-details .feature-item::before {
      content: "✓";
      color: #10b981;
      fontWeight: bold;
      width: 16px;
    }
    
    .service-details .back-button:hover {
      background: linear-gradient(135deg, #495057, #343a40) !important;
      transform: translateY(-1px);
    }
    
    .service-details .book-button:hover {
      background: linear-gradient(135deg, #303f9f, #5e35b1) !important;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(26, 35, 126, 0.4) !important;
    }
    
    @media (max-width: 768px) {
      .service-card {
        grid-template-columns: 1fr !important;
      }
      
      .service-name {
        font-size: 24px !important;
      }
      
      .price-tag {
        font-size: 20px !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default ServiceDetails;