import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Components/context/storeContext';
import { Calendar, Clock, User, CreditCard, AlertCircle, RefreshCw, Filter, Search } from 'lucide-react';
import styled from 'styled-components';


const BookingHistory = () => {
  const { token, setToken, url } = useContext(StoreContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!token) {
      navigate('/auth?returnTo=' + encodeURIComponent(window.location.pathname));
      return;
    }
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${url}/api/booking/user`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.success) {
          setBookings(data.data);
          setFilteredBookings(data.data);
        } else {
          setError(data.message || 'Failed to fetch bookings');
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        if (error.response?.status === 401) {
          const newToken = await refreshToken();
          if (newToken) {
            try {
              const response = await fetch(`${url}/api/booking/user`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${newToken}`,
                  'Content-Type': 'application/json',
                },
              });
              const data = await response.json();
              if (data.success) {
                setBookings(data.data);
                setFilteredBookings(data.data);
              } else {
                setError(data.message || 'Failed to fetch bookings after token refresh');
              }
            } catch (retryError) {
              setError(retryError.response?.data?.message || 'Failed to fetch bookings after token refresh');   
            }
          } 
        } else {
          setError(error.message || 'Failed to fetch bookings. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [token, setToken, url, navigate]);

  const handleConfirmCompletion = async (bookingId) => {
    try {
      const response = await fetch(`${url}/api/booking/provider/bookings/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId }),
      });
      const data = await response.json();
      if (data.success) {
        setBookings(bookings.map(booking => 
          booking.bookingId === bookingId 
            ? { 
                ...booking, 
                completionStatus: { ...booking.completionStatus, customerConfirmed: true },
                status: 'completed' // Update status to completed
              }
            : booking
        ));
        setFilteredBookings(filteredBookings.map(booking => 
          booking.bookingId === bookingId 
            ? { 
                ...booking, 
                completionStatus: { ...booking.completionStatus, customerConfirmed: true },
                status: 'completed' // Update status to completed
              }
            : booking
        ));
      } else {
        setError(data.message || 'Failed to confirm booking completion');
      }
    } catch (error) {
      console.error('Error confirming booking completion:', error);
      setError(error.message || 'Failed to confirm booking completion');
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

  useEffect(() => {
    let filtered = bookings;
    
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerDetails.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status.toLowerCase() === statusFilter);
    }
    
    setFilteredBookings(filtered);
  }, [searchTerm, statusFilter, bookings]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'payment-paid';
      case 'pending':
        return 'payment-pending';
      case 'failed':
        return 'payment-failed';
      default:
        return 'payment-default';
    }
  };

  // helper function
const canConfirmCompletion = (booking) => {
  return (
    booking.paymentStatus?.toLowerCase() === 'paid' &&
    booking.status?.toLowerCase() === 'completed' &&
    booking.completionStatus?.providerMarkedCompleted &&
    !booking.completionStatus?.customerConfirmed
  );
};


  const getBookingStats = () => {
    const stats = bookings.reduce((acc, booking) => {
      acc.total++;
      acc[booking.status.toLowerCase()] = (acc[booking.status.toLowerCase()] || 0) + 1;
      return acc;
    }, { total: 0 });
    
    return stats;
  };

  const stats = getBookingStats();

  if (loading) {
    return (
      <PageContainer>
        <Container>
          <LoadingContainer>
            <Spinner />
            <p>Loading bookings...</p>
          </LoadingContainer>
        </Container>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Container>
          <ErrorContainer>
            <AlertCircle size={24} />
            <h2>Error</h2>
            <p>{error}</p>
            <RetryButton onClick={() => window.location.reload()}>
              <RefreshCw size={16} /> Try Again
            </RetryButton>
          </ErrorContainer>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <Header>
          <h1>Booking History</h1>
          {bookings.length > 0 && <p>Manage and view all your appointments</p>}
        </Header>

        {bookings.length === 0 ? (
          <EmptyState>
            <Calendar size={48} />
            <h3>No Bookings Yet</h3>
            <p>Start your journey by booking your first appointment with us.</p>
            <ActionButton onClick={() => navigate('/services')}>
              Book Your First Appointment
            </ActionButton>
          </EmptyState>
        ) : (
          <>
            <FiltersContainer>
              <FilterContainer>
                <Filter size={16} />
                <FilterSelect
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </FilterSelect>
              </FilterContainer>
            </FiltersContainer>

            <ResultsSummary>
              <span>{filteredBookings.length} of {bookings.length} bookings</span>
            </ResultsSummary>

            <BookingsGrid>
              {filteredBookings.map(booking => (
                <BookingCard key={booking._id}>
                  <CardHeader>
                    <ServiceInfo>
                      <h3>{booking?.service?.name}</h3>
                    </ServiceInfo>
                    <StatusBadge className={getStatusColor(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </StatusBadge>
                  </CardHeader>
                  
                  <CardBody>
                    <InfoRow>
                      <InfoItem>
                        <Calendar size={16} />
                        <InfoContent>
                          <p>
                            {formatBookingDate(booking.bookingDate)}
                          </p>
                          <p>Date</p>
                        </InfoContent>
                      </InfoItem>
                      
                      <InfoItem>
                        <Clock size={16} />
                        <InfoContent>
                          <p>{booking.timeSlot.startTime} - {booking.timeSlot.endTime}</p>
                          <p>Time</p>
                        </InfoContent>
                      </InfoItem>
                    </InfoRow>

                    <InfoRow>
                      <InfoItem>
                        <User size={16} />
                        <InfoContent>
                          <p>{booking.customerDetails.name}</p>
                          <p>Customer</p>
                        </InfoContent>
                      </InfoItem>
                      
                      <InfoItem>
                        <CreditCard size={16} />
                        <InfoContent>
                          <PaymentInfo>
                            <span>£{booking.totalPrice.toFixed(2)}</span>
                          </PaymentInfo>
                          <p>Payment</p>
                        </InfoContent>
                      </InfoItem>
                    </InfoRow>
                  </CardBody>
                  
                  <CardFooter>
  {canConfirmCompletion(booking) && (
    <ActionButtons>
      <ActionButton onClick={() => handleConfirmCompletion(booking.bookingId)}>
        Confirm Completion
      </ActionButton>
    </ActionButtons>
  )}
</CardFooter>

                </BookingCard>
              ))}
            </BookingsGrid>

            {filteredBookings.length === 0 && searchTerm && (
              <NoResults>
                <p>No bookings found matching "{searchTerm}"</p>
                <ActionButtonSecondary onClick={() => setSearchTerm('')}>
                  Clear Search
                </ActionButtonSecondary>
              </NoResults>
            )}
          </>
        )}
      </Container>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  padding: 2rem 1rem;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    font-weight: 600;
    color: black;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1rem;
    color: black;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;

  p {
    margin-top: 1rem;
    font-size: 1.1rem;
    color: black;
  }
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #2b6cb0;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 1.5rem;
    color: #c53030;
    margin: 0.5rem 0;
  }

  p {
    font-size: 1rem;
    color: black;
    margin-bottom: 1rem;
  }
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #2b6cb0;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2c5282;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;

  h3 {
    font-size: 1.5rem;
    color: black;
    margin: 1rem 0 0.5rem;
  }

  p {
    font-size: 1rem;
    color: black;
    margin-bottom: 1.5rem;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const FilterSelect = styled.select`
  border: none;
  background: transparent;
  font-size: 1rem;
  color: black;
  cursor: pointer;

  &:focus {
    outline: none;
  }
`;

const ResultsSummary = styled.div`
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: black;
`;

const BookingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const BookingCard = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ServiceInfo = styled.div`
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: black;
    margin: 0;
  }

  span {
    font-size: 0.9rem;
    color: black;
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;

  &.status-confirmed {
    background-color: #e6fffa;
    color: #2b6cb0;
  }

  &.status-pending {
    background-color: #fefcbf;
    color: #b7791f;
  }

  &.status-cancelled {
    background-color: #fed7d7;
    color: #c53030;
  }

  &.status-completed {
    background-color: #c6f6d5;
    color: #2f855a;
  }

  &.status-default {
    background-color: #edf2f7;
    color: #4a5568;
  }
`;

const CardBody = styled.div`
  margin-bottom: 1rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;

  @media (max-width: 400px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const InfoContent = styled.div`
  p:first-child {
    font-size: 1rem;
    font-weight: 500;
    color: #1a202c;
    margin: 0;
  }

  p:last-child {
    font-size: 0.85rem;
    color: #718096;
    margin: 0;
  }
`;

const PaymentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span:last-child {
    font-size: 1rem;
    font-weight: 500;
    color: #1a202c;
  }
`;

const PaymentBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;

  &.payment-paid {
    background-color: #c6f6d5;
    color: #2f855a;
  }

  &.payment-pending {
    background-color: #fefcbf;
    color: #b7791f;
  }

  &.payment-failed {
    background-color: #fed7d7;
    color: #c53030;
  }

  &.payment-default {
    background-color: #edf2f7;
    color: #4a5568;
  }
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #2b6cb0;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2c5282;
  }
`;

const ActionButtonSecondary = styled(ActionButton)`
  background-color: #edf2f7;
  color: #4a5568;

  &:hover {
    background-color: #e2e8f0;
  }
`;

const ActionButtonTertiary = styled(ActionButton)`
  background-color: #fed7d7;
  color: #c53030;

  &:hover {
    background-color: #feb2b2;
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  p {
    font-size: 1rem;
    color: #4a5568;
    margin-bottom: 1rem;
  }
`;

export default BookingHistory;