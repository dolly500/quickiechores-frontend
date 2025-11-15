import { useState, useEffect } from "react";
import baseUrl from "../../server.js";

const ProviderBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [availabilityStatus, setAvailabilityStatus] = useState({}); // Track availability loading status
  const [availabilityToggle, setAvailabilityToggle] = useState({}); // Track availability toggle state

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("providerToken");
        
        if (!token) {
          setError("Authentication required. Please login again.");
          return;
        }

        const response = await fetch(`${baseUrl}/api/booking/provider/bookings/paid`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        
        if (data.success && data.data) {
          setBookings(data.data);
          setPagination(data.pagination || {});
          
          // Initialize availability toggle state from booking data
          const initialToggleState = {};
          data.data.forEach(booking => {
            initialToggleState[booking.bookingId] = booking.isAvailable || false;
          });
          setAvailabilityToggle(initialToggleState);
        } else {
          throw new Error(data.message || "Failed to fetch bookings");
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const toggleAvailability = async (bookingId) => {
    try {
      setAvailabilityStatus(prev => ({ ...prev, [bookingId]: 'loading' }));
      const token = localStorage.getItem("providerToken");
      
      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const currentState = availabilityToggle[bookingId] || false;
      const newState = !currentState;

      const response = await fetch(`${baseUrl}/api/booking/provider/bookings/availability`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          bookingId, 
          isAvailable: newState 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAvailabilityToggle(prev => ({ ...prev, [bookingId]: newState }));
        setBookings(prevBookings => prevBookings.map(booking => 
          booking.bookingId === bookingId 
            ? { 
                ...booking, 
                isAvailable: newState,
                status: newState ? 'available' : 'confirmed'
              }
            : booking
        ));
        setAvailabilityStatus(prev => ({ ...prev, [bookingId]: 'success' }));
        setTimeout(() => {
          setAvailabilityStatus(prev => ({ ...prev, [bookingId]: null }));
        }, 2000);
      } else {
        throw new Error(data.message || "Failed to toggle availability");
      }
    } catch (err) {
      console.error("Error toggling availability:", err);
      setAvailabilityStatus(prev => ({ ...prev, [bookingId]: 'error' }));
      setError(err.message); // Display backend error message
      setTimeout(() => {
        setAvailabilityStatus(prev => ({ ...prev, [bookingId]: null }));
        setError(null); // Clear error after displaying
      }, 3000);
    }
  };

  
const formatBookingDate = (bookingDate) => {
    if (!bookingDate) return 'Date not set';
    
    // Handle date range
    if (bookingDate.isDateRange && bookingDate.dateRange) {
      const startDate = new Date(bookingDate.dateRange.startDate);
      const endDate = new Date(bookingDate.dateRange.endDate);
      
      const startFormatted = startDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      const endFormatted = endDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      
      return `${startFormatted} to ${endFormatted}`;
    }
    
    // Handle single date with singleDate property
    if (!bookingDate.isDateRange && bookingDate.singleDate) {
      const date = new Date(bookingDate.singleDate);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
    
    // Handle single date string (fallback for old format)
    if (typeof bookingDate === 'string') {
      const date = new Date(bookingDate);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
    
    return 'Invalid date format';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const formatPrice = (price) => {
    return `£${price.toFixed(2)}`;
  };

  const getStatusColor = (status, isAvailable) => {
    if (isAvailable) return 'status-available';
    
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const getDisplayStatus = (booking) => {
    const isAvailable = availabilityToggle[booking.bookingId];
    if (isAvailable) return 'Available';
    return booking.paymentStatus;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Bookings</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      <style>
        {`
          :root {
            --primary-color: #667eea;
            --success-color: #38a169;
            --danger-color: #e53e3e;
            --warning-color: #d69e2e;
            --info-color: #3182ce;
            --available-color: #2b6cb0;
            --text-color: #2d3748;
            --text-muted: #718096;
            --bg-color: #fff;
            --card-bg: #ffffff;
            --border-color: #e2e8f0;
            --hover-color: #edf2f7;
          }

          .status-available {
            background-color: #bee3f8;
            color: var(--available-color);
          }

          .action-button {
            padding: 8px 16px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
            min-width: 140px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .toggle-available-btn {
            background-color: var(--primary-color);
            color: white;
          }

          .toggle-available-btn:hover {
            background-color: #5a6fd8;
          }

          .toggle-available-btn.available {
            background-color: var(--success-color);
          }

          .toggle-available-btn.available:hover {
            background-color: #2f855a;
          }

          .toggle-available-btn:disabled {
            background-color: #cbd5e0;
            cursor: not-allowed;
          }

          .loading-btn {
            background-color: #cbd5e0;
            cursor: not-allowed;
          }

          .success-feedback {
            background-color: var(--success-color);
            animation: pulse 0.5s ease-in-out;
          }

          .error-feedback {
            background-color: var(--danger-color);
            animation: shake 0.5s ease-in-out;
          }

          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }

          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }

          .bookings-container {
            padding: 20px;
            background-color: var(--bg-color);
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }

          .bookings-header {
            margin-bottom: 30px;
          }

          .bookings-header h1 {
            color: var(--text-color);
            font-size: 28px;
            margin: 0 0 10px 0;
            font-weight: 600;
          }

          .bookings-header p {
            color: var(--text-muted);
            font-size: 16px;
            margin: 0;
          }

          .bookings-stats {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
          }

          .stat-card {
            background: var(--card-bg);
            padding: 20px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            flex: 1;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: var(--primary-color);
            margin-bottom: 5px;
          }

          .stat-label {
            color: var(--text-muted);
            font-size: 14px;
          }

          .table-container {
            background: var(--card-bg);
            border-radius: 8px;
            border: 1px solid var(--border-color);
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .bookings-table {
            width: 100%;
            border-collapse: collapse;
          }

          .bookings-table th {
            background-color: var(--bg-color);
            padding: 15px 20px;
            text-align: left;
            font-weight: 600;
            color: var(--text-color);
            border-bottom: 1px solid var(--border-color);
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .bookings-table td {
            padding: 15px 20px;
            border-bottom: 1px solid var(--border-color);
            color: var(--text-color);
            vertical-align: middle;
          }

          .bookings-table tr:hover {
            background-color: var(--hover-color);
          }

          .bookings-table tr:last-child td {
            border-bottom: none;
          }

          .service-info {
            display: flex;
            align-items: center;
            gap: 15px;
          }

          .service-image {
            width: 50px;
            height: 50px;
            border-radius: 8px;
            object-fit: cover;
            border: 1px solid var(--border-color);
          }

          .service-details {
            flex: 1;
          }

          .service-name {
            font-weight: 600;
            color: var(--text-color);
            margin-bottom: 2px;
          }

          .service-description {
            color: var(--text-muted);
            font-size: 14px;
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .time-slot {
            font-weight: 500;
            color: var(--text-color);
          }

          .duration {
            color: var(--text-muted);
            font-size: 14px;
            margin-top: 2px;
          }

          .price-tag {
            font-weight: 600;
            color: var(--success-color);
            font-size: 16px;
          }

          .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .status-confirmed {
            background-color: #c6f6d5;
            color: var(--success-color);
          }

          .status-pending {
            background-color: #fef5e7;
            color: var(--warning-color);
          }

          .status-completed {
            background-color: #bee3f8;
            color: var(--info-color);
          }

          .status-cancelled {
            background-color: #fed7d7;
            color: var(--danger-color);
          }

          .loading-container, .error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            background-color: var(--card-bg);
            border-radius: 8px;
            border: 1px solid var(--border-color);
          }

          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid var(--border-color);
            border-top: 4px solid var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }

          .error-container {
            color: var(--danger-color);
            text-align: center;
          }

          .retry-btn {
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 15px;
            font-size: 14px;
            transition: background-color 0.2s;
          }

          .retry-btn:hover {
            background-color: #5a6fd8;
          }

          .no-bookings {
            text-align: center;
            padding: 60px 20px;
            color: var(--text-muted);
          }

          .no-bookings h3 {
            margin-bottom: 10px;
            color: var(--text-color);
          }

          .pagination-info {
            background: var(--card-bg);
            padding: 15px 20px;
            border-top: 1px solid var(--border-color);
            color: var(--text-muted);
            font-size: 14px;
          }

          .mobile-bookings {
            display: none; /* Hide mobile layout by default */
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          /* Existing media queries */
          @media (max-width: 1200px) {
            .bookings-stats {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 768px) {
            .bookings-stats {
              flex-direction: column;
            }
            
            .bookings-table {
              font-size: 14px;
            }
            
            .bookings-table th,
            .bookings-table td {
              padding: 10px 15px;
            }
            
            .service-info {
              flex-direction: column;
              gap: 10px;
            }
            
            .service-description {
              max-width: 150px;
            }

            .action-button {
              min-width: 100px;
              padding: 6px 12px;
            }
          }

          /* Mobile-specific styles for responsiveness */
          @media (max-width: 600px) {
            .bookings-container {
              padding: 15px;
            }

            .bookings-header h1 {
              font-size: 24px;
            }

            .bookings-header p {
              font-size: 14px;
            }

            .bookings-stats {
              flex-direction: column;
              gap: 10px;
            }

            .stat-card {
              padding: 15px;
            }

            .stat-number {
              font-size: 20px;
            }

            .stat-label {
              font-size: 12px;
            }

            /* Hide table for mobile and show card layout */
            .bookings-table {
              display: none;
            }

            .mobile-bookings {
              display: flex;
              flex-direction: column;
              gap: 15px;
            }

            .mobile-booking-card {
              background: var(--card-bg);
              border: 1px solid var(--border-color);
              border-radius: 8px;
              padding: 15px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            .mobile-service-info {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 10px;
            }

            .mobile-service-image {
              width: 40px;
              height: 40px;
              border-radius: 6px;
              object-fit: cover;
              border: 1px solid var(--border-color);
            }

            .mobile-service-details {
              flex: 1;
            }

            .mobile-service-name {
              font-size: 14px;
              font-weight: 600;
              color: var(--text-color);
              margin-bottom: 2px;
            }

            .mobile-service-description {
              font-size: 12px;
              color: var(--text-muted);
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }

            .mobile-booking-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-bottom: 10px;
            }

            .mobile-detail-label {
              font-size: 12px;
              color: var(--text-muted);
              font-weight: 500;
            }

            .mobile-detail-value {
              font-size: 12px;
              color: var(--text-color);
              font-weight: 500;
            }

            .mobile-price-tag {
              font-size: 14px;
              font-weight: 600;
              color: var(--success-color);
            }

            .mobile-status-badge {
              font-size: 10px;
              padding: 3px 8px;
              border-radius: 12px;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .mobile-action-button {
              width: 100%;
              padding: 8px;
              font-size: 12px;
              min-width: unset;
              text-align: center;
            }

            .pagination-info {
              font-size: 12px;
              padding: 10px 15px;
              text-align: center;
            }
          }
        `}
      </style>

      <div className="bookings-header">
        <h1>My Bookings</h1>
        <p>Manage and view all your confirmed paid bookings</p>
      </div>

      <div className="bookings-stats">
        <div className="stat-card">
          <div className="stat-number">{bookings.length}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {Object.values(availabilityToggle).filter(Boolean).length}
          </div>
          <div className="stat-label">Available</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {bookings.length - Object.values(availabilityToggle).filter(Boolean).length}
          </div>
          <div className="stat-label">Not Available</div>
        </div>
      </div>

      <div className="table-container">
        {bookings.length === 0 ? (
          <div className="no-bookings">
            <h3>No Bookings Found</h3>
            <p>You don't have any paid bookings yet.</p>
          </div>
        ) : (
          <>
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Duration</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const isAvailable = availabilityToggle[booking.bookingId];
                  const loadingState = availabilityStatus[booking.bookingId];
                  
                  return (
                    <tr key={booking._id}>
                      <td>
                        <div className="service-info">
                          {booking.service ? (
                            <>
                              <img 
                                src={booking.service.image ? `${baseUrl}/Uploads/${booking.service.image}` : '/placeholder-service.png'} 
                                alt={booking.service.name}
                                className="service-image"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjdGQUZDIi8+CjxwYXRoIGQ9Ik0yNSAxNUMxOS40NzcgMTUgMTUgMTkuNDc3IDE1IDI1QzE1IDMwLjUyMyAxOS40NzcgMzUgMjUgMzVDMzAuNTIzIDM1IDM1IDMwLjUyMyAzNSAyNUMzNSAxOS40NzcgMzAuNTIzIDE1IDI1IDE1WiIgZmlsbD0iI0U5RDhGRCIvPgo8L3N2Zz4K';
                                }}
                              />
                              <div className="service-details">
                                <div className="service-name">{booking.service.name}</div>
                                <div className="service-description" title={booking.service.description}>
                                  {booking.service.description}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="service-details">
                              <div className="service-name">Service Unavailable</div>
                              <div className="service-description">Service details not available</div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="time-slot">
                          {formatBookingDate(booking.bookingDate)}
                        </div>
                        <div className="duration">
                          {formatTime(booking.timeSlot.startTime)} - {formatTime(booking.timeSlot.endTime)}
                        </div>
                      </td>
                      <td>
                        <div className="duration">{booking.duration} mins</div>
                      </td>
                      <td>
                        <span className="price-tag">{formatPrice(booking.totalPrice)}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusColor(booking.status, isAvailable)}`}>
                          {getDisplayStatus(booking)}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`action-button toggle-available-btn ${isAvailable ? 'available' : ''} ${
                            loadingState === 'loading' ? 'loading-btn' : 
                            loadingState === 'success' ? 'success-feedback' :
                            loadingState === 'error' ? 'error-feedback' : ''
                          }`}
                          onClick={() => toggleAvailability(booking.bookingId)}
                          disabled={loadingState === 'loading' || booking.isAssigned}
                        >
                          {loadingState === 'loading' ? 'Updating...' :
                           loadingState === 'success' ? 'Updated!' :
                           loadingState === 'error' ? 'Try Again' :
                           isAvailable ? 
                             (booking.isAssignedToMe ? 'Booking assigned to you' : 'Mark Unavailable') :
                             (booking.isAssigned && !booking.isAssignedToMe ? 'Booking assigned to another provider' : 'Mark Available')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mobile-bookings">
              {bookings.map((booking) => {
                const isAvailable = availabilityToggle[booking.bookingId];
                const loadingState = availabilityStatus[booking.bookingId];
                
                return (
                  <div key={booking._id} className="mobile-booking-card">
                    <div className="mobile-service-info">
                      {booking.service ? (
                        <>
                          <img 
                            src={booking.service.image ? `${baseUrl}/Uploads/${booking.service.image}` : '/placeholder-service.png'} 
                            alt={booking.service.name}
                            className="mobile-service-image"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjdGQUZDIi8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODEgMTIgMTIgMTUuNTgxIDEyIDIwQzEyIDI0LjQxOSAxNS41ODEgMjggMjAgMjhDMjQuNDE5IDI4IDI4IDI0LjQxOSAyOCAyMEMyOCAxNS41ODEgMjQuNDE5IDEyIDIwIDEyWiIgZmlsbD0iI0U5RDhGRCIvPgo8L3N2Zz4K';
                            }}
                          />
                          <div className="mobile-service-details">
                            <div className="mobile-service-name">{booking.service.name}</div>
                            <div className="mobile-service-description" title={booking.service.description}>
                              {booking.service.description}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="mobile-service-details">
                          <div className="mobile-service-name">Service Unavailable</div>
                          <div className="mobile-service-description">Service details not available</div>
                        </div>
                      )}
                    </div>
                    <div className="mobile-booking-details">
                      <div>
                        <div className="mobile-detail-label">Date & Time</div>
                        <div className="mobile-detail-value">
                          {formatBookingDate(booking.bookingDate)}<br />
                          {formatTime(booking.timeSlot.startTime)} - {formatTime(booking.timeSlot.endTime)}
                        </div>
                      </div>
                      <div>
                        <div className="mobile-detail-label">Duration</div>
                        <div className="mobile-detail-value">{booking.duration} mins</div>
                      </div>
                      <div>
                        <div className="mobile-detail-label">Total Price</div>
                        <div className="mobile-detail-value mobile-price-tag">{formatPrice(booking.totalPrice)}</div>
                      </div>
                      <div>
                        <div className="mobile-detail-label">Status</div>
                        <div className="mobile-detail-value">
                          <span className={`mobile-status-badge ${getStatusColor(booking.status, isAvailable)}`}>
                            {getDisplayStatus(booking)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      className={`mobile-action-button action-button toggle-available-btn ${isAvailable ? 'available' : ''} ${
                        loadingState === 'loading' ? 'loading-btn' : 
                        loadingState === 'success' ? 'success-feedback' :
                        loadingState === 'error' ? 'error-feedback' : ''
                      }`}
                      onClick={() => toggleAvailability(booking.bookingId)}
                      disabled={loadingState === 'loading' || booking.isAssigned}
                    >
                      {loadingState === 'loading' ? 'Updating...' :
                       loadingState === 'success' ? 'Updated!' :
                       loadingState === 'error' ? 'Try Again' :
                       isAvailable ? 
                         (booking.isAssignedToMe ? 'Booking assigned to you' : 'Mark Unavailable') :
                         (booking.isAssigned && !booking.isAssignedToMe ? 'Booking assigned to another provider' : 'Mark Available')}
                    </button>
                  </div>
                );
              })}
            </div>
            
            {pagination && (
              <div className="pagination-info">
                Showing page {pagination.currentPage || 1} of {pagination.totalPages || 1} 
                ({pagination.totalBookings || bookings.length} total bookings)
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProviderBookings;