import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ServiceCard from '../../Components/ServiceCard'; 
import baseUrl from '../../../server.js';

const CategoryServices = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryInfo, setCategoryInfo] = useState(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  useEffect(() => {
    const fetchCategoryServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${baseUrl}/api/service/category/${categoryName}`);
        const result = await response.json();
        
        if (result.success) {
          setServices(result.data);
          if (result.data.length > 0) {
            setCategoryInfo(result.data[0].category);
          }
        } else {
          setError('Failed to fetch services for this category');
        }
      } catch (err) {
        setError('Error fetching services: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) {
      fetchCategoryServices();
    }
  }, [categoryName]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleServiceClick = (serviceId) => {
    // Open modal with service details
    setSelectedServiceId(serviceId);
    setIsModalOpen(true);
  };

  const handleBookClick = (serviceId) => {
    // Open modal with service details (you can customize this behavior)
    setSelectedServiceId(serviceId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedServiceId(null);
  };

  if (loading) {
    return (
      <div style={styles.categoryServicesPage}>
        <div style={styles.pageHeader}>
          <button onClick={handleBackClick} style={styles.backButton}>
            ← Back
          </button>
          <div style={styles.categoryHeader}>
            <h1 style={styles.categoryTitle}>Loading Services...</h1>
          </div>
        </div>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.categoryServicesPage}>
        <div style={styles.pageHeader}>
          <button onClick={handleBackClick} style={styles.backButton}>
            ← Back
          </button>
          <div style={styles.categoryHeader}>
            <h1 style={styles.categoryTitle}>Error Loading Services</h1>
          </div>
        </div>
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>Error loading services: {error}</p>
          <div style={styles.errorButtons}>
            <button 
              style={styles.retryBtn}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
            <button 
              style={styles.backBtn}
              onClick={handleBackClick}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={styles.categoryServicesPage}>
        <div style={styles.pageHeader}>
          <button onClick={handleBackClick} style={styles.backButton}>
            ← Back
          </button>
          <div style={styles.categoryHeader}>
            <h1 style={styles.categoryTitle}>
              {categoryInfo?.name || categoryName} Chores
            </h1>
            <p style={styles.servicesCount}>
              {services.length} service{services.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>

        {services.length === 0 ? (
          <div style={styles.noServices}>
            <h3 style={styles.noServicesTitle}>No chores available in this category</h3>
            <p style={styles.noServicesText}>Check back later for new chores!</p>
          </div>
        ) : (
          <div style={styles.serviceDisplayList}>
            {services.map((service) => (
              <ServiceCard
                key={service._id}
                id={service._id}
                name={service.name}
                description={service.description}
                price={service.price}
                image={service.image}
                category={service.category}
                isActive={service.isActive}
                showActiveBadge={true}
                onServiceClick={handleServiceClick}
                onBookClick={handleBookClick}
              />
            ))}
          </div>
        )}
      </div>

    </>
  );
};

const styles = {
  categoryServicesPage: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  pageHeader: {
    marginBottom: '30px'
  },
  backButton: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    color: '#666',
    cursor: 'pointer',
    marginBottom: '20px',
    padding: '8px 12px',
    borderRadius: '5px',
    transition: 'all 0.3s ease'
  },
  categoryHeader: {
    textAlign: 'center'
  },
  categoryTitle: {
    fontSize: 'max(2.5vw, 24px)',
    fontWeight: '600',
    color: '#1a237e',
    margin: '0 0 10px 0'
  },
  servicesCount: {
    color: '#666',
    fontSize: '1.1rem',
    margin: '0'
  },
  serviceDisplayList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    marginTop: '30px',
    gap: '10px',
    rowGap: '20px',
    padding: '0 10px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    marginTop: '30px'
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
    padding: '40px 20px',
    marginTop: '30px'
  },
  errorText: {
    color: '#d32f2f',
    fontSize: '16px',
    marginBottom: '16px',
    margin: '0 0 16px 0',
    textAlign: 'center'
  },
  errorButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  retryBtn: {
    backgroundColor: '#1a237e',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.3s ease'
  },
  backBtn: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.3s ease'
  },
  noServices: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666'
  },
  noServicesTitle: {
    fontSize: '1.5rem',
    marginBottom: '15px',
    color: '#333',
    margin: '0 0 15px 0'
  },
  noServicesText: {
    margin: '0',
    fontSize: '16px'
  }
};

// Add CSS animations
if (!document.querySelector('#category-services-animations')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'category-services-animations';
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .back-button:hover {
      background-color: #f5f5f5;
      color: #333;
    }
    
    .retry-btn:hover {
      background-color: #303f9f !important;
    }
    
    .back-btn:hover {
      background-color: #5a6268 !important;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default CategoryServices;