import { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { StoreContext } from '../../Components/context/storeContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BookingForm = ({ service, onBack, onBookingSuccess }) => {
  const { token, setToken, url } = useContext(StoreContext);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDateRange, setIsDateRange] = useState(false); // New state to toggle between single date and date range

  const [formData, setFormData] = useState({
    bookingDate: '',
    dateRange: { startDate: '', endDate: '' }, // New field for date range
    startTime: '',
    endTime: '',
    customerName: '',
    customerEmail: localStorage.getItem('userEmail') || '',
    customerPhone: '',
    serviceLocation: {
      address: '',
      city: '',
      postalCode: '',
    },
    specialRequests: '',
    paymentMethod: 'paypal',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!token) {
      navigate('/auth?returnTo=' + encodeURIComponent(window.location.pathname));
      return;
    }

    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setFormData((prev) => ({
        ...prev,
        customerEmail: savedEmail,
      }));
    }
  }, [token, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GBP',
    }).format(price);
  };

  const calculateDuration = () => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}:00`);
      const end = new Date(`2000-01-01T${formData.endTime}:00`);
      return (end - start) / (1000 * 60);
    }
    return 0;
  };

const calculateTotalPrice = () => {
  const duration = calculateDuration();
  let numberOfDays = 1; // Default for single date

  if (isDateRange && formData.dateRange.startDate && formData.dateRange.endDate) {
    const start = new Date(formData.dateRange.startDate);
    const end = new Date(formData.dateRange.endDate);
    // Calculate days including both start and end dates
    numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }

  if (duration > 0) {
    const hours = duration / 60;
    const basePrice = service.price * hours; // Price for one instance
    return basePrice * numberOfDays;
  }
  return service.price * numberOfDays;
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('serviceLocation.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        serviceLocation: {
          ...prev.serviceLocation,
          [field]: value,
        },
      }));
    } else if (name.includes('dateRange.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        dateRange: {
          ...prev.dateRange,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDateTypeChange = (e) => {
    setIsDateRange(e.target.value === 'range');
    setError(null);
    setFormData((prev) => ({
      ...prev,
      bookingDate: '',
      dateRange: { startDate: '', endDate: '' },
    }));
  };

  const validateStep1 = () => {
    const { bookingDate, dateRange, startTime, endTime } = formData;
    const { startDate, endDate } = dateRange;

    if (isDateRange) {
      if (!startDate || !endDate) {
        setError('Please select both start and end dates');
        return false;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setError('Invalid start or end date');
        return false;
      }

      if (start < today) {
        setError('Start date cannot be in the past');
        return false;
      }

      if (end < start) {
        setError('End date cannot be before start date');
        return false;
      }
    } else {
      if (!bookingDate) {
        setError('Please select a booking date');
        return false;
      }

      const selectedDate = new Date(bookingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(selectedDate.getTime())) {
        setError('Invalid booking date');
        return false;
      }

      if (selectedDate < today) {
        setError('Booking date cannot be in the past');
        return false;
      }
    }

    if (!startTime || !endTime) {
      setError('Please fill in both start time and end time');
      return false;
    }

    if (startTime >= endTime) {
      setError('End time must be after start time');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    const { customerName, customerEmail, customerPhone, serviceLocation } = formData;
    const { address, city, postalCode } = serviceLocation;

    if (!customerName || !customerEmail || !customerPhone || !address || !city || !postalCode) {
      setError('Please fill in all customer details and service location fields');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      setError('Please enter a valid email address');
      return false;
    }

    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(customerPhone)) {
      setError('Please enter a valid phone number');
      return false;
    }

    if (postalCode.length < 5) {
      setError('Please enter a valid postal code');
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    setError(null);

    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setError(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post(
        `${url}/auth/refresh-token`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (response.data.success) {
        const newToken = response.data.token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        return newToken;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('token');
      setToken('');
      navigate('/auth?returnTo=' + encodeURIComponent(window.location.pathname));
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) {
      console.log('Submission already in progress');
      return;
    }

    if (isDateRange && (!formData.dateRange.startDate || !formData.dateRange.endDate)) {
      setError('Please complete all required date fields');
      return;
    }
    if (!isDateRange && !formData.bookingDate) {
      setError('Please select a booking date');
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      setError('Please complete all required time fields');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    setError(null);

    console.log('Submitting booking with data:', formData);

    const bookingData = {
      serviceId: service._id,
      ...(isDateRange
        ? { dateRange: formData.dateRange }
        : { bookingDate: formData.bookingDate }),
      timeSlot: {
        startTime: formData.startTime,
        endTime: formData.endTime,
      },
      customerDetails: {
        name: formData.customerName,
        email: formData.customerEmail,
        phone: formData.customerPhone,
      },
      serviceLocation: {
        address: formData.serviceLocation.address,
        city: formData.serviceLocation.city,
        postalCode: formData.serviceLocation.postalCode,
      },
      specialRequests: formData.specialRequests,
      paymentMethod: formData.paymentMethod,
    };

    console.log('Booking data sent to server:', JSON.stringify(bookingData, null, 2));

    try {
      const response = await axios.post(`${url}/api/booking/create`, bookingData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        if (formData.customerEmail !== localStorage.getItem('userEmail')) {
          localStorage.setItem('userEmail', formData.customerEmail);
        }
        onBookingSuccess(response.data);
        setFormData({
          bookingDate: '',
          dateRange: { startDate: '', endDate: '' },
          startTime: '',
          endTime: '',
          customerName: '',
          customerEmail: localStorage.getItem('userEmail') || '',
          customerPhone: '',
          serviceLocation: {
            address: '',
            city: '',
            postalCode: '',
          },
          specialRequests: '',
          paymentMethod: 'paypal',
        });
        setIsDateRange(false);
        setStep(1);
      } else {
        setError(response.data.message || 'Failed to create booking');
      }
    } catch (err) {
      console.error('Booking error:', err);
      if (err.response?.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          try {
            const response = await axios.post(
              `${url}/api/booking/create`,
              bookingData,
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${newToken}`,
                },
              }
            );
            if (response.data.success) {
              if (formData.customerEmail !== localStorage.getItem('userEmail')) {
                localStorage.setItem('userEmail', formData.customerEmail);
              }
              onBookingSuccess(response.data);
              setFormData({
                bookingDate: '',
                dateRange: { startDate: '', endDate: '' },
                startTime: '',
                endTime: '',
                customerName: '',
                customerEmail: localStorage.getItem('userEmail') || '',
                customerPhone: '',
                serviceLocation: {
                  address: '',
                  city: '',
                  postalCode: '',
                },
                specialRequests: '',
                paymentMethod: 'paypal',
              });
              setIsDateRange(false);
              setStep(1);
            } else {
              setError(response.data.message || 'Failed to create booking');
            }
          } catch (retryErr) {
            setError(
              retryErr.response?.data?.message ||
                'Failed to create booking after token refresh'
            );
          }
        } else {
          localStorage.removeItem('token');
          setToken('');
          navigate('/auth?returnTo=' + encodeURIComponent(window.location.pathname));
        }
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to create booking. Please try again.');
      }
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

 const renderStep1 = () => (
  <div style={styles.stepContainer}>
    <h3 style={styles.stepTitle}>Select Date & Time</h3>

    <div style={styles.formGroup}>
      <label style={styles.label}>Date Type</label>
      <div style={styles.radioGroup}>
        <label style={styles.radioLabel}>
          <input
            type="radio"
            name="dateType"
            value="single"
            checked={!isDateRange}
            onChange={handleDateTypeChange}
            style={styles.radioInput}
          />
          Single Date
        </label>
        <label style={styles.radioLabel}>
          <input
            type="radio"
            name="dateType"
            value="range"
            checked={isDateRange}
            onChange={handleDateTypeChange}
            style={styles.radioInput}
          />
          Date Range
        </label>
      </div>
    </div>

    {isDateRange ? (
      <>
        <div style={styles.formGroup}>
          <label style={styles.label}>Start Date</label>
          <input
            type="date"
            name="dateRange.startDate"
            value={formData.dateRange.startDate}
            onChange={handleInputChange}
            style={styles.input}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>End Date</label>
          <input
            type="date"
            name="dateRange.endDate"
            value={formData.dateRange.endDate}
            onChange={handleInputChange}
            style={styles.input}
            min={formData.dateRange.startDate || new Date().toISOString().split('T')[0]}
          />
        </div>
      </>
    ) : (
      <div style={styles.formGroup}>
        <label style={styles.label}>Booking Date</label>
        <input
          type="date"
          name="bookingDate"
          value={formData.bookingDate}
          onChange={handleInputChange}
          style={styles.input}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>
    )}

    <div style={styles.timeGroup}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Start Time</label>
        <input
          type="time"
          name="startTime"
          value={formData.startTime}
          onChange={handleInputChange}
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>End Time</label>
        <input
          type="time"
          name="endTime"
          value={formData.endTime}
          onChange={handleInputChange}
          style={styles.input}
        />
      </div>
    </div>

    {(isDateRange
      ? formData.dateRange.startDate &&
        formData.dateRange.endDate &&
        formData.startTime &&
        formData.endTime
      : formData.bookingDate && formData.startTime && formData.endTime) && (
      <div style={styles.durationInfo}>
        <p style={styles.durationText}>
          {isDateRange
            ? `Period: ${new Date(
                formData.dateRange.startDate
              ).toLocaleDateString('en-GB')} to ${new Date(
                formData.dateRange.endDate
              ).toLocaleDateString('en-GB')}`
            : `Date: ${new Date(formData.bookingDate).toLocaleDateString(
                'en-GB',
                {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }
              )}`}
        </p>
        {isDateRange && (
          <p style={styles.durationText}>
            Number of Days:{' '}
            {Math.ceil(
              (new Date(formData.dateRange.endDate) -
                new Date(formData.dateRange.startDate)) /
                (1000 * 60 * 60 * 24)
            ) + 1}
          </p>
        )}
        <p style={styles.durationText}>
          Duration: {Math.floor(calculateDuration() / 60)}h{' '}
          {calculateDuration() % 60}min
        </p>
        <p style={styles.priceInfo}>
          Estimated Cost: {formatPrice(calculateTotalPrice())}
        </p>
      </div>
    )}
  </div>
);

  const renderStep2 = () => (
    <div style={styles.stepContainer}>
      <h3 style={styles.stepTitle}>Customer Details</h3>

      <div style={styles.formGroup}>
        <label style={styles.label}>Full Name</label>
        <input
          type="text"
          name="customerName"
          value={formData.customerName}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Email Address</label>
        <input
          type="email"
          name="customerEmail"
          value={formData.customerEmail}
          onChange={handleInputChange}
          placeholder="your.email@example.com"
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Phone Number</label>
        <input
          type="tel"
          name="customerPhone"
          value={formData.customerPhone}
          onChange={handleInputChange}
          placeholder="+234 800 000 0000"
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Address</label>
        <input
          type="text"
          name="serviceLocation.address"
          value={formData.serviceLocation.address}
          onChange={handleInputChange}
          placeholder="Enter street address"
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>City</label>
        <input
          type="text"
          name="serviceLocation.city"
          value={formData.serviceLocation.city}
          onChange={handleInputChange}
          placeholder="Enter city"
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Postal Code</label>
        <input
          type="text"
          name="serviceLocation.postalCode"
          value={formData.serviceLocation.postalCode}
          onChange={handleInputChange}
          placeholder="Enter postal code"
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Special Requests (Optional)</label>
        <textarea
          name="specialRequests"
          value={formData.specialRequests}
          onChange={handleInputChange}
          placeholder="Any special instructions or requirements..."
          style={styles.textarea}
          rows="3"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Payment Method</label>
        <select
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleInputChange}
          style={styles.select}
        >
          <option value="paypal">PayPal</option>
        </select>
      </div>
    </div>
  );

