import { useEffect, useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StoreContext } from '../../Components/context/storeContext';
import { CheckCircle, Calendar, Clock, User, CreditCard, AlertCircle, Home, FileText } from 'lucide-react';
import styled from 'styled-components';
import axios from 'axios';

const PayPalSuccessPage = () => {
  const { url, token } = useContext(StoreContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [isRetryBlocked, setIsRetryBlocked] = useState(false);

  const orderId = searchParams.get('token') || searchParams.get('orderId');
  const bookingId = searchParams.get('bookingId');
  const pollingInterval = 5000; // 5 seconds between polling attempts
  const maxPollingAttempts = 12; // Stop after ~60 seconds (12 * 5s)

  useEffect(() => {
    if (!token) {
      setVerificationStatus('unauthenticated');
      setLoading(false);
      return;
    }

    if (!orderId || !bookingId) {
      setError('Missing payment information. Please try booking again.');
      setVerificationStatus('failed');
      setLoading(false);
      return;
    }

    // Check if verification was already attempted to prevent refresh-induced duplicates
    const verificationKey = `payment_verification_${bookingId}_${orderId}`;
    const verificationAttempted = sessionStorage.getItem(verificationKey);
    if (verificationAttempted === 'failed') {
      setError('Payment verification already failed for this booking. Please wait 5 minutes or contact support.');
      setVerificationStatus('failed');
      setLoading(false);
      setIsRetryBlocked(true);
      return;
    }

    let pollingTimeout;
    let pollingAttempts = 0;

    const checkBookingStatus = async () => {
      try {
        const response = await axios.get(`${url}/api/payment/status/${bookingId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success && response.data.data) {
          const { status, paymentStatus, paymentIds } = response.data.data;
          if (status === 'cancelled' && paymentStatus === 'refunded') {
            const refundTime = new Date(paymentIds?.paymentCompletedAt);
            if (Date.now() - refundTime.getTime() < 5 * 60 * 1000) {
              setError('This booking was recently refunded. Please wait 5 minutes before retrying.');
              setVerificationStatus('failed');
              setIsRetryBlocked(true);
              setLoading(false);
              sessionStorage.setItem(verificationKey, 'failed');
              return false;
            }
          }
          return true; // Proceed with verification
        } else {
          console.warn('Booking status check failed:', response.data.message);
          return true; // Proceed cautiously if status check fails
        }
      } catch (err) {
        console.error('Error checking booking status:', err);
        return true; // Proceed if status check fails to avoid blocking legitimate payments
      }
    };

    const verifyPayment = async () => {
      if (pollingAttempts >= maxPollingAttempts) {
        setError('Payment verification timed out. Please try again or contact support.');
        setVerificationStatus('failed');
        setLoading(false);
        sessionStorage.setItem(verificationKey, 'failed');
        return;
      }

      pollingAttempts++;

      try {
        // Check booking status before verifying payment
        const canVerify = await checkBookingStatus();
        if (!canVerify) {
          return;
        }

        const response = await axios.post(`${url}/api/payments/verify-paypal`, {
          bookingId,
          orderId,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setBookingData(response.data.data);
          setVerificationStatus('success');
          setLoading(false);
          sessionStorage.setItem(verificationKey, 'success');
        } else if (response.data.status === 'pending') {
          // Continue polling for pending payments
          pollingTimeout = setTimeout(verifyPayment, pollingInterval);
        } else {
          // Handle specific refund-related error
          if (response.data.message.includes('recently refunded')) {
            setError(response.data.message);
            setIsRetryBlocked(true);
          } else {
            setError(response.data.message || 'Payment verification failed');
          }
          setVerificationStatus('failed');
          setLoading(false);
          sessionStorage.setItem(verificationKey, 'failed');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        // Continue polling on network/server errors
        pollingTimeout = setTimeout(verifyPayment, pollingInterval);
      }
    };

    verifyPayment();

    // Cleanup polling on component unmount
    return () => {
      if (pollingTimeout) {
        clearTimeout(pollingTimeout);
      }
    };
  }, [token, url, orderId, bookingId]);

  // -- Loading Spinner --
  if (loading) {
    return (
      <PageContainer>
        <Container>
          <LoadingContainer>
            <Spinner />
            <h2>Verifying Your Payment</h2>
            <p>Please wait while we confirm your PayPal payment...</p>
          </LoadingContainer>
        </Container>
      </PageContainer>
    );
  }

  // -- Unauthenticated View --
  if (verificationStatus === 'unauthenticated') {
    return (
      <PageContainer>
        <Container>
          <ErrorContainer>
            <AlertCircle size={48} color="#c53030" />
            <h2>You're Not Logged In</h2>
            <p>Please log in to view your booking details and confirm your payment.</p>
            <ActionButtons>
              <PrimaryButton onClick={() => navigate(`/auth?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`)}>
                Log In
              </PrimaryButton>
              <HomeButton onClick={() => navigate('/')}>
                <Home size={16} /> Go Home
              </HomeButton>
            </ActionButtons>
          </ErrorContainer>
        </Container>
      </PageContainer>
    );
  }

  // -- Error View --
  if (error || verificationStatus === 'failed') {
    return (
      <PageContainer>
        <Container>
          <ErrorContainer>
            <AlertCircle size={48} color="#c53030" />
            <h2>Payment Verification Failed</h2>
            <p>{error}</p>
            <ActionButtons>
              <PrimaryButton
                onClick={() => navigate('/book')}
                disabled={isRetryBlocked}
                style={{ opacity: isRetryBlocked ? 0.6 : 1, cursor: isRetryBlocked ? 'not-allowed' : 'pointer' }}
              >
                Try Booking Again
              </PrimaryButton>
              <HomeButton onClick={() => navigate('/')}>
                <Home size={16} /> Go Home
              </HomeButton>
            </ActionButtons>
          </ErrorContainer>
        </Container>
      </PageContainer>
    );
  }

  // -- Success View (unchanged) --
  if (verificationStatus === 'success' && bookingData) {
    return (
      <PageContainer>
        <Container>
          <SuccessContainer>
            <SuccessIcon>
              <CheckCircle size={64} color="#2f855a" />
            </SuccessIcon>

            <SuccessHeader>
              <h1>Payment Successful!</h1>
              <p>Your booking has been confirmed and payment processed via PayPal. Check your email.</p>
            </SuccessHeader>

            <BookingCard>
              <CardHeader>
                <ServiceInfo>
                  <h3>{bookingData.service.name}</h3>
                  <span>Booking ID: #{bookingData.bookingId}</span>
                </ServiceInfo>
                <StatusBadge className="status-confirmed">
                  {bookingData.status.charAt(0).toUpperCase() + bookingData.status.slice(1)}
                </StatusBadge>
              </CardHeader>

              <CardBody>
                <InfoRow>
                  <InfoItem>
                    <Calendar size={20} color="#2b6cb0" />
                    <InfoContent>
                      <p>
                        {new Date(bookingData.bookingDate).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <span>Appointment Date</span>
                    </InfoContent>
                  </InfoItem>

                  <InfoItem>
                    <Clock size={20} color="#2b6cb0" />
                    <InfoContent>
                      <p>{bookingData.timeSlot.startTime} - {bookingData.timeSlot.endTime}</p>
                      <span>Time Slot</span>
                    </InfoContent>
                  </InfoItem>
                </InfoRow>

                <InfoRow>
                  <InfoItem>
                    <User size={20} color="#2b6cb0" />
                    <InfoContent>
                      <p>{bookingData.customerDetails.name}</p>
                      <span>Customer Name</span>
                    </InfoContent>
                  </InfoItem>

                  <InfoItem>
                    <CreditCard size={20} color="#2b6cb0" />
                    <InfoContent>
                      <PaymentInfo>
                        <PaymentBadge className="payment-paid">
                          {bookingData.paymentStatus.charAt(0).toUpperCase() + bookingData.paymentStatus.slice(1)}
                        </PaymentBadge>
                        <span>£{bookingData.totalPrice.toFixed(2)}</span>
                      </PaymentInfo>
                      <span>Payment via {bookingData.paymentMethod.toUpperCase()}</span>
                    </InfoContent>
                  </InfoItem>
                </InfoRow>

                {bookingData.specialRequests && (
                  <SpecialRequests>
                    <h4>Special Requests:</h4>
                    <p>{bookingData.specialRequests}</p>
                  </SpecialRequests>
                )}
              </CardBody>
            </BookingCard>

            <NextSteps>
              <h3>What's Next?</h3>
              <StepsList>
                <Step>
                  <StepNumber>1</StepNumber>
                  <StepContent>
                    <h4>Confirmation Email</h4>
                    <p>Check your email for booking confirmation and details</p>
                  </StepContent>
                </Step>
                <Step>
                  <StepNumber>2</StepNumber>
                  <StepContent>
                    <h4>Service Provider Contact</h4>
                    <p>Our team will contact you 24 hours before your appointment</p>
                  </StepContent>
                </Step>
                <Step>
                  <StepNumber>3</StepNumber>
                  <StepContent>
                    <h4>Prepare for Service</h4>
                    <p>Ensure access to the service area and any special requirements</p>
                  </StepContent>
                </Step>
              </StepsList>
            </NextSteps>

            <ActionButtons>
              <PrimaryButton onClick={() => navigate('/booking-history')}>
                <FileText size={16} />
                View All Bookings
              </PrimaryButton>
              <SecondaryButton onClick={() => navigate('/')}>
                <Home size={16} />
                Back to Home
              </SecondaryButton>
            </ActionButtons>
          </SuccessContainer>
        </Container>
      </PageContainer>
    );
  }

  return null;
};

// Styled Components (unchanged)
const PageContainer = styled.div`
  min-height: 100vh;
  background: #fff;
  padding: 2rem 1rem;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;

  h2 {
    font-size: 1.5rem;
    color: #2b6cb0;
    margin: 1rem 0 0.5rem;
  }

  p {
    font-size: 1rem;
    color: #4a5568;
  }
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
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
  min-height: 60vh;
  text-align: center;
  background: #fff;
  padding: 3rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 1.75rem;
    color: #c53030;
    margin: 1rem 0 0.5rem;
  }

  p {
    font-size: 1rem;
    color: #4a5568;
    margin-bottom: 2rem;
    max-width: 400px;
  }
`;

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const SuccessIcon = styled.div`
  margin-bottom: 1.5rem;
  animation: successPulse 0.6s ease-out;

  @keyframes successPulse {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const SuccessHeader = styled.div`
  margin-bottom: 2rem;

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #2f855a;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1.1rem;
    color: #4a5568;
    max-width: 500px;
  }
`;

const BookingCard = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 600px;
  text-align: left;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
`;

const ServiceInfo = styled.div`
  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a202c;
    margin: 0 0 0.25rem;
  }

  span {
    font-size: 0.9rem;
    color: #718096;
    font-weight: 500;
  }
`;

const StatusBadge = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;

  &.status-confirmed {
    background-color: #c6f6d5;
    color: #2f855a;
  }
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InfoRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
`;

const InfoContent = styled.div`
  flex: 1;

  p {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1a202c;
    margin: 0 0 0.25rem;
  }

  span {
    font-size: 0.9rem;
    color: #718096;
  }
`;

const PaymentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;

  span:last-child {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1a202c;
  }
`;

const PaymentBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;

  &.payment-paid {
    background-color: #c6f6d5;
    color: #2f855a;
  }
`;

const SpecialRequests = styled.div`
  padding: 1rem;
  background: #fffaf0;
  border-radius: 8px;
  border-left: 4px solid #f6ad55;

  h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #1a202c;
    margin: 0 0 0.5rem;
  }

  p {
    font-size: 0.95rem;
    color: #4a5568;
    margin: 0;
    line-height: 1.5;
  }
`;

const NextSteps = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 600px;
  text-align: left;

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a202c;
    margin: 0 0 1.5rem;
    text-align: center;
  }
`;

const StepsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Step = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
`;

const StepNumber = styled.div`
  width: 32px;
  height: 32px;
  background: #2b6cb0;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;

  h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1a202c;
    margin: 0 0 0.25rem;
  }

  p {
    font-size: 0.95rem;
    color: #4a5568;
    margin: 0;
    line-height: 1.5;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #2b6cb0;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background-color: #2c5282;
    transform: translateY(-1px);
  }
`;

const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #edf2f7;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background-color: #e2e8f0;
    transform: translateY(-1px);
  }
`;

const HomeButton = styled(SecondaryButton)``;

export default PayPalSuccessPage;