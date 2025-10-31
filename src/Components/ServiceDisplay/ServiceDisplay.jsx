import { useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { StoreContext } from "../context/storeContext";
import PropTypes from "prop-types";
import ServiceCard from "../../Components/ServiceCard";
import baseUrl from "../../../server.js";


const ServiceDisplay = ({ category }) => {
  const { service_list, loading, error } = useContext(StoreContext);
  const location = useLocation();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  
  // Search states
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [displayTitle, setDisplayTitle] = useState("Top services near you!");

  // Get search parameters from URL
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('query');
  const searchLocation = searchParams.get('location');

  // Function to search services
  const searchServices = async (query, location = '') => {
    setIsSearching(true);
    setSearchError(null);
    
    try {
      let url = `${baseUrl}/api/service/search?query=${encodeURIComponent(query)}`;
      if (location.trim()) {
        url += `&location=${encodeURIComponent(location)}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data);
        setDisplayTitle(`Search results for "${query}"${location ? ` in ${location}` : ''}`);
      } else {
        setSearchError('Failed to fetch search results');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Error searching services. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Effect to handle search when URL parameters change
  useEffect(() => {
    if (searchQuery) {
      searchServices(searchQuery, searchLocation || '');
    } else {
      setSearchResults([]);
      setDisplayTitle("Top Chores near you!");
    }
  }, [searchQuery, searchLocation]);

  const handleServiceClick = (serviceId) => {
    setSelectedServiceId(serviceId);
    setIsModalOpen(true);
  };

  const handleBookClick = (serviceId) => {
    setSelectedServiceId(serviceId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedServiceId(null);
  };

  // Determine which services to display
  const getServicesToDisplay = () => {
    if (searchQuery) {
      return searchResults;
    }
    
    if (category === "All") {
      return service_list;
    }
    
    return service_list.filter(item => item.category === category);
  };

  // Loading state
  if ((loading && !searchQuery) || isSearching) {
    return (
      <div style={styles.serviceDisplay} id="service-display">
        <h2 style={styles.title}>{displayTitle}</h2>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>
            {isSearching ? 'Searching services...' : 'Loading services...'}
          </p>
        </div>
      </div>
    );
  }

  if (!document.querySelector('#service-display-responsive')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'service-display-responsive';
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @media (max-width: 768px) {
      #service-display > div {
        display: grid !important;
        grid-template-columns: repeat(2, 1fr) !important; /* 2 columns on mobile */
      }
    }

    @media (max-width: 480px) {
      #service-display > div {
        grid-template-columns: repeat(2, 1fr) !important; /* Still 2 columns on very small */
      }
    }
  `;
  document.head.appendChild(styleSheet);
}


  // Error state
  if (error || searchError) {
    return (
      <div style={styles.serviceDisplay} id="service-display">
        <h2 style={styles.title}>{displayTitle}</h2>
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>
            {searchError || `Error loading services: ${error}`}
          </p>
          <button 
            style={styles.retryBtn}
            onClick={() => {
              if (searchQuery) {
                searchServices(searchQuery, searchLocation || '');
              } else {
                window.location.reload();
              }
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const servicesToDisplay = getServicesToDisplay();

  return (
    <>
      <div style={styles.serviceDisplay} id="service-display">
        <h2 style={styles.title}>{displayTitle}</h2>
        
        {/* Search info */}
        {searchQuery && (
          <div style={styles.searchInfo}>
            <p style={styles.searchInfoText}>
              {servicesToDisplay.length} service{servicesToDisplay.length !== 1 ? 's' : ''} found
              {searchLocation && ` in ${searchLocation}`}
            </p>
          </div>
        )}

        {/* Services Grid */}
        {servicesToDisplay.length > 0 ? (
          <div style={styles.serviceDisplayList}>
            {servicesToDisplay.map((item, index) => {
              // Handle different data structures (search results vs regular service list)
              const serviceData = {
                _id: item?._id,
                name: item?.name,
                description: item?.description,
                price: item?.price,
                image: item?.image,
                category: typeof item?.category === 'object' ? item?.category?.name : item?.category
              };

              return (
                <ServiceCard
                  key={serviceData._id || index}
                  id={serviceData._id}
                  name={serviceData.name}
                  description={serviceData.description}
                  price={serviceData.price}
                  image={serviceData.image}
                  category={serviceData.category}
                  onServiceClick={handleServiceClick}
                  onBookClick={handleBookClick}
                />
              );
            })}
          </div>
        ) : (
          <div style={styles.noResultsContainer}>
            <p style={styles.noResultsText}>
              {searchQuery 
                ? `No chores found for "${searchQuery}"${searchLocation ? ` in ${searchLocation}` : ''}`
                : "No chores available"
              }
            </p>
            {searchQuery && (
              <p style={styles.noResultsSuggestion}>
                Try searching for different keywords or check your spelling
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

const styles = {
  serviceDisplay: {
    textAlign: 'center',
    padding: '10px'
  },
  title: {
    fontSize: 'max(2.5vw, 24px)',
    fontWeight: '400', 
    color: 'black',
    margin: '0 0 20px 0'
  },
  searchInfo: {
    marginBottom: '20px'
  },
  searchInfoText: {
    color: '#666',
    fontSize: '16px',
    margin: '0'
  },
  serviceDisplayList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
    marginTop: '30px',
    gap: '10px',
    rowGap: '10px',
    padding: '0 20px'
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
    margin: '0 0 16px 0'
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
  noResultsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    marginTop: '30px'
  },
  noResultsText: {
    color: '#666',
    fontSize: '18px',
    marginBottom: '8px',
    margin: '0 0 8px 0'
  },
  noResultsSuggestion: {
    color: '#999',
    fontSize: '14px',
    margin: '0'
  }
};

// Add CSS animations for loading spinner
if (!document.querySelector('#service-display-animations')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'service-display-animations';
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .retry-btn:hover {
      background-color: #303f9f !important;
    }
  `;
  document.head.appendChild(styleSheet);
}

ServiceDisplay.propTypes = {
  category: PropTypes.string.isRequired,
};

export default ServiceDisplay;