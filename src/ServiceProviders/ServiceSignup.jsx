import { useState } from 'react';
import baseUrl from '../../server.js';
import toast, { Toaster } from 'react-hot-toast';

const ServiceProviderSignup = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
    businessAddress: '',
    businessDescription: '',
    paypalEmail: '',
    profileImage: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
    }
    setFormData(prev => ({
      ...prev,
      profileImage: file
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    const { name, email, password, phone, businessName, businessAddress, businessDescription } = formData;
    
    if (!name.trim()) return 'Full name is required';
    if (!email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address';
    if (!password.trim()) return 'Password is required';
    if (password.length < 5) return 'Password must be at least 5 characters long';
    if (!phone.trim()) return 'Phone number is required';
    if (!/^[\d\s\-\+\(\)]+$/.test(phone)) return 'Please enter a valid phone number';
    if (!businessName.trim()) return 'Chore helper name is required';
    if (!businessAddress.trim()) return 'address is required';
    if (!businessDescription.trim()) return 'description is required';
    if (businessDescription.length < 20) return 'description must be at least 20 characters';
    if (!formData.paypalEmail.trim()) return 'PayPal email is required';
    if (!/\S+@\S+\.\S+/.test(formData.paypalEmail)) return 'Please enter a valid PayPal email address';

    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch(`${baseUrl}/api/auth/register-service`, {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Service provider registered successfully! Please check your email for verification.', {
          duration: 4000,
          position: 'top-center',
        });
        // Store token if needed
        if (typeof Storage !== 'undefined') {
          localStorage.setItem('serviceProviderToken', data.data.token);
        }
        setTimeout(() => {
          onClose();
          setFormData({
            name: '',
            email: '',
            password: '',
            phone: '',
            businessName: '',
            businessAddress: '',
            businessDescription: '',
            paypalEmail: '',
            profileImage: null
          });
          setSuccess('');
          setError('');
        }, 3000);
      } else {
        const errorMsg = data.message || 'Registration failed. Please try again.';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = 'Network error. Please check your connection and try again.';
      // setError(errorMsg);
      // toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Toaster />
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-container">
          <div className="modal-header">
            <h2>Join as a Quickie Helper</h2>
            <button className="close-btn" onClick={onClose} type="button" aria-label="Close modal">
              &times;
            </button>
          </div>
          
          <div className="signup-form">
            {/* {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="success-message" role="alert">
                {success}
              </div>
            )} */}
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                  aria-describedby={error && error.includes('name') ? 'name-error' : undefined}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  required
                  disabled={loading}
                  aria-describedby={error && error.includes('email') ? 'email-error' : undefined}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="paypalEmail">PayPal Email *</label>
              <input
                type="email"
                id="paypalEmail"
                name="paypalEmail"
                value={formData.paypalEmail}
                onChange={handleInputChange}
                placeholder="your-paypal@example.com"
                required
                disabled={loading}
                aria-describedby={error && error.includes('PayPal') ? 'paypal-email-error' : undefined}
              />
              <div>*note: your paypal email provided must confirmed by paypal to get paid of services rendered.</div>
            </div>

            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a secure password"
                  required
                  minLength="5"
                  disabled={loading}
                  aria-describedby={error && error.includes('password') ? 'password-error' : undefined}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone Number"
                  required
                  disabled={loading}
                  aria-describedby={error && error.includes('phone') ? 'phone-error' : undefined}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="businessName">Chore Helper Name *</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="e.g., Smith Plumbing Services"
                required
                disabled={loading}
                aria-describedby={error && error.includes('chore helper name') ? 'business-name-error' : undefined}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="businessAddress">Chore Helper Address *</label>
              <input
                type="text"
                id="businessAddress"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleInputChange}
                placeholder="123 Main Street, Lagos, Nigeria"
                required
                disabled={loading}
                aria-describedby={error && error.includes('address') ? 'address-error' : undefined}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="businessDescription">Description * (min. 20 characters)</label>
              <textarea
                id="businessDescription"
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleInputChange}
                placeholder="Describe your services, experience, and what makes you unique. Include your specialties, years in business, and service areas."
                rows="4"
                required
                disabled={loading}
                aria-describedby={error && error.includes('description') ? 'description-error' : undefined}
              />
              <div className="file-input-note">
                {formData.businessDescription.length}/20 characters minimum
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="profileImage">Profile Image (Optional, max 5MB)</label>
              <input
                type="file"
                id="profileImage"
                name="profileImage"
                onChange={handleFileChange}
                accept="image/*"
                className="file-input"
                disabled={loading}
                aria-describedby="profile-image-help"
              />
              <div className="file-input-note" id="profile-image-help">
                Upload a professional photo of yourself or your business logo
                {formData.profileImage && (
                  <span style={{ color: '#059669', fontWeight: '500' }}>
                    <br />✓ {formData.profileImage.name} selected
                  </span>
                )}
              </div>
            </div>
            
            <button 
              type="button" 
              className="submit-btn"
              disabled={loading}
              aria-describedby="submit-help"
              onClick={handleSubmit}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            
            <p className="terms-text" id="submit-help">
              By signing up, you agree to our Terms of Service and Privacy Policy.<br />
              You will receive an email verification link after registration.
            </p>
          </div>
        </div>
        
        <style jsx>{`
          /* Modal Overlay */
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(2px);
          }

          /* Modal Container */
          .modal-container {
            background: white;
            border-radius: 16px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: modalSlideIn 0.3s ease-out;
            position: relative;
          }

          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: translateY(-30px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          /* Modal Header */
          .modal-header {
            padding: 24px 32px 16px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 16px 16px 0 0;
          }

          .modal-header h2 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
          }

          .close-btn {
            background: none;
            border: none;
            font-size: 28px;
            color: white;
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s ease;
          }

          .close-btn:hover {
            background-color: rgba(255, 255, 255, 0.2);
          }

          /* Form Styles */
          .signup-form {
            padding: 32px;
          }

          .form-row {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
          }

          .form-row .form-group {
            flex: 1;
          }

          .form-group {
            margin-bottom: 24px;
          }

          .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #374151;
            font-size: 14px;
          }

          .form-group input,
          .form-group textarea {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s ease, box-shadow 0.3s ease;
            box-sizing: border-box;
          }

          .form-group input:focus,
          .form-group textarea:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }

          .form-group textarea {
            resize: vertical;
            min-height: 100px;
            font-family: inherit;
          }

          /* File Input Styling */
          .file-input {
            padding: 8px !important;
            background-color: #f9fafb;
            border: 2px dashed #d1d5db !important;
            cursor: pointer;
          }

          .file-input:hover {
            border-color: #667eea !important;
            background-color: #f0f2ff;
          }

          .file-input-note {
            font-size: 12px;
            color: #6b7280;
            margin-top: 4px;
            font-style: italic;
          }

          /* Message Styles */
          .error-message {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
          }

          .success-message {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #166534;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
          }

          /* Submit Button */
          .submit-btn {
            width: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 16px 24px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }

          .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
          }

          .submit-btn:active {
            transform: translateY(0);
          }

          .submit-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }

          /* Terms Text */
          .terms-text {
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            margin-top: 16px;
            margin-bottom: 0;
            line-height: 1.4;
          }

          /* Responsive Design */
          @media (max-width: 768px) {
            .modal-container {
              width: 95%;
              margin: 20px;
              max-height: 85vh;
            }
            
            .modal-header {
              padding: 20px 24px 12px;
            }
            
            .modal-header h2 {
              font-size: 20px;
            }
            
            .signup-form {
              padding: 24px 20px;
            }
            
            .form-row {
              flex-direction: column;
              gap: 0;
            }
            
            .form-group input,
            .form-group textarea {
              font-size: 16px; /* Prevents zoom on iOS */
            }
          }

          @media (max-width: 480px) {
            .modal-overlay {
              padding: 10px;
            }
            
            .modal-container {
              width: 100%;
              margin: 0;
            }
            
            .modal-header {
              padding: 16px 20px 12px;
            }
            
            .signup-form {
              padding: 20px 16px;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default ServiceProviderSignup;