import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import ProviderDashboard from "./ProviderDashboard";
import ProviderServices from "./ServiceProvidersService";
import BookingsAssigned from "./BookingsAssigned";
import Profile from "./Profile";
import ProviderChat from "./ProviderChat";
import baseUrl from "../../server.js";
import ProviderEarnings from "./ProviderEarnings.jsx";
import Logo from "../assets/frontend_assets/Quickie_Chores-removebg-preview.png"


const Sidebar = ({ onLogout, isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/provider/dashboard' },
    { id: 'services', label: 'Bookings', path: '/provider/services' },
    { id: 'bookings', label: 'Bookings Assigned', path: '/provider/bookings' },
    { id: 'chat', label: 'Chat With Admin', path: '/provider/chat'},
    { id: 'earnings', label: 'Earnings', path: '/provider/earnings'},
    { id: 'profile', label: 'Profile', path: '/provider/profile' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    toggleSidebar(false); // close on navigation (mobile)
  };

  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && <div className="overlay" onClick={() => toggleSidebar(false)}></div>}
      
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <img src={Logo} alt="QuickieChores" height="100px"/>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={location.pathname === item.path ? "active" : ""}
                >
                  {item.label}
                </button>
              </li>
            ))}
            <li>
              <button onClick={onLogout} className="logout-btn">
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

Sidebar.propTypes = {
  onLogout: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

const ProviderLayout = () => {
  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("providerToken");
    localStorage.removeItem("provider");
    navigate("/providerlogin");
  };

  const toggleSidebar = (forceState) => {
    setIsSidebarOpen(prev => typeof forceState === "boolean" ? forceState : !prev);
  };

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        const token = localStorage.getItem("providerToken");
        if (!token) {
          navigate("/providerlogin");
          return;
        }

        const response = await fetch(`${baseUrl}/api/auth/me-service`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (data.success && data.provider) {
          setProviderData(data.provider);
        } else {
          throw new Error("Invalid response format or unauthorized");
        }
      } catch (err) {
        console.error("Provider authentication error:", err);
        setError(err.message);
        localStorage.removeItem("providerToken");
        localStorage.removeItem("provider");
        setTimeout(() => {
          navigate("/providerlogin");
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("providerToken");
    const providerInfo = localStorage.getItem("provider");
    if (!token || !providerInfo) {
      navigate("/providerlogin");
      return;
    }
    try {
      JSON.parse(providerInfo);
    } catch (e) {
      localStorage.removeItem("providerToken");
      localStorage.removeItem("provider");
      navigate("/providerlogin");
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <style>
        {`
          .dashboard-container {
            display: flex;
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }

          .hamburger {
            display: none;
            font-size: 24px;
            background: none;
            border: none;
            margin: 10px;
            cursor: pointer;
            z-index: 1001;
          }

          .sidebar {
            width: 240px;
            background-color: #fff;
            border-right: 1px solid #e2e8f0;
            padding: 20px;
            flex-shrink: 0;
            transition: transform 0.3s ease;
          }

          .sidebar-header h2 {
            font-size: 18px;
            margin: 0 0 16px 0;
          }

          .sidebar-nav ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .sidebar-nav li {
            margin-bottom: 8px;
          }

          .sidebar-nav button {
            width: 100%;
            text-align: left;
            padding: 10px 12px;
            border-radius: 6px;
            border: none;
            background: none;
            cursor: pointer;
            font-size: 15px;
          }

          .sidebar-nav button.active {
            background: #667eea;
            color: #fff;
          }

          .logout-btn {
            color: #e53e3e;
          }

          .main-content {
            flex: 1;
            padding: 20px;
          }

          /* Mobile styles */
          @media (max-width: 768px) {
            .hamburger {
              display: block;
              position: fixed;
              top: 10px;
              left: 10px;
              color: #000000ff;
              border-radius: 6px;
              padding: 6px 10px;
            }

            .sidebar {
              position: fixed;
              top: 0;
              left: 0;
              height: 100%;
              transform: translateX(-100%);
              z-index: 1000;
            }

            .sidebar.open {
              transform: translateX(0);
            }

            .overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0,0,0,0.4);
              z-index: 999;
            }

            .main-content {
              padding: 15px;
              margin-top: 50px;
            }
          }
        `}
      </style>

      {/* Hamburger for mobile (only visible when sidebar is closed) */}
      {!isSidebarOpen && (
        <button className="hamburger" onClick={() => toggleSidebar()}>
          ☰
        </button>
      )}

      <Sidebar onLogout={handleLogout} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <Routes>
          <Route path="/dashboard" element={<ProviderDashboard providerData={providerData} />} />
          <Route path="/services" element={<ProviderServices providerData={providerData} />} />
          <Route path="/bookings" element={<BookingsAssigned providerData={providerData} />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/earnings" element={<ProviderEarnings />} />
          <Route path="/chat" element={<ProviderChat />} />
        </Routes>
      </div>
    </div>
  );
};

export default ProviderLayout;
