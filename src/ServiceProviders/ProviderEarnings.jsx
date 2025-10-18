import { useState, useEffect } from "react";
import baseUrl from "../../server.js";

const ProviderEarnings = () => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  useEffect(() => {
    fetchEarnings(selectedPeriod);
  }, [selectedPeriod]);

  const fetchEarnings = async (period) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("providerToken");
      
      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const response = await fetch(`${baseUrl}/api/payments/provider-earnings?period=${period}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        setEarnings(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch earnings data");
      }
    } catch (err) {
      console.error("Error fetching earnings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `£${price.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading earnings data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Earnings</h2>
        <p>{error}</p>
        <button onClick={() => fetchEarnings(selectedPeriod)} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="earnings-container">
      <style>
        {`
          :root {
            --primary-color: #667eea;
            --success-color: #38a169;
            --danger-color: #e53e3e;
            --warning-color: #d69e2e;
            --info-color: #3182ce;
            --text-color: #2d3748;
            --text-muted: #718096;
            --bg-color: #fff;
            --card-bg: #ffffff;
            --border-color: #e2e8f0;
            --hover-color: #edf2f7;
          }

          .earnings-container {
            padding: 20px;
            background-color: var(--bg-color);
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }

          .earnings-header {
            margin-bottom: 30px;
          }

          .earnings-header h1 {
            color: var(--text-color);
            font-size: 28px;
            margin: 0 0 10px 0;
            font-weight: 600;
          }

          .earnings-header p {
            color: var(--text-muted);
            font-size: 16px;
            margin: 0;
          }

          .period-selector {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            flex-wrap: wrap;
          }

          .period-btn {
            padding: 10px 20px;
            border: 1px solid var(--border-color);
            background-color: var(--card-bg);
            color: var(--text-color);
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
          }

          .period-btn:hover {
            background-color: var(--hover-color);
          }

          .period-btn.active {
            background-color: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
          }

          .earnings-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }

          .stat-card {
            background: var(--card-bg);
            padding: 24px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .stat-card.highlight {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
          }

          .stat-card.highlight .stat-label {
            color: rgba(255, 255, 255, 0.9);
          }

          .stat-card.highlight .stat-number {
            color: white;
          }

          .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
            font-size: 24px;
          }


         
          .stat-number {
            font-size: 32px;
            font-weight: bold;
            color: var(--primary-color);
            margin-bottom: 8px;
          }

          .stat-label {
            color: var(--text-muted);
            font-size: 14px;
            font-weight: 500;
          }

          .bookings-section {
            background: var(--card-bg);
            border-radius: 8px;
            border: 1px solid var(--border-color);
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .section-header {
            padding: 20px;
            border-bottom: 1px solid var(--border-color);
            background-color: var(--bg-color);
          }

          .section-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-color);
            margin: 0;
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

          .booking-id {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: var(--text-muted);
            background-color: var(--hover-color);
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
          }

          .service-name {
            font-weight: 600;
            color: var(--text-color);
          }

          .price-tag {
            font-weight: 600;
            color: var(--text-color);
            font-size: 16px;
          }

          .payout-amount {
            font-weight: 700;
            color: var(--success-color);
            font-size: 16px;
          }

          .date-text {
            color: var(--text-muted);
            font-size: 14px;
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

          .mobile-bookings {
            display: none;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @media (max-width: 768px) {
            .earnings-container {
              padding: 15px;
            }

            .earnings-header h1 {
              font-size: 24px;
            }

            .earnings-header p {
              font-size: 14px;
            }

            .earnings-stats {
              grid-template-columns: 1fr;
            }

            .stat-number {
              font-size: 28px;
            }

            .period-selector {
              flex-direction: column;
            }

            .period-btn {
              width: 100%;
              text-align: center;
            }

            .bookings-table {
              display: none;
            }

            .mobile-bookings {
              display: flex;
              flex-direction: column;
              gap: 15px;
              padding: 15px;
            }

            .mobile-booking-card {
              background: var(--bg-color);
              border: 1px solid var(--border-color);
              border-radius: 8px;
              padding: 15px;
            }

            .mobile-booking-header {
              display: flex;
              justify-content: space-between;
              align-items: start;
              margin-bottom: 12px;
            }

            .mobile-booking-id {
              font-family: 'Courier New', monospace;
              font-size: 11px;
              color: var(--text-muted);
              background-color: var(--hover-color);
              padding: 4px 8px;
              border-radius: 4px;
            }

            .mobile-service-name {
              font-size: 16px;
              font-weight: 600;
              color: var(--text-color);
              margin-bottom: 12px;
            }

            .mobile-booking-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
            }

            .mobile-detail {
              display: flex;
              flex-direction: column;
              gap: 4px;
            }

            .mobile-detail-label {
              font-size: 12px;
              color: var(--text-muted);
              font-weight: 500;
            }

            .mobile-detail-value {
              font-size: 14px;
              color: var(--text-color);
              font-weight: 500;
            }

            .mobile-payout-amount {
              font-size: 16px;
              font-weight: 700;
              color: var(--success-color);
            }
          }
        `}
      </style>

      <div className="earnings-header">
        <h1>My Earnings</h1>
        <p>Track your earnings from completed bookings</p>
      </div>

      <div className="period-selector">
        <button 
          className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('week')}
        >
          This Week
        </button>
        <button 
          className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('month')}
        >
          This Month
        </button>
        <button 
          className={`period-btn ${selectedPeriod === 'year' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('year')}
        >
          This Year
        </button>
        <button 
          className={`period-btn ${selectedPeriod === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('all')}
        >
          All Time
        </button>
      </div>

      <div className="earnings-stats">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-number">{formatPrice(earnings?.totalEarnings || 0)}</div>
          <div className="stat-label">Total Earnings</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-number">{earnings?.bookingCount || 0}</div>
          <div className="stat-label">Completed Bookings</div>
        </div>
    
      </div>

      <div className="bookings-section">
        <div className="section-header">
          <h2 className="section-title">Earnings Breakdown</h2>
        </div>
        
        {!earnings?.bookings || earnings.bookings.length === 0 ? (
          <div className="no-bookings">
            <h3>No Earnings Data</h3>
            <p>You haven't earned anything in this period yet.</p>
          </div>
        ) : (
          <>
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Service</th>
                  <th>Total Price</th>
                  <th>Your Payout</th>
                  <th>Completion Date</th>
                  <th>Payout Date</th>
                </tr>
              </thead>
              <tbody>
                {earnings.bookings.map((booking, index) => (
                  <tr key={index}>
                    <td>
                      <span className="booking-id">{booking.bookingId}</span>
                    </td>
                    <td>
                      <span className="service-name">{booking.serviceName}</span>
                    </td>
                    <td>
                      <span className="price-tag">{formatPrice(booking.totalPrice)}</span>
                    </td>
                    <td>
                      <span className="payout-amount">{formatPrice(booking.payoutAmount)}</span>
                    </td>
                    <td>
                      <span className="date-text">{formatDate(booking.completionDate)}</span>
                    </td>
                    <td>
                      <span className="date-text">{formatDate(booking.payoutDate)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mobile-bookings">
              {earnings.bookings.map((booking, index) => (
                <div key={index} className="mobile-booking-card">
                  <div className="mobile-booking-header">
                    <span className="mobile-booking-id">{booking.bookingId}</span>
                  </div>
                  <div className="mobile-service-name">{booking.serviceName}</div>
                  <div className="mobile-booking-details">
                    <div className="mobile-detail">
                      <span className="mobile-detail-label">Total Price</span>
                      <span className="mobile-detail-value">{formatPrice(booking.totalPrice)}</span>
                    </div>
                    <div className="mobile-detail">
                      <span className="mobile-detail-label">Your Payout</span>
                      <span className="mobile-detail-value mobile-payout-amount">
                        {formatPrice(booking.payoutAmount)}
                      </span>
                    </div>
                    <div className="mobile-detail">
                      <span className="mobile-detail-label">Completion Date</span>
                      <span className="mobile-detail-value">{formatDate(booking.completionDate)}</span>
                    </div>
                    <div className="mobile-detail">
                      <span className="mobile-detail-label">Payout Date</span>
                      <span className="mobile-detail-value">{formatDate(booking.payoutDate)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProviderEarnings;