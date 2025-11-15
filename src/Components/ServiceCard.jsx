import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import baseUrl from "../../server.js";

const ServiceCard = ({ 
  id, 
  name,
  price, 
  image,
  customStyles = {}
}) => {
  const navigate = useNavigate();
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GBP'
    }).format(price);
  };

  const handleCardClick = () => {
    // Navigate to service details page
    navigate(`/service/${id}`);
  };


  const mergedStyles = {
    ...defaultStyles,
    ...customStyles
  };

  return (
    <div 
      style={mergedStyles.serviceItem} 
      onClick={handleCardClick}
      className="service-card"
    >
      <div style={mergedStyles.cardContent}>
        {/* {image && (
          <div style={mergedStyles.imageSection}>
            <img 
              src={`${baseUrl}/images/${image}`}
              alt={name}
              style={mergedStyles.serviceImage}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )} */}
        
        <div style={mergedStyles.headerSection}>
          <h3 style={mergedStyles.serviceName}>{name}</h3>
          {/* {showActiveBadge && isActive && (
            <div style={mergedStyles.activeBadge}>●</div>
          )} */}
        </div>
        
        {/* {category && (
          <div style={mergedStyles.categoryTag}>
            {typeof category === 'object' ? category.name : category}
          </div>
        )} */}

        {/* {description && (
          <p style={mergedStyles.description}>
            {description.length > 60 ? `${description.substring(0, 60)}...` : description}
          </p>
        )} */}

        <div style={mergedStyles.priceSection}>
          <span style={mergedStyles.price}>{formatPrice(price)}</span>
          <span style={mergedStyles.priceUnit}>/hour</span>
        </div>
        
        <button 
          style={mergedStyles.bookButton}
          className="book-button"
          onClick={handleCardClick}
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

const defaultStyles = {
  serviceItem: {
    width: '100%',
    maxWidth: '165px',
    margin: 'auto',
    borderRadius: '10px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    overflow: 'hidden',
    position: 'relative'
  },
  cardContent: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '150px'
  },
  imageSection: {
    width: '100%',
    height: '90px',
    marginBottom: '12px',
    borderRadius: '8px',
    overflow: 'hidden',
    background: 'rgba(26, 35, 126, 0.05)'
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease'
  },
  headerSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  serviceName: {
    fontSize: '15px',
    fontWeight: '410',
    color: 'black',
    margin: '0',
    flex: '1',
    lineHeight: '1.3'
  },
  activeBadge: {
    color: '#10b981',
    fontSize: '16px',
    fontWeight: 'bold',
    marginLeft: '8px',
    animation: 'pulse 2s infinite'
  },
  categoryTag: {
    display: 'inline-flex',
    margin: '0 auto',
    backgroundColor: 'rgba(26, 35, 126, 0.08)',
    color: 'black',
    padding: '4px 10px',
    borderRadius: '15px',
    fontSize: '11px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    alignSelf: 'flex-start'
  },
  description: {
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.4',
    margin: '0 0 12px 0',
    flex: '1'
  },
  priceSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    marginBottom: '5px'
  },
  price: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'black'
  },
  priceUnit: {
    fontSize: '12px',
    color: '#666',
    fontWeight: '500'
  },
  bookButton: {
    background: 'rgb(78, 205, 196)',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    marginTop: '7px',
    letterSpacing: '0.3px',
    boxShadow: '0 3px 12px rgba(26, 35, 126, 0.3)'
  }
};

// Add CSS animations and hover effects
if (!document.querySelector('#service-card-animations')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'service-card-animations';
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
    
    .service-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 15px 40px rgba(26, 35, 126, 0.2) !important;
    }
    
    .service-card:hover img {
      transform: scale(1.05);
    }
    
    .service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, rgb(255, 140, 66));
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .service-card:hover::before {
      opacity: 1;
    }
    
    .book-button:hover {
      background: linear-gradient(135deg, rgb(255, 140, 66)) !important;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(26, 35, 126, 0.4) !important;
    }
    
    .book-button:active {
      transform: translateY(0);
    }
  `;
  document.head.appendChild(styleSheet);
}

ServiceCard.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  price: PropTypes.number.isRequired,
  image: PropTypes.string,
  category: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  isActive: PropTypes.bool,
  onBookClick: PropTypes.func,
  showActiveBadge: PropTypes.bool,
  customStyles: PropTypes.object
};

export default ServiceCard;