import { useContext, useState, useEffect } from "react";
import "./Navbar.css";
import { assets } from "../../assets/frontend_assets/assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../context/storeContext";
import ServiceProviderSignup from "../../ServiceProviders/ServiceSignup";

const Navbar = () => {
  const [menu, setMenu] = useState("Home");
  const [isServiceProviderModalOpen, setIsServiceProviderModalOpen] = useState(false);
  const [isServiceProvider, setIsServiceProvider] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on landing page
  const isLandingPage = location.pathname === "/" || location.pathname === "/landing";
  const isHomePage = location.pathname === "/home";
  
  // Check if we're on pages that should show nav links
  const showNavLinksPages = [
    "/home", "/categories", "/services", "/allposts", "/booking-history"
  ].includes(location.pathname);
  
  // Check if user is authenticated (either as customer or service provider)
  const isAuthenticated = token || isServiceProvider;

  useEffect(() => {
    const serviceProviderToken = localStorage.getItem("serviceProviderToken");
    setIsServiceProvider(!!serviceProviderToken);
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("serviceProviderToken");
    setToken("");
    setIsServiceProvider(false);
    navigate("/");
    setIsMenuOpen(false);
  };

  const openServiceProviderModal = () => {
    setIsServiceProviderModalOpen(true);
    setIsMenuOpen(false);
  };

  const closeServiceProviderModal = () => {
    setIsServiceProviderModalOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClick = (menuItem) => {
    setMenu(menuItem);
    setIsMenuOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className="navbar">
        <Link to="/home">
          <img src={assets.logo} alt="QuickieChores" className="logo" height="65vh" width="30vw" />
        </Link>
        
        {/* Desktop Navigation - Show on specific pages */}
        <div className="desktop-nav">
          {(isLandingPage || showNavLinksPages) && (
            <div className="nav-links">
              {(isHomePage || isLandingPage || showNavLinksPages) && (
                <>
                  <Link
                    to="/categories"
                    onClick={() => handleMenuClick("Categories")}
                    className={menu === "Categories" ? "active" : ""}
                  >
                     Chores Categories
                  </Link>
                  <Link
                    to="/services"
                    onClick={() => handleMenuClick("Services")}
                    className={menu === "Services" ? "active" : ""}
                  >
                     Chores
                  </Link>
                  <Link
                    to="/allposts"
                    onClick={() => handleMenuClick("Posts")}
                    className={menu === "Posts" ? "active" : ""}
                  >
                    Posts
                  </Link>
                  
                  {/* Only show Chores Booking History when authenticated and not service provider */}
                  {isAuthenticated && token && !isServiceProvider && (
                    <>
                    <Link
                      to="/booking-history"
                      onClick={() => handleMenuClick("BookingHistory")}
                      className={menu === "BookingHistory" ? "active" : ""}
                    >
                      Chores Booking History
                    </Link>
                   
                    </>
                  )}
                   <Link
                      to="/review"
                      className={menu === "BookingHistory" ? "active" : ""}
                    >
                      Send Booking Reviews
                    </Link>
                </>
              )}
            </div>
          )}
          
          {/* Desktop Auth Buttons - Show on landing page OR when not authenticated */}
          {(isLandingPage || !isAuthenticated) && (
            <div className="desktop-auth">
               <button 
                className="auth-btn customer-btn"
                onClick={() => navigate('/auth')}
              >
                Sign in as Customer
              </button>
              <button 
                className="auth-btn provider-btn"
                onClick={() => navigate('/providerlogin')}
              >
                Sign in as Quickie Helper
              </button>
            </div>
          )}

          {/* Desktop Profile - Show when authenticated and not on landing page */}
          {!isLandingPage && isAuthenticated && (
            <div className="desktop-profile">
              <div className="profile-dropdown">
                <div className="profile-trigger">
                  <img src={assets.profile_icon} alt="" />
                  <span>My Account</span>
                </div>
                <div className="profile-dropdown-content">
                  <div onClick={() => handleNavigation('/profile')} className="profile-item">
                    <img src={assets.profile_icon} alt="" />
                    <p>My Profile</p>
                  </div>
                  
                  {isServiceProvider ? (
                    <>
                      <div onClick={() => handleNavigation('/my-services')} className="profile-item">
                        <img src={assets.bag_icon} alt="" />
                        <p>My Chores</p>
                      </div>
                      <div onClick={() => handleNavigation('/chores-bookings')} className="profile-item">
                        <img src={assets.bag_icon} alt="" />
                        <p>Chores Bookings</p>
                      </div>
                      <div onClick={() => handleNavigation('/service-history')} className="profile-item">
                        <img src={assets.bag_icon} alt="" />
                        <p>Chores History</p>
                      </div>
                      <div onClick={() => handleNavigation('/review')} className="profile-item">
                        <img src={assets.bag_icon} alt="" />
                        <p>send booking reviews</p>
                      </div>
                    </>
                  ) : (
                   <></>
                  )}
                  
                  <div onClick={handleLogout} className="profile-item logout">
                    <img src={assets.logout_icon} alt="" />
                    <p>Logout</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Hamburger Menu Button - Show on mobile */}
        <div className="hamburger-menu" onClick={toggleMenu}>
          <div className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`menu-overlay ${isMenuOpen ? 'active' : ''}`}>
          <div className="menu-content">
            {/* Navigation Links */}
            <div className="menu-navigation">
              <Link
                to="/home"
                onClick={() => handleMenuClick("Home")}
                className={menu === "Home" ? "active" : ""}
              >
                Home
              </Link>
              <Link
                to="/categories"
                onClick={() => handleMenuClick("Categories")}
                className={menu === "Categories" ? "active" : ""}
              >
                 Chores Categories
              </Link>
              <Link
                to="/services"
                onClick={() => handleMenuClick("Services")}
                className={menu === "Services" ? "active" : ""}
              >
                 Chores
              </Link>
              <Link
                to="/allposts"
                onClick={() => handleMenuClick("Posts")}
                className={menu === "Posts" ? "active" : ""}
              >
                 Posts
              </Link>
              <Link
                to="/review"
                className={menu === "Posts" ? "active" : ""}
              >
                 Send Booking Reviews
              </Link>
            </div>
            {/* User Profile Section */}
            <div className="menu-user-section">
              {isAuthenticated ? (
                <div className="menu-profile">
                  <div className="profile-header">
                    <img src={assets.profile_icon} alt="" />
                    <span>My Account</span>
                  </div>
                  
                  <div className="profile-menu">
                    <div onClick={() => handleNavigation('/profile')} className="profile-item">
                      <img src={assets.profile_icon} alt="" />
                      <p>My Profile</p>
                    </div>
                    
                    {isServiceProvider ? (
                      <>
                        <div onClick={() => handleNavigation('/my-services')} className="profile-item">
                          <img src={assets.bag_icon} alt="" />
                          <p>My Chores</p>
                        </div>
                        <div onClick={() => handleNavigation('/chores-bookings')} className="profile-item">
                          <img src={assets.bag_icon} alt="" />
                          <p>Chores Bookings</p>
                        </div>
                        <div onClick={() => handleNavigation('/service-history')} className="profile-item">
                          <img src={assets.bag_icon} alt="" />
                          <p>Service History</p>
                        </div>
                      </>
                    ) : (
                      <div onClick={() => handleNavigation('/booking-history')} className="profile-item">
                        <img src={assets.bag_icon} alt="" />
                        <p>Chores Booking History</p>
                      </div>
                    )}
                    
                    <div onClick={handleLogout} className="profile-item logout">
                      <img src={assets.logout_icon} alt="" />
                      <p>Logout</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="menu-auth-buttons">
                  {(isLandingPage || isHomePage) && (
                    <>
                    <button onClick={() => handleNavigation("/auth")}>
                        Sign in as Customer
                      </button>
                      <button onClick={() => handleNavigation("/providerlogin")}>
                        Sign in as Chores Helper
                      </button>                      
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <ServiceProviderSignup 
        isOpen={isServiceProviderModalOpen} 
        onClose={closeServiceProviderModal} 
      />
    </>
  );
};

export default Navbar;