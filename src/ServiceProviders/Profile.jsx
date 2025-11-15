import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import baseUrl from "../../server.js";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    businessName: '',
    businessAddress: '',
    businessDescription: '',
    paypalEmail: '',
    availabilitySettings: {
      workingHours: { startTime: '', endTime: '' },
      maxConcurrentBookings: '',
      autoAcceptBookings: false
    }
  });
  const navigate = useNavigate();

  const getProviderIdFromToken = (token) => {
    try {
      if (!token || typeof token !== 'string' || !token.includes('.')) {
        throw new Error('Invalid token format');
      }
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const tokenData = JSON.parse(decodedPayload);
      return tokenData.id || tokenData.providerId || tokenData.userId || tokenData.sub;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("providerToken");
        const storedProvider = JSON.parse(localStorage.getItem("provider") || '{}');

        // Use stored provider data as a fallback
        if (storedProvider.id && storedProvider.name) {
          setProfile({
            name: storedProvider.name,
            email: storedProvider.email,
            businessName: storedProvider.businessName,
            role: storedProvider.role,
            // Set default values for fields not in localStorage
            phone: '',
            businessAddress: '',
            businessDescription: '',
            profileImage: null,
            isApproved: false,
            isActive: false,
            isVerified: false,
            createdAt: new Date().toISOString(),
            availabilitySettings: {
              workingHours: { startTime: '', endTime: '' },
              maxConcurrentBookings: '',
              autoAcceptBookings: false
            }
          });
          setFormData({
            name: storedProvider.name || '',
            phone: '',
            businessName: storedProvider.businessName || '',
            businessAddress: '',
            businessDescription: '',
            availabilitySettings: {
              workingHours: { startTime: '', endTime: '' },
              maxConcurrentBookings: '',
              autoAcceptBookings: false
            }
          });
        }

        if (!token || token.split('.').length !== 3) {
          setError("Invalid token. Please login again.");
          localStorage.removeItem("providerToken");
          localStorage.removeItem("providerId");
          localStorage.removeItem("provider");
          navigate('/login', { replace: true });
          return;
        }

        if (isTokenExpired(token)) {
          setError("Session expired. Please login again.");
          localStorage.removeItem("providerToken");
          localStorage.removeItem("providerId");
          localStorage.removeItem("provider");
          navigate('/login', { replace: true });
          return;
        }

        const providerId = storedProvider.id || localStorage.getItem("providerId") || getProviderIdFromToken(token);
        if (!providerId) {
          setError("Provider ID not found. Please login again.");
          navigate('/login', { replace: true });
          return;
        }

        const response = await fetch(`${baseUrl}/api/auth/provider/profile/${providerId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          setError("Session expired. Please login again.");
          localStorage.removeItem("providerToken");
          localStorage.removeItem("providerId");
          localStorage.removeItem("provider");
          navigate('/login', { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Profile API response:', data);

        if (data.success && data.provider) {
          setProfile(data.provider);
          setFormData({
            name: data.provider.name ?? storedProvider.name ?? '',
            phone: data.provider.phone ?? '',
            businessName: data.provider.businessName ?? storedProvider.businessName ?? '',
            businessAddress: data.provider.businessAddress ?? '',
            businessDescription: data.provider.businessDescription ?? '',
            availabilitySettings: {
              workingHours: data.provider.availabilitySettings?.workingHours ?? { startTime: '', endTime: '' },
              maxConcurrentBookings: data.provider.availabilitySettings?.maxConcurrentBookings ?? '',
              autoAcceptBookings: data.provider.availabilitySettings?.autoAcceptBookings ?? false
            }
          });
        } else {
          throw new Error(data.message || "Failed to fetch profile");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message);
        // If there's stored provider data, keep it as a fallback
        if (!JSON.parse(localStorage.getItem("provider") || '{}').id) {
          navigate('/login', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvailabilityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      availabilitySettings: {
        ...prev.availabilitySettings,
        [name]: type === 'checkbox' ? checked : value,
        ...(name === 'startTime' || name === 'endTime'
          ? { workingHours: { ...prev.availabilitySettings.workingHours, [name]: value } }
          : {})
      }
    }));
  };

  const handleUpdateProfile = async () => {
    if (!formData.name || !formData.businessName) {
      alert("Name and Chore Helper Name are required.");
      return;
    }

    setUpdateLoading(true);
    try {
      const token = localStorage.getItem("providerToken");
      const storedProvider = JSON.parse(localStorage.getItem("provider") || '{}');

      if (!token || isTokenExpired(token)) {
        throw new Error("Session expired. Please login again.");
      }

      const providerId = storedProvider.id || localStorage.getItem("providerId") || getProviderIdFromToken(token);
      if (!providerId) {
        throw new Error("Provider ID not found. Please login again.");
      }

      const response = await fetch(`${baseUrl}/api/auth/provider/profile/${providerId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 401) {
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setProfile(data.provider);
        setIsEditing(false);
        // Update localStorage with new provider data
        localStorage.setItem("provider", JSON.stringify({
          id: providerId,
          name: data.provider.name,
          email: data.provider.email,
          businessName: data.provider.businessName,
          role: data.provider.role || storedProvider.role
        }));
        alert("Profile updated successfully!");
      } else {
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert(`Error updating profile: ${err.message}`);
      if (err.message.includes("Session expired")) {
        localStorage.removeItem("providerToken");
        localStorage.removeItem("providerId");
        localStorage.removeItem("provider");
        navigate('/login', { replace: true });
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        name: profile.name ?? '',
        phone: profile.phone ?? '',
        businessName: profile.businessName ?? '',
        businessAddress: profile.businessAddress ?? '',
        businessDescription: profile.businessDescription ?? '',
        availabilitySettings: {
          workingHours: profile.availabilitySettings?.workingHours ?? { startTime: '', endTime: '' },
          maxConcurrentBookings: profile.availabilitySettings?.maxConcurrentBookings ?? '',
          autoAcceptBookings: profile.availabilitySettings?.autoAcceptBookings ?? false
        }
      });
    } else {
      const storedProvider = JSON.parse(localStorage.getItem("provider") || '{}');
      setFormData({
        name: storedProvider.name || '',
        phone: '',
        businessName: storedProvider.businessName || '',
        businessAddress: '',
        businessDescription: '',
        availabilitySettings: {
          workingHours: { startTime: '', endTime: '' },
          maxConcurrentBookings: '',
          autoAcceptBookings: false
        }
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProfileImageUrl = (profileImage) => {
    if (!profileImage) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiByeD0iNjAiIGZpbGw9IiNGN0ZBRkMiLz4KPHBhdGggZD0iTTYwIDMwQzQ5Ljk1IDMwIDQyIDM3Ljk1IDQyIDQ4QzQyIDU4LjA1IDQ5Ljk1IDY2IDYwIDY2QzcwLjA1IDY2IDc4IDU4LjA1IDc4IDQ4Qzc4IDM3Ljk1IDcwLjA1IDMwIDYwIDMwWiIgZmlsbD0iI0U5RDhGRCIvPgo8cGF0aCBkPSJNNjAgNzJDNDMuNDMgNzIgMzAgODUuNDMgMzAgMTAyVjEwOEg5MFYxMDJDOTAgODUuNDMgNzYuNTcgNzIgNjAgNzJaIiBmaWxsPSIjRTlEOEZEIi8+Cjwvc3ZnPgo=';
    }
    return `${baseUrl}/uploads/${profileImage}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Profile</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="error-container">
        <h2>Profile Not Found</h2>
        <p>Unable to load profile information.</p>
        <button onClick={() => navigate('/login', { replace: true })} className="retry-btn">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
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

          .profile-container {
            padding: 20px;
            background-color: var(--bg-color);
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }

          .profile-header {
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .profile-header h1 {
            color: var(--text-color);
            font-size: 28px;
            margin: 0;
            font-weight: 600;
          }

          .profile-header p {
            color: var(--text-muted);
            font-size: 16px;
            margin: 5px 0 0 0;
          }

          .edit-toggle-btn {
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background-color 0.2s;
          }

          .edit-toggle-btn:hover {
            background-color: #5a6fd8;
          }

          .profile-content {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 30px;
          }

          .profile-sidebar {
            background: var(--card-bg);
            border-radius: 12px;
            border: 1px solid var(--border-color);
            padding: 30px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            height: fit-content;
          }

          .profile-image-container {
            text-align: center;
            margin-bottom: 30px;
          }

          .profile-image {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid var(--border-color);
            margin-bottom: 15px;
          }

          .profile-name {
            font-size: 24px;
            font-weight: 600;
            color: var(--text-color);
            margin: 0 0 5px 0;
          }

          .profile-email {
            color: var(--text-muted);
            font-size: 16px;
            margin: 0;
          }

          .status-badges {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 20px;
          }

          .status-badge {
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-align: center;
          }

          .status-approved {
            background-color: #c6f6d5;
            color: var(--success-color);
          }

          .status-not-approved {
            background-color: #fed7d7;
            color: var(--danger-color);
          }

          .status-active {
            background-color: #c6f6d5;
            color: var(--success-color);
          }

          .status-inactive {
            background-color: #fed7d7;
            color: var(--danger-color);
          }

          .status-verified {
            background-color: #bee3f8;
            color: var(--info-color);
          }

          .status-not-verified {
            background-color: #fef5e7;
            color: var(--warning-color);
          }

          .profile-main {
            background: var(--card-bg);
            border-radius: 12px;
            border: 1px solid var(--border-color);
            padding: 30px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .section-title {
            font-size: 20px;
            font-weight: 600;
            color: var(--text-color);
            margin: 0 0 20px 0;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--border-color);
          }

          .form-section {
            margin-bottom: 30px;
          }

          .form-section:last-child {
            margin-bottom: 0;
          }

          .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }

          .form-group {
            margin-bottom: 20px;
          }

          .form-group.full-width {
            grid-column: 1 / -1;
          }

          .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: var(--text-color);
            font-size: 14px;
          }

          .form-input, .form-textarea {
            width: 100%;
            max-width: 100%;
            padding: 12px 16px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-size: 16px;
            font-family: inherit;
            transition: border-color 0.2s, box-shadow 0.2s;
            box-sizing: border-box;
          }

          .form-input:focus, .form-textarea:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }

          .form-input:read-only {
            background-color: var(--bg-color);
            color: var(--text-muted);
          }

          .form-textarea {
            resize: vertical;
            min-height: 100px;
          }

          .form-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid var(--border-color);
          }

          .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .btn-primary {
            background-color: var(--primary-color);
            color: white;
          }

          .btn-primary:hover:not(:disabled) {
            background-color: #5a6fd8;
          }

          .btn-secondary {
            background-color: var(--bg-color);
            color: var(--text-color);
            border: 1px solid var(--border-color);
          }

          .btn-secondary:hover:not(:disabled) {
            background-color: var(--hover-color);
          }

          .info-display {
            background-color: var(--bg-color);
            padding: 12px 16px;
            border-radius: 8px;
            color: var(--text-color);
            font-size: 16px;
            border: 1px solid var(--border-color);
          }

          .availability-section {
            background-color: var(--bg-color);
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
          }

          .availability-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }

          .availability-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid var(--border-color);
          }

          .availability-item:last-child {
            border-bottom: none;
          }

          .availability-label {
            font-weight: 500;
            color: var(--text-color);
          }

          .availability-value {
            color: var(--text-muted);
          }

          .loading-container, .error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            background-color: var(--card-bg);
            border-radius: 12px;
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

          .member-since {
            color: var(--text-muted);
            font-size: 14px;
            margin-top: 15px;
            text-align: center;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @media (max-width: 768px) {
            .profile-content {
              grid-template-columns: 1fr;
              gap: 20px;
            }
            
            .form-grid {
              grid-template-columns: 1fr;
              gap: 15px;
            }
            
            .form-actions {
              flex-direction: column-reverse;
            }
            
            .profile-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 15px;
            }
          }
        `}
      </style>

      <div className="profile-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your profile information and settings</p>
        </div>
        {!isEditing && (
          <button 
            className="edit-toggle-btn"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-image-container">
            <img 
              src={getProfileImageUrl(profile.profileImage)}
              alt={profile.name}
              className="profile-image"
              onError={(e) => {
                e.target.src = getProfileImageUrl(null);
              }}
            />
            <h2 className="profile-name">{profile.name}</h2>
            <p className="profile-email">{profile.email}</p>
          </div>

          <div className="status-badges">
            <div className={`status-badge ${profile.isApproved ? 'status-approved' : 'status-not-approved'}`}>
              {profile.isApproved ? 'Approved' : 'Pending Approval'}
            </div>
            <div className={`status-badge ${profile.isActive ? 'status-active' : 'status-inactive'}`}>
              {profile.isActive ? 'Active' : 'Inactive'}
            </div>
            {/* <div className={`status-badge ${profile.isVerified ? 'status-verified' : 'status-not-verified'}`}>
              {profile.isVerified ? 'Verified' : 'Not Verified'}
            </div> */}
          </div>

          <div className="member-since">
            Member since {formatDate(profile.createdAt)}
          </div>
        </div>

        <div className="profile-main">
          <div className="form-section">
            <h3 className="section-title">Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your full name"
                    required
                  />
                ) : (
                  <div className="info-display">{profile.name}</div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="info-display">{profile.email}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="info-display">{profile.phone || 'Not set'}</div>
                )}
              </div>

              <div className="form-group">
  <label className="form-label">PayPal Email</label>
  {isEditing ? (
    <input
      type="email"
      name="paypalEmail"
      value={formData.paypalEmail}
      onChange={handleInputChange}
      className="form-input"
      placeholder="Enter your PayPal email"
    />
  ) : (
    <div className="info-display">{profile.paypalEmail || 'Not set'}</div>
  )}
</div>

            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Business Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Chore Helper Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter Chore Helper Name"
                    required
                  />
                ) : (
                  <div className="info-display">{profile.businessName}</div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Chore Helper Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your business address"
                  />
                ) : (
                  <div className="info-display">{profile.businessAddress || 'Not set'}</div>
                )}
              </div>
              <div className="form-group full-width">
                <label className="form-label"> Description</label>
                {isEditing ? (
                  <textarea
                    name="businessDescription"
                    value={formData.businessDescription}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Describe your business..."
                    rows="4"
                  />
                ) : (
                  <div className="info-display">{profile.businessDescription || 'Not set'}</div>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Availability Settings</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Start Time</label>
                {isEditing ? (
                  <input
                    type="time"
                    name="startTime"
                    value={formData.availabilitySettings.workingHours.startTime}
                    onChange={handleAvailabilityChange}
                    className="form-input"
                  />
                ) : (
                  <div className="info-display">{profile.availabilitySettings?.workingHours?.startTime || 'Not set'}</div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                {isEditing ? (
                  <input
                    type="time"
                    name="endTime"
                    value={formData.availabilitySettings.workingHours.endTime}
                    onChange={handleAvailabilityChange}
                    className="form-input"
                  />
                ) : (
                  <div className="info-display">{profile.availabilitySettings?.workingHours?.endTime || 'Not set'}</div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Max Concurrent Bookings</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="maxConcurrentBookings"
                    value={formData.availabilitySettings.maxConcurrentBookings}
                    onChange={handleAvailabilityChange}
                    className="form-input"
                    min="1"
                  />
                ) : (
                  <div className="info-display">{profile.availabilitySettings?.maxConcurrentBookings || 'Not set'}</div>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleCancelEdit}
                disabled={updateLoading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleUpdateProfile}
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <>
                    <div className="mini-spinner"></div>
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;