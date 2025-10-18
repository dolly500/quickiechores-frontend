import PropTypes from "prop-types";

const ProviderInfoCard = ({ providerData }) => (
  <div className="provider-info-card">
    <h3>Chores Helper Information</h3>
    <div className="info-item">
      <span className="info-label">Email</span>
      <span className="info-value">{providerData?.email}</span>
    </div>
    <div className="info-item">
      <span className="info-label">Phone</span>
      <span className="info-value">{providerData?.phone}</span>
    </div>
    <div className="info-item">
      <span className="info-label">Name</span>
      <span className="info-value">{providerData?.businessName}</span>
    </div>
    <div className="info-item">
      <span className="info-label">Chore Type</span>
      <span className="info-value">{providerData?.name}</span>
    </div>
    <div className="info-item">
      <span className="info-label">Status</span>
      <div className="status-container">
        <span className={`status-badge ${providerData?.isApproved ? 'approved' : 'pending'}`}>
          {providerData?.isApproved ? 'Approved' : 'Pending Approval'}
        </span>
        <span className={`status-badge ${providerData?.isActive ? 'active' : 'inactive'}`}>
          {providerData?.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
    <div className="info-item">
      <span className="info-label">Member Since</span>
      <span className="info-value">
        {providerData?.createdAt && new Date(providerData.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </span>
    </div>
  </div>
);

ProviderInfoCard.propTypes = {
  providerData: PropTypes.shape({
    _id: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    businessName: PropTypes.string,
    name: PropTypes.string,
    isApproved: PropTypes.bool,
    isActive: PropTypes.bool,
    createdAt: PropTypes.string,
  }),
};

ProviderInfoCard.defaultProps = {
  providerData: null,
};

const BusinessInfoCard = ({ providerData }) => (
  <div className="business-info-card">
    <h3>Chores Helper Information</h3>
    <div className="info-grid">
      <div>
        <span className="info-label">Address</span>
        <span className="info-value">{providerData?.businessAddress}</span>
      </div>
      <div>
        <span className="info-label">Description</span>
        <span className="info-value">{providerData?.businessDescription}</span>
      </div>
    </div>
  </div>
);

BusinessInfoCard.propTypes = {
  providerData: PropTypes.shape({
    businessAddress: PropTypes.string,
    businessDescription: PropTypes.string,
    profileImage: PropTypes.string,
  }),
};

BusinessInfoCard.defaultProps = {
  providerData: null,
};

const ProviderDashboard = ({ providerData }) => {
  return (
    <div>
      <style>
        {`
          :root {
            --primary-color: #667eea;
            --text-color: #2d3748;
            --bg-color: #fff;
            --card-bg: #ffffff;
            --border-color: #e2e8f0;
          }

          .header {
            background-color: var(--card-bg);
            padding: 20px 30px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 30px;
          }

          .header h1 {
            font-size: 24px;
            font-weight: 600;
            color: var(--text-color);
            margin: 0 0 5px 0;
          }

          .header p {
            color: #718096;
            margin: 0;
          }

          .provider-info-card, .business-info-card {
            background-color: var(--card-bg);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 30px;
          }

          .provider-info-card h3, .business-info-card h3 {
            color: var(--text-color);
            margin: 0 0 20px 0;
            font-size: 20px;
          }

          .info-item {
            margin-bottom: 15px;
          }

          .info-label {
            font-size: 12px;
            font-weight: 500;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            display: block;
            margin-bottom: 4px;
          }

          .info-value {
            font-size: 14px;
            color: var(--text-color);
            font-weight: 500;
          }

          .status-container {
            display: flex;
            gap: 8px;
          }

          .status-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
          }

          .approved { background-color: #c6f6d5; color: #276749; }
          .pending { background-color: #fed7d7; color: #c53030; }
          .active { background-color: #bee3f8; color: #2a69ac; }
          .inactive { background-color: var(--border-color); color: #4a5568; }

          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
          }

          .profile-image {
            max-width: 150px;
            height: auto;
            border-radius: 8px;
            border: 1px solid var(--border-color);
          }
        `}
      </style>
      <div className="header">
        <h1>Welcome, {providerData?.businessName}!</h1>
        <p style={{color: 'white'}}>Chores Provider Dashboard</p>
      </div>
      <ProviderInfoCard providerData={providerData} />
      <BusinessInfoCard providerData={providerData} />
    </div>
  );
};

ProviderDashboard.propTypes = {
  providerData: PropTypes.object,
};

export default ProviderDashboard;