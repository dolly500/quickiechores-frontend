import { useState } from 'react';
import baseUrl from '../../server.js';
import toast, { Toaster } from 'react-hot-toast';

const ServiceProviderSignup = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
     dateOfBirth: '',
    gender: '',
    businessName: '',
    businessAddress: '',
    businessDescription: '',
    paypalEmail: '',
    proofOfWork: null,
    countryOfOrigin: '',
    rightToWork: null,
    isCitizen: null,
    personalExperience: '',
    homeworkExperience: '',
    profileImage: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${name} must be less than 5MB`);
        return;
      }
      if (!file.type.startsWith('image/') && !file.type.startsWith('application/pdf')) {
        setError(`${name} must be an image or PDF`);
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: file }));
    if (error) setError('');
  };

  const validateForm = () => {
    const {
      name, email, password, phone, dateOfBirth, gender,  businessName, businessAddress, businessDescription,
      paypalEmail, proofOfWork, countryOfOrigin, rightToWork, isCitizen,
       homeworkExperience
    } = formData;

    if (!name.trim()) return 'Full name is required';
    if (!email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email format';
    if (!password.trim()) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (!phone.trim()) return 'Phone number is required';
    if (!/^[\d\s\-\+\(\)]+$/.test(phone)) return 'Invalid phone number';
    if (!dateOfBirth) return 'Date of birth is required';
    if (!gender) return 'Gender is required';
    if (!businessName.trim()) return 'Business name is required';
    if (!businessAddress.trim()) return 'Business address is required';
    if (!businessDescription.trim()) return 'Business description is required';
    if (businessDescription.length < 20) return 'Description must be at least 20 characters';
    if (!paypalEmail.trim()) return 'PayPal email is required';
    if (!/\S+@\S+\.\S+/.test(paypalEmail)) return 'Invalid PayPal email';
    if (!proofOfWork) return 'DBS is required';
    // if (!dbs) return 'DBS document is required';
    if (!countryOfOrigin) return 'Country of origin is required';
    if (rightToWork === null) return 'Right to work document is required';
    if (isCitizen === null) return 'Citizenship status is required';
    if (!homeworkExperience.trim()) return 'Homework experience is required';

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

    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch(`${baseUrl}/api/auth/register-service`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Registration successful! Your account is pending admin approval. You’ll receive an email when approved. Kindly check your mail!', {
          position: 'top-center',
        });

        setTimeout(() => {
          onClose();
          setFormData({
            name: '', email: '', password: '', phone: '', dateOfBirth: '', 
            gender: '', businessName: '',
            businessAddress: '', businessDescription: '', paypalEmail: '',
            proofOfWork: null, dbs: null, countryOfOrigin: '', rightToWork: null,
            isCitizen: null, personalExperience: '', homeworkExperience: '', profileImage: null
          });
        }, 3000);
      } else {
        const errorMsg = data.message || 'Registration failed. Please try again.';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = 'Network error. Please check your connection.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return(
    <>
      <Toaster />
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-container">
          <div className="modal-header">
            <h2>Join as a Quickie Helper</h2>
            <button className="close-btn" onClick={onClose} type="button" aria-label="Close">
              ×
            </button>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            {/* Basic Info */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">First Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  required
                  disabled={loading}
                />
              </div>
                 <div className="form-group">
              <label htmlFor="businessName">Last Name *</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="John"
                required
                disabled={loading}
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
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Min 6 characters"
                    required
                    minLength="6"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      fontSize: '14px',
                      color: '#666',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+44 800 000 0000"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth *</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Business Info */}
         

            <div className="form-group">
              <label htmlFor="businessAddress">Address *</label>
              <input
                type="text"
                id="businessAddress"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleInputChange}
                placeholder="123 Main St, City, Country"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="businessDescription">Description * (min 20 chars)</label>
              <textarea
                id="businessDescription"
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleInputChange}
                placeholder="Describe your services, experience, and service areas..."
                rows="4"
                required
                disabled={loading}
              />
              <div className="file-input-note">
                {formData.businessDescription.length}/20 characters
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
                placeholder="paypal@example.com"
                required
                disabled={loading}
              />
              <div className="file-input-note">
                * Must be a verified PayPal email to receive payments.
              </div>
            </div>

            {/* Documents & Legal */}
            <div className="form-group">
              <label htmlFor="proofOfWork">DBS * (Image/PDF)</label>
              <input
                type="file"
                id="proofOfWork"
                name="proofOfWork"
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className="file-input"
                required
                disabled={loading}
              />
              {formData.proofOfWork && (
                <div className="file-input-note">✓ {formData.proofOfWork.name}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="profileImage">Profile Image</label>
              <input
                type="file"
                id="profileImage"
                name="profileImage"
                onChange={handleFileChange}
                accept="image/*"
                className="file-input"
                disabled={loading}
              />
              {formData.profileImage && (
                <div className="file-input-note">✓ {formData.profileImage.name}</div>
              )}
            </div>

           

            <div className="form-group">
              <label htmlFor="rightToWork">Right to Work Document * (Image/PDF)</label>
              <input
                type="file"
                id="rightToWork"
                name="rightToWork"
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className="file-input"
                required
                disabled={loading}
              />
              {formData.rightToWork && (
                <div className="file-input-note">✓ {formData.rightToWork.name}</div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="countryOfOrigin">Country of Origin *</label>
                <select
                  id="countryOfOrigin"
                  name="countryOfOrigin"
                  value={formData.countryOfOrigin}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select Country</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  {/* Add more as needed */}
                </select>
              </div>

              <div className="form-group">
                <label>Are you a citizen of your country of operation? *</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <label>
                    <input
                      type="radio"
                      name="isCitizen"
                      value={true}
                      checked={formData.isCitizen === true}
                      onChange={() => setFormData(prev => ({ ...prev, isCitizen: true }))}
                      disabled={loading}
                    /> Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="isCitizen"
                      value={false}
                      checked={formData.isCitizen === false}
                      onChange={() => setFormData(prev => ({ ...prev, isCitizen: false }))}
                      disabled={loading}
                    /> No
                  </label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="homeworkExperience">Job Experience *</label>
              <textarea
                id="homeworkExperience"
                name="homeworkExperience"
                value={formData.homeworkExperience}
                onChange={handleInputChange}
                placeholder="List past jobs, skills, and years of experience..."
                rows="3"
                required
                disabled={loading}
              />
            </div>

            

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit for Approval'}
            </button>

            <p className="terms-text">
              By submitting, you agree to our Terms of Service and Privacy Policy.<br />
              Your account will be reviewed by admin before activation.
            </p>
          </form>
        </div>

        <style jsx>{`
          /* Reuse your existing styles */
          .modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(2px);
          }

          .modal-container {
            background: white;
            border-radius: 16px;
            width: 90%;
            max-width: 700px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: modalSlideIn 0.3s ease-out;
          }

          @keyframes modalSlideIn {
            from { opacity: 0; transform: translateY(-30px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

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

          .modal-header h2 { margin: 0; font-size: 24px; font-weight: 700; }
          .close-btn { background: none; border: none; font-size: 28px; color: white; cursor: pointer; }

          .signup-form { padding: 32px; }
          .form-row { display: flex; gap: 20px; margin-bottom: 20px; }
          .form-row .form-group { flex: 1; }
          .form-group { margin-bottom: 24px; }
          .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #374151; font-size: 14px; }
          .form-group input, .form-group textarea, .form-group select {
            width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px;
            font-size: 16px; transition: border-color 0.3s ease, box-shadow 0.3s ease; box-sizing: border-box;
          }
          .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
            outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
          .form-group textarea { resize: vertical; min-height: 100px; font-family: inherit; }
          .file-input { padding: 8px !important; background-color: #f9fafb; border: 2px dashed #d1d5db !important; cursor: pointer; }
          .file-input:hover { border-color: #667eea !important; background-color: #f0f2ff; }
          .file-input-note { font-size: 12px; color: #6b7280; margin-top: 4px; font-style: italic; }
          .submit-btn {
            width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; border: none; padding: 16px 24px; border-radius: 12px;
            font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;
          }
          .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4); }
          .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
          .terms-text { text-align: center; font-size: 12px; color: #6b7280; margin-top: 16px; line-height: 1.4; }

          @media (max-width: 768px) {
            .form-row { flex-direction: column; gap: 0; }
            .modal-container { width: 95%; max-height: 85vh; }
          }
        `}</style>
      </div>
    </>
  );
};

export default ServiceProviderSignup;