const renderStep3 = () => (
  <div style={styles.stepContainer}>
    <h3 style={styles.stepTitle}>Booking Confirmation</h3>

    <div style={styles.confirmationCard}>
      <div style={styles.serviceInfo}>
        <h4 style={styles.serviceName}>{service.name}</h4>
        <p style={styles.serviceCategory}>
          {typeof service.category === 'object'
            ? service.category.name
            : service.category}
        </p>
      </div>

      <div style={styles.bookingDetails}>
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>
            {isDateRange ? 'Period' : 'Date'}:
          </span>
          <span style={styles.detailValue}>
            {isDateRange
              ? `${new Date(
                  formData.dateRange.startDate
                ).toLocaleDateString('en-GB')} to ${new Date(
                  formData.dateRange.endDate
                ).toLocaleDateString('en-GB')}`
              : new Date(formData.bookingDate).toLocaleDateString('en-GB')}
          </span>
        </div>

        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>Time:</span>
          <span style={styles.detailValue}>
            {formData.startTime} - {formData.endTime}
          </span>
        </div>

        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>Duration:</span>
          <span style={styles.detailValue}>
            {Math.floor(calculateDuration() / 60)}h{' '}
            {calculateDuration() % 60}min
          </span>
        </div>

        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>Customer:</span>
          <span style={styles.detailValue}>{formData.customerName}</span>
        </div>

        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>Email:</span>
          <span style={styles.detailValue}>{formData.customerEmail}</span>
        </div>

        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>Phone:</span>
          <span style={styles.detailValue}>{formData.customerPhone}</span>
        </div>

        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>Location:</span>
          <span style={styles.detailValue}>
            {formData.serviceLocation.address}, {formData.serviceLocation.city},{' '}
            {formData.serviceLocation.postalCode}
          </span>
        </div>

        {formData.specialRequests && (
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Special Requests:</span>
            <span style={styles.detailValue}>{formData.specialRequests}</span>
          </div>
        )}

        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>Payment Method:</span>
          <span style={styles.detailValue}>
            {formData.paymentMethod.charAt(0).toUpperCase() +
              formData.paymentMethod.slice(1).replace('_', ' ')}
          </span>
        </div>
      </div>

      <div style={styles.totalSection}>
        {isDateRange && (
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Number of Days:</span>
            <span style={styles.totalValue}>
              {Math.ceil(
                (new Date(formData.dateRange.endDate) -
                  new Date(formData.dateRange.startDate)) /
                  (1000 * 60 * 60 * 24)
              ) + 1}
            </span>
          </div>
        )}
        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>Total Cost:</span>
          <span style={styles.totalValue}>
            {formatPrice(calculateTotalPrice())}
          </span>
        </div>
      </div>
    </div>
  </div>
);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={onBack}>
          ← Back to Service Details
        </button>
        <div style={styles.progressBar}>
          <div style={styles.progressStep}>
            <div
              style={{
                ...styles.progressDot,
                ...(step >= 1 ? styles.progressDotActive : {}),
              }}
            >
              1
            </div>
            <span style={styles.progressLabel}>Time</span>
          </div>
          <div style={styles.progressLine}></div>
          <div style={styles.progressStep}>
            <div
              style={{
                ...styles.progressDot,
                ...(step >= 2 ? styles.progressDotActive : {}),
              }}
            >
              2
            </div>
            <span style={styles.progressLabel}>Details</span>
          </div>
          <div style={styles.progressLine}></div>
          <div style={styles.progressStep}>
            <div
              style={{
                ...styles.progressDot,
                ...(step >= 3 ? styles.progressDotActive : {}),
              }}
            >
              3
            </div>
            <span style={styles.progressLabel}>Confirm</span>
          </div>
        </div>
      </div>

      <div style={styles.formContainer}>
        <div style={styles.serviceHeader}>
          <h2 style={styles.title}>Book {service.name}</h2>
          <p style={styles.subtitle}>
            Base price: {formatPrice(service.price)}/hour
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {error && (
            <div style={styles.errorContainer}>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          <div style={styles.buttonContainer}>
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                style={styles.prevButton}
                disabled={loading}
              >
                Previous
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                style={styles.nextButton}
                disabled={loading}
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                style={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Creating Booking...' : 'Confirm & Pay'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    marginBottom: '30px',
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
    marginBottom: '20px',
  },
  progressBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    padding: '20px 0',
  },
  progressStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  progressDot: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#e0e0e0',
    color: '#999',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '16px',
    transition: 'all 0.3s ease',
  },
  progressDotActive: {
    background: 'rgb(78, 205, 196)',
    color: 'white',
  },
  progressLabel: {
    fontSize: '12px',
    color: '#666',
    fontWeight: '500',
  },
  progressLine: {
    width: '60px',
    height: '2px',
    background: '#e0e0e0',
  },
  formContainer: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(26, 35, 126, 0.1)',
    overflow: 'hidden',
  },
  serviceHeader: {
    background: 'linear-gradient(145deg, #f8f9ff, #ffffff)',
    padding: '30px',
    borderBottom: '1px solid rgba(26, 35, 126, 0.1)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'black',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: '0',
  },
  stepContainer: {
    padding: '30px',
  },
  stepTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'black',
    margin: '0 0 24px 0',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.3s ease',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.3s ease',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.3s ease',
    boxSizing: 'border-box',
    background: 'white',
  },
  timeGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  radioGroup: {
    display: 'flex',
    gap: '20px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: '#333',
  },
  radioInput: {
    marginRight: '8px',
  },
  durationInfo: {
    background: 'rgba(26, 35, 126, 0.05)',
    padding: '16px',
    borderRadius: '8px',
    marginTop: '16px',
  },
  durationText: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 4px 0',
  },
  priceInfo: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a237e',
    margin: '0',
  },
  confirmationCard: {
    border: '1px solid rgba(26, 35, 126, 0.1)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  serviceInfo: {
    background: 'rgba(26, 35, 126, 0.05)',
    padding: '20px',
    borderBottom: '1px solid rgba(26, 35, 126, 0.1)',
  },
  serviceName: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a237e',
    margin: '0 0 4px 0',
  },
  serviceCategory: {
    fontSize: '14px',
    color: '#666',
    margin: '0',
  },
  bookingDetails: {
    padding: '20px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
  },
  detailLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
    minWidth: '120px',
  },
  detailValue: {
    fontSize: '14px',
    color: '#333',
    textAlign: 'right',
    flex: '1',
  },
  totalSection: {
    background: 'rgba(26, 35, 126, 0.05)',
    padding: '20px',
    borderTop: '1px solid rgba(26, 35, 126, 0.1)',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a237e',
  },
  totalValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a237e',
  },
  errorContainer: {
    background: '#ffebee',
    border: '1px solid #ffcdd2',
    borderRadius: '8px',
    padding: '12px 16px',
    margin: '16px 30px',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: '14px',
    margin: '0',
  },
  buttonContainer: {
    display: 'flex',
    gap: '12px',
    padding: '30px',
    paddingTop: '20px',
    justifyContent: 'flex-end',
  },
  prevButton: {
    background: 'linear-gradient(135deg, #6c757d, #495057)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  nextButton: {
    background: 'rgb(78, 205, 196)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  submitButton: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    padding: '14px 32px',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
};

if (!document.querySelector('#booking-form-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'booking-form-styles';
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    input:focus, textarea:focus, select:focus {
      border-color: black !important;
      outline: none;
      box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
    }
    
    .back-button:hover {
      background: linear-gradient(135deg, #495057, #343a40) !important;
      transform: translateY(-1px);
    }
    
    .prev-button:hover {
      background: linear-gradient(135deg, #495057, #343a40) !important;
      transform: translateY(-1px);
    }
    
    .next-button:hover {
      background: linear-gradient(135deg, rgb(78, 205, 196)) !important;
      transform: translateY(-1px);
    }
    
    .submit-button:hover {
      background: linear-gradient(135deg, #059669, #047857) !important;
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }
    
    .submit-button:disabled, .prev-button:disabled, .next-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    @media (max-width: 768px) {
      .time-group {
        grid-template-columns: 1fr !important;
      }
      
      .button-container {
        flex-direction: column;
      }
      
      .progress-bar {
        flex-direction: column;
        gap: 10px !important;
      }
      
      .progress-line {
        width: 2px !important;
        height: 20px !important;
      }
      
      .detail-row {
        flex-direction: column;
        gap: 4px;
        align-items: flex-start !important;
      }
      
      .detail-value {
        text-align: left !important;
      }
      
      .radio-group {
        flex-direction: column;
        gap: 10px !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

BookingForm.propTypes = {
  service: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
  onBookingSuccess: PropTypes.func.isRequired,
};

export default BookingForm;