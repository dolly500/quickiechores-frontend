import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, MapPin, Filter, SortAsc } from 'lucide-react';
import ServiceCard from '../../Components/ServiceCard';
import baseUrl from '../../../server.js';


const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get search parameters from URL
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get('query') || '';
  const initialLocation = searchParams.get('location') || '';

  // States
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchLocation, setSearchLocation] = useState(initialLocation);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  // Search function
  const searchServices = async (query, loc = '', page = 1) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let url = `${baseUrl}/api/service/search?query=${encodeURIComponent(query)}&page=${page}`;
      if (loc.trim()) {
        url += `&location=${encodeURIComponent(loc)}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setServices(data.data);
        setPagination(data.pagination);
      } else {
        setError('Failed to fetch search results');
        setServices([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Error searching services. Please try again.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect to search when component mounts or URL changes
  useEffect(() => {
    if (initialQuery) {
      searchServices(initialQuery, initialLocation);
    }
  }, [initialQuery, initialLocation]);

  // Handle new search
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      const newSearchParams = new URLSearchParams();
      newSearchParams.set('query', searchQuery.trim());
      if (searchLocation.trim()) {
        newSearchParams.set('location', searchLocation.trim());
      }
      
      // Update URL
      navigate(`/services?${newSearchParams.toString()}`, { replace: true });
      
      // Perform search
      searchServices(searchQuery.trim(), searchLocation.trim());
    }
  };

  // Modal handlers
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

  // Quick search tags
  const popularSearches = ['cleaning', 'plumbing', 'electrical', 'handyman', 'painting', 'gardening'];

  const handleQuickSearch = (query) => {
    setSearchQuery(query);
    navigate(`/services?query=${encodeURIComponent(query)}`);
    searchServices(query, searchLocation);
  };

  return (
    <div style={styles.container}>
      {/* Search Header */}
      <div style={styles.searchHeader}>
        <div style={styles.searchContainer}>
          <h1 style={styles.title}>Find Your Perfect Chores</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <div style={styles.searchBox}>
              <div style={styles.inputGroup}>
                <Search style={styles.icon} size={20} />
                <input 
                  type="text" 
                  placeholder="What service do you need?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              
              <div style={styles.inputGroup}>
                <MapPin style={styles.icon} size={20} />
                <input 
                  type="text" 
                  placeholder="Enter location"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  style={styles.locationInput}
                />
              </div>
              
              <button type="submit" style={styles.searchBtn} disabled={loading}>
                <Search size={18} />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Popular Searches */}
          <div style={styles.popularSearches}>
            <span style={styles.popularLabel}>Popular searches:</span>
            <div style={styles.searchTags}>
              {popularSearches.map((tag) => (
                <button
                  key={tag}
                  style={styles.searchTag}
                  onClick={() => handleQuickSearch(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div style={styles.resultsSection}>
        {/* Results Header */}
        {(searchQuery || services.length > 0) && (
          <div style={styles.resultsHeader}>
            <div style={styles.resultsInfo}>
              <h2 style={styles.resultsTitle}>
                {searchQuery ? `Results for "${searchQuery}"` : 'Search Results'}
                {searchLocation && ` in ${searchLocation}`}
              </h2>
              {pagination && (
                <p style={styles.resultsCount}>
                  {pagination.totalServices} service{pagination.totalServices !== 1 ? 's' : ''} found
                </p>
              )}
            </div>
            
            {/* Filters - placeholder for future implementation */}
            <div style={styles.filterSection}>
              <button style={styles.filterBtn}>
                <Filter size={16} />
                Filters
              </button>
              <button style={styles.sortBtn}>
                <SortAsc size={16} />
                Sort
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <p style={styles.loadingText}>Searching for services...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>{error}</p>
            <button 
              style={styles.retryBtn}
              onClick={() => searchServices(searchQuery, searchLocation)}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results Grid */}
        {!loading && !error && services.length > 0 && (
          <div style={styles.servicesGrid}>
            {services.map((service, index) => (
              <ServiceCard
                key={service._id || index}
                id={service._id}
                name={service.name}
                description={service.description}
                price={service.price}
                image={service.image}
                category={typeof service.category === 'object' ? service.category.name : service.category}
                onServiceClick={handleServiceClick}
                onBookClick={handleBookClick}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && searchQuery && services.length === 0 && (
          <div style={styles.noResultsContainer}>
            <div style={styles.noResultsIcon}>🔍</div>
            <h3 style={styles.noResultsTitle}>No services found</h3>
            <p style={styles.noResultsText}>
              We couldn't find any services matching "{searchQuery}"
              {searchLocation && ` in ${searchLocation}`}
            </p>
            <div style={styles.suggestions}>
              <p style={styles.suggestionsTitle}>Try:</p>
              <ul style={styles.suggestionsList}>
                <li>Checking your spelling</li>
                <li>Using more general terms</li>
                <li>Removing the location filter</li>
                <li>Browsing popular categories instead</li>
              </ul>
            </div>
            
            <div style={styles.popularRetry}>
              <p style={styles.popularRetryText}>Or try these popular services:</p>
              <div style={styles.searchTags}>
                {popularSearches.slice(0, 4).map((tag) => (
                  <button
                    key={tag}
                    style={styles.searchTag}
                    onClick={() => handleQuickSearch(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
  },
  searchHeader: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '3rem 2rem',
    color: 'white'
  },
  searchContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '2rem',
    margin: '0 0 2rem 0'
  },
  searchForm: {
    marginBottom: '1.5rem'
  },
  searchBox: {
    background: 'white',
    borderRadius: '12px',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    marginBottom: '1rem'
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: '1',
    padding: '0.75rem'
  },
  icon: {
    color: '#9ca3af',
    flexShrink: 0
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
    width: '100%',
    background: 'transparent',
    color: '#374151'
  },
  locationInput: {
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
    width: '100%',
    background: 'transparent',
    color: '#374151',
    borderLeft: '1px solid #e5e7eb',
    paddingLeft: '0.75rem'
  },
  searchBtn: {
    background: 'linear-gradient(135deg, #e91e63 0%, #ad1457 100%)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap'
  },
  popularSearches: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  popularLabel: {
    fontSize: '0.9rem',
    opacity: 0.9
  },
  searchTags: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  searchTag: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  resultsSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem'
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  resultsInfo: {
    flex: 1
  },
  resultsTitle: {
    fontSize: '1.8rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 0.5rem 0'
  },
  resultsCount: {
    color: '#6b7280',
    fontSize: '1rem',
    margin: 0
  },
  filterSection: {
    display: 'flex',
    gap: '0.75rem'
  },
  filterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1rem',
    border: '1px solid #d1d5db',
    background: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#374151'
  },
  sortBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1rem',
    border: '1px solid #d1d5db',
    background: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#374151'
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginTop: '1rem'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    textAlign: 'center'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
  loadingText: {
    color: '#6b7280',
    fontSize: '1rem',
    margin: 0
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    textAlign: 'center'
  },
  errorText: {
    color: '#ef4444',
    fontSize: '1rem',
    marginBottom: '1rem',
    margin: '0 0 1rem 0'
  },
  retryBtn: {
    background: '#667eea',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  noResultsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    textAlign: 'center'
  },
  noResultsIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  noResultsTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.5rem',
    margin: '0 0 0.5rem 0'
  },
  noResultsText: {
    color: '#6b7280',
    fontSize: '1rem',
    marginBottom: '2rem',
    margin: '0 0 2rem 0'
  },
  suggestions: {
    background: '#f9fafb',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    textAlign: 'left',
    maxWidth: '400px'
  },
  suggestionsTitle: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.75rem',
    margin: '0 0 0.75rem 0'
  },
  suggestionsList: {
    margin: 0,
    paddingLeft: '1.2rem',
    color: '#6b7280'
  },
  popularRetry: {
    textAlign: 'center'
  },
  popularRetryText: {
    color: '#1f2937',
    fontWeight: '500',
    marginBottom: '1rem',
    margin: '0 0 1rem 0'
  }
};

// Add CSS animations
if (!document.querySelector('#search-results-animations')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'search-results-animations';
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .search-box {
        flex-direction: column !important;
        gap: 1rem !important;
      }
      
      .input-group {
        width: 100% !important;
      }
      
      .location-input {
        border-left: none !important;
        border-top: 1px solid #e5e7eb !important;
        padding-left: 0.75rem !important;
        padding-top: 0.75rem !important;
      }
      
      .search-btn {
        width: 100% !important;
        justify-content: center !important;
      }
      
      .results-header {
        flex-direction: column !important;
        align-items: flex-start !important;
      }
      
      .filter-section {
        width: 100% !important;
        justify-content: flex-start !important;
      }
    }
    
    .search-tag:hover {
      background: rgba(255, 255, 255, 0.3) !important;
    }
    
    .search-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(233, 30, 99, 0.3);
    }
    
    .filter-btn:hover, .sort-btn:hover {
      background: #f9fafb !important;
      border-color: #9ca3af !important;
    }
    
    .retry-btn:hover {
      background: #4f46e5 !important;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default SearchResults;