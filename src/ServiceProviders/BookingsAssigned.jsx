import { useState, useEffect } from "react";
import baseUrl from "../../server.js";

const BookingsAssigned = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState({});
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Helper function to determine payout status
  const getPayoutStatus = (booking) => {
    if (booking.payoutStatus?.status === 'processed') {
      return 'paid';
    }
    if (booking.completionStatus?.providerMarkedCompleted && booking.completionStatus?.customerConfirmed) {
      return 'paid';
    }
    return 'pending';
  };

  useEffect(() => {
    const fetchBookings = async (page = 1) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("providerToken");
        
        if (!token) {
          setError("Authentication required. Please login again.");
          return;
        }

        const response = await fetch(`${baseUrl}/api/booking/provider/assigned?page=${page}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        
        if (data.success && data.data) {
          const sortedBookings = data.data.sort((a, b) => {
            const aCanTakeAction = canTakeAction(a);
            const bCanTakeAction = canTakeAction(b);
            if (aCanTakeAction && !bCanTakeAction) return -1;
            if (!aCanTakeAction && bCanTakeAction) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          }).map(booking => ({
            ...booking,
            payoutStatus: {
              ...booking.payoutStatus,
              status: getPayoutStatus(booking)
            }
          }));
          setBookings(sortedBookings);
          setPagination(data.pagination || {});
          setCurrentPage(page);
        } else {
          throw new Error(data.message || "Failed to fetch assigned bookings");
        }
      } catch (err) {
        console.error("Error fetching assigned bookings:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= (pagination.totalPages || 1)) {
      setCurrentPage(page);
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    setActionLoading(prev => ({ ...prev, [bookingId]: 'accepting' }));
    
    try {
      const token = localStorage.getItem("providerToken");
      
      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      const response = await fetch(`${baseUrl}/api/booking/provider/bookings/accept-booking`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.bookingId === bookingId 
              ? { ...booking, assignmentStatus: 'accepted', status: 'confirmed' }
              : booking
          ).sort((a, b) => {
            const aCanTakeAction = canTakeAction(a);
            const bCanTakeAction = canTakeAction(b);
            if (aCanTakeAction && !bCanTakeAction) return -1;
            if (!aCanTakeAction && bCanTakeAction) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          })
        );
        
        alert("Booking accepted successfully!");
      } else {
        throw new Error(data.message || "Failed to accept booking");
      }
    } catch (err) {
      console.error("Error accepting booking:", err);
      alert(`Error accepting booking: ${err.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: null }));
    }
  };

  const handleRejectBooking = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }

    setActionLoading(prev => ({ ...prev, [selectedBookingId]: 'rejecting' }));
    
    try {
      const token = localStorage.getItem("providerToken");
      
      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      const response = await fetch(`${baseUrl}/api/booking/provider/bookings/reject-booking`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          bookingId: selectedBookingId,
          rejectionReason 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setBookings(prevBookings => 
          prevBookings.filter(booking => booking.bookingId !== selectedBookingId)
            .sort((a, b) => {
              const aCanTakeAction = canTakeAction(a);
              const bCanTakeAction = canTakeAction(b);
              if (aCanTakeAction && !bCanTakeAction) return -1;
              if (!aCanTakeAction && bCanTakeAction) return 1;
              return new Date(b.createdAt) - new Date(a.createdAt);
            })
        );
        
        alert("Booking rejected successfully!");
        
        setShowRejectModal(false);
        setSelectedBookingId(null);
        setRejectionReason("");
      } else {
        throw new Error(data.message || "Failed to reject booking");
      }
    } catch (err) {
      console.error("Error rejecting booking:", err);
      alert(`Error rejecting booking: ${err.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedBookingId]: null }));
    }
  };

  const handleMarkBookingCompleted = async (bookingId) => {
    setActionLoading(prev => ({ ...prev, [bookingId]: 'completing' }));
    
    try {
      const token = localStorage.getItem("providerToken");
      
      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      const response = await fetch(`${baseUrl}/api/booking/provider/bookings/complete`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.bookingId === bookingId 
              ? { 
                  ...booking, 
                  status: 'completed',
                  completionStatus: {
                    ...booking.completionStatus,
                    providerMarkedCompleted: true,
                    completionDate: new Date().toISOString()
                  },
                  payoutStatus: {
                    ...booking.payoutStatus,
                    status: getPayoutStatus(booking)
                  }
                }
              : booking
          ).sort((a, b) => {
            const aCanTakeAction = canTakeAction(a);
            const bCanTakeAction = canTakeAction(b);
            if (aCanTakeAction && !bCanTakeAction) return -1;
            if (!aCanTakeAction && bCanTakeAction) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          })
        );
        
        alert("Booking marked as completed successfully!");
      } else {
        throw new Error(data.message || "Failed to mark booking as completed");
      }
    } catch (err) {
      console.error("Error marking booking as completed:", err);
      alert(`Error marking booking as completed: ${err.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: null }));
    }
  };

  const openRejectModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedBookingId(null);
    setRejectionReason("");
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

  const formatServiceLocation = (location) => {
    if (!location) {
      return 'Location Not Provided';
    }
    if (typeof location === 'string') {
      return location;
    }
    if (typeof location === 'object' && location.type === 'customer_location') {
      return 'Customer Location';
    }
    if (typeof location === 'object' && location.address && location.city && location.postalCode) {
      return `${location.address}, ${location.city}, ${location.postalCode}`;
    }
    console.warn('Invalid serviceLocation format:', location);
    return 'Invalid Location Data';
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      case 'paid':
        return 'status-paid';
      default:
        return 'status-pending';
    }
  };

  const canTakeAction = (booking) => {
    return booking.assignmentStatus !== 'accepted' && booking.status !== 'completed' && booking.status !== 'cancelled';
  };

  const canMarkComplete = (booking) => {
    return booking.assignmentStatus === 'accepted' && booking.status !== 'completed' && booking.status !== 'cancelled';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading assigned bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Assigned Bookings</h2>
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
      --paid-color: #2b6cb0;
      --text-color: #2d3748;
      --text-muted: #718096;
      --bg-color: #fff;
      --card-bg: #ffffff;
      --border-color: #e2e8f0;
      --hover-color: #edf2f7;
    }

    .bookings-container {
      padding: 20px;
      background-color: var(--bg-color);
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 100%;
      overflow-x: auto;
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
      table-layout: auto;
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
      white-space: nowrap;
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

    .service-info, .customer-details {
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

    .service-details, .customer-details {
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
      display: inline-block;
      text-align: center;
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

    .status-paid {
      background-color: #bee3f8;
      color: var(--paid-color);
    }

    .actions-container {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .action-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 120px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    .action-btn:disabled {
      background-color: #cbd5e0;
      cursor: not-allowed;
    }

    .accept-btn {
      background-color: var(--success-color);
      color: white;
    }

    .accept-btn:hover:not(:disabled) {
      background-color: #2f855a;
      animation: pulse 0.5s ease-in-out;
    }

    .reject-btn {
      background-color: var(--danger-color);
      color: white;
    }

    .reject-btn:hover:not(:disabled) {
      background-color: #c53030;
      animation: pulse 0.5s ease-in-out;
    }

    .complete-btn {
      background-color: var(--info-color);
      color: white;
    }

    .complete-btn:hover:not(:disabled) {
      background-color: #2b6cb0;
      animation: pulse 0.5s ease-in-out;
    }

    .success-feedback {
      background-color: var(--success-color);
      animation: pulse 0.5s ease-in-out;
    }

    .error-feedback {
      background-color: var(--danger-color);
      animation: shake 0.5s ease-in-out;
    }

    .accepted-badge {
      background-color: #c6f6d5;
      color: var(--success-color);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
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

    .mini-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
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

    .pagination-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      border-top: 1px solid var(--border-color);
      background: var(--card-bg);
      font-size: 14px;
      color: var(--text-muted);
    }

    .pagination-buttons {
      display: flex;
      gap: 8px;
    }

    .pagination-btn {
      padding: 8px 16px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: var(--bg-color);
      color: var(--text-color);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .pagination-btn:hover:not(:disabled) {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    .pagination-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .pagination-btn.active {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
      font-weight: 600;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: var(--card-bg);
      border-radius: 8px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .modal-header {
      margin-bottom: 16px;
    }

    .modal-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-color);
      margin: 0;
    }

    .modal-body {
      margin-bottom: 24px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: var(--text-color);
      font-size: 14px;
    }

    .form-textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      min-height: 80px;
    }

    .form-textarea:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .modal-footer {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .modal-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .modal-btn-cancel {
      background-color: var(--bg-color);
      color: var(--text-color);
      border: 1px solid var(--border-color);
    }

    .modal-btn-cancel:hover:not(:disabled) {
      background-color: var(--hover-color);
    }

    .modal-btn-primary {
      background-color: var(--danger-color);
      color: white;
    }

    .modal-btn-primary:hover:not(:disabled) {
      background-color: #c53030;
      animation: pulse 0.5s ease-in-out;
    }

    .modal-btn:disabled {
      background-color: #cbd5e0;
      cursor: not-allowed;
    }

    .mobile-bookings {
      display: none;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
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

    @media (max-width: 1200px) {
      .bookings-stats {
        flex-wrap: wrap;
        gap: 15px;
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

      .service-info, .customer-details {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
      }

      .service-description {
        max-width: 150px;
      }

      .actions-container {
        flex-direction: column;
        gap: 10px;
      }

      .action-btn {
        min-width: 100px;
        padding: 6px 12px;
        font-size: 12px;
      }
    }

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

      .mobile-actions-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .mobile-action-btn {
        width: 100%;
        padding: 8px;
        font-size: 12px;
        text-align: center;
        min-width: unset;
      }

      .mobile-accepted-badge {
        font-size: 10px;
        padding: 3px 8px;
        border-radius: 12px;
        text-align: center;
      }

      .mobile-no-actions {
        font-size: 12px;
        color: var(--text-muted);
        text-align: center;
        padding: 8px;
      }

      .modal-content {
        width: 95%;
        padding: 16px;
      }

      .modal-title {
        font-size: 16px;
      }

      .form-label {
        font-size: 12px;
      }

      .form-textarea {
        font-size: 12px;
        padding: 8px;
        min-height: 60px;
      }

      .modal-btn {
        font-size: 12px;
        padding: 6px 12px;
      }

      .pagination-controls {
        flex-direction: column;
        gap: 10px;
        padding: 10px 15px;
      }

      .pagination-buttons {
        flex-wrap: wrap;
        justify-content: center;
      }

      .pagination-btn {
        padding: 6px 12px;
        font-size: 12px;
      }
    }
  `}
</style>

      <div className="bookings-header">
        <h1>Assigned Bookings</h1>
        <p>View all your assigned bookings and take action</p>
      </div>

      <div className="bookings-stats">
        <div className="stat-card">
          <div className="stat-number">{pagination.totalBookings || bookings.length}</div>
          <div className="stat-label">Total Assigned Bookings</div>
        </div>
      </div>

      <div className="table-container">
        {bookings.length === 0 ? (
          <div className="no-bookings">
            <h3>No Assigned Bookings Found</h3>
            <p>You don't have any assigned bookings yet.</p>
          </div>
        ) : (
          <>
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Customer</th>
                  <th>Date & Time</th>
                  <th>Duration</th>
                  <th>Total Price</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Payout Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
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
                      <div className="customer-details">
                        <div className="service-name">{booking.customerDetails.name}</div>
                        <div className="service-description">{booking.customerDetails.email}</div>
                        <div className="service-description">{booking.customerDetails.phone}</div>
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
                      <div className="service-description">{formatServiceLocation(booking.serviceLocation)}</div>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusColor(booking.payoutStatus.status)}`}>
                        {booking.payoutStatus.status}
                      </span>
                    </td>
                    <td>
                      {booking.status === 'completed' ? (
                        <span className="status-badge status-completed">Completed</span>
                      ) : booking.assignmentStatus === 'accepted' ? (
                        canMarkComplete(booking) ? (
                          <div className="actions-container">
                            <button
                              className="action-btn complete-btn"
                              onClick={() => handleMarkBookingCompleted(booking.bookingId)}
                              disabled={actionLoading[booking.bookingId] === 'completing'}
                            >
                              {actionLoading[booking.bookingId] === 'completing' ? (
                                <div className="mini-spinner"></div>
                              ) : null}
                              {actionLoading[booking.bookingId] === 'completing' ? 'Completing...' : 'Mark as Completed'}
                            </button>
                          </div>
                        ) : (
                          <span className="accepted-badge">Accepted</span>
                        )
                      ) : canTakeAction(booking) ? (
                        <div className="actions-container">
                          <button
                            className="action-btn accept-btn"
                            onClick={() => handleAcceptBooking(booking.bookingId)}
                            disabled={actionLoading[booking.bookingId] === 'accepting'}
                          >
                            {actionLoading[booking.bookingId] === 'accepting' ? (
                              <div className="mini-spinner"></div>
                            ) : null}
                            {actionLoading[booking.bookingId] === 'accepting' ? 'Accepting...' : 'Accept'}
                          </button>
                          <button
                            className="action-btn reject-btn"
                            onClick={() => openRejectModal(booking.bookingId)}
                            disabled={actionLoading[booking.bookingId] === 'rejecting'}
                          >
                            {actionLoading[booking.bookingId] === 'rejecting' ? (
                              <div className="mini-spinner"></div>
                            ) : null}
                            {actionLoading[booking.bookingId] === 'rejecting' ? 'Rejecting...' : 'Reject'}
                          </button>
                        </div>
                      ) : (
                        <span className="service-description">No actions available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mobile-bookings">
              {bookings.map((booking) => (
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
                      <div className="mobile-detail-label">Customer</div>
                      <div className="mobile-detail-value">
                        {booking.customerDetails.name}<br />
                        {booking.customerDetails.email}<br />
                        {booking.customerDetails.phone}
                      </div>
                    </div>
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
                      <div className="mobile-detail-label">Location</div>
                      <div className="mobile-detail-value">{formatServiceLocation(booking.serviceLocation)}</div>
                    </div>
                    <div>
                      <div className="mobile-detail-label">Status</div>
                      <div className="mobile-detail-value">
                        <span className={`mobile-status-badge ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="mobile-detail-label">Payout Status</div>
                      <div className="mobile-detail-value">
                        <span className={`mobile-status-badge ${getStatusColor(booking.payoutStatus.status)}`}>
                          {booking.payoutStatus.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mobile-actions-container">
                    {booking.status === 'completed' ? (
                      <span className="mobile-status-badge status-completed">Completed</span>
                    ) : booking.assignmentStatus === 'accepted' ? (
                      canMarkComplete(booking) ? (
                        <button
                          className="mobile-action-btn action-btn complete-btn"
                          onClick={() => handleMarkBookingCompleted(booking.bookingId)}
                          disabled={actionLoading[booking.bookingId] === 'completing'}
                        >
                          {actionLoading[booking.bookingId] === 'completing' ? (
                            <div className="mini-spinner"></div>
                          ) : null}
                          {actionLoading[booking.bookingId] === 'completing' ? 'Completing...' : 'Mark as Completed'}
                        </button>
                      ) : (
                        <span className="mobile-accepted-badge accepted-badge">Accepted</span>
                      )
                    ) : canTakeAction(booking) ? (
                      <>
                        <button
                          className="mobile-action-btn action-btn accept-btn"
                          onClick={() => handleAcceptBooking(booking.bookingId)}
                          disabled={actionLoading[booking.bookingId] === 'accepting'}
                        >
                          {actionLoading[booking.bookingId] === 'accepting' ? (
                            <div className="mini-spinner"></div>
                          ) : null}
                          {actionLoading[booking.bookingId] === 'accepting' ? 'Accepting...' : 'Accept'}
                        </button>
                        <button
                          className="mobile-action-btn action-btn reject-btn"
                          onClick={() => openRejectModal(booking.bookingId)}
                          disabled={actionLoading[booking.bookingId] === 'rejecting'}
                        >
                          {actionLoading[booking.bookingId] === 'rejecting' ? (
                            <div className="mini-spinner"></div>
                          ) : null}
                          {actionLoading[booking.bookingId] === 'rejecting' ? 'Rejecting...' : 'Reject'}
                        </button>
                      </>
                    ) : (
                      <span className="mobile-no-actions">No actions available</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {pagination && (
              <div className="pagination-controls">
                <div>
                  Showing page {pagination.currentPage || 1} of {pagination.totalPages || 1} 
                  ({pagination.totalBookings || bookings.length} total bookings)
                </div>
                <div className="pagination-buttons">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  {Array.from({ length: pagination.totalPages || 1 }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === (pagination.totalPages || 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showRejectModal && (
        <div className="modal-overlay" onClick={closeRejectModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Reject Booking</h3>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Rejection Reason *</label>
                <textarea
                  className="form-textarea"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this booking..."
                  maxLength={500}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn modal-btn-cancel"
                onClick={closeRejectModal}
                disabled={actionLoading[selectedBookingId] === 'rejecting'}
              >
                Cancel
              </button>
              <button
                className="modal-btn modal-btn-primary"
                onClick={handleRejectBooking}
                disabled={!rejectionReason.trim() || actionLoading[selectedBookingId] === 'rejecting'}
              >
                {actionLoading[selectedBookingId] === 'rejecting' ? (
                  <>
                    <div className="mini-spinner"></div>
                    Rejecting...
                  </>
                ) : (
                  'Reject Booking'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsAssigned;