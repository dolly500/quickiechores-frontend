import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import LandingPage from "../src/Landing/Landingpage";
import Home from "./Pages/Home/Home";
import Footer from "./Components/Footer/Footer";
import AuthPage from "./Pages/Auth/AuthPage";
import Profile from "./Pages/Profile/Profile";
import Services from "./Pages/Services/Services";
import Category from "./Pages/Category/Category";
import CategoryServices from "./Components/CategoryService/CategoryService";
import SearchResults from "./Pages/SearchResults/SearchResults";
import ProviderLogin from "./ServiceProviders/ProviderLogin/ProviderLogin";
import ProtectedRoute from "../src/Components/ProtectedRoutes/ProtectedRoute";
import ProviderLayout from "../src/ServiceProviders/ProviderLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ServiceDetails from './Pages/Booking/ServiceDetailPage'
import MyBookings from './Pages/Booking/BookingForm'
import BookingHistory from './Pages/BookingHistory/BookingHistory';
import PayPalSuccessPage from "./Pages/PaypalSuccesspage/PaypalSuccessPage"
import AllPosts from "./Pages/Posts/AllPosts"
import ConfirmBooking from "./Pages/ConfirmBooking/ConfirmBooking";
import ReviewPage from "./Pages/Review/Review"


const App = () => {
  const location = useLocation();

  const isProviderDashboard =
    location.pathname.startsWith("/provider") &&
    location.pathname !== "/providerlogin";

  if (isProviderDashboard) {
    return (
      <div className="app">
        <Routes>
          <Route
            path="/provider/*"
            element={
              <ProtectedRoute requiredRole="serviceProvider">
                <ProviderLayout />
              </ProtectedRoute>
            }
          />
        </Routes>

        <ToastContainer position="top-center" autoClose={2000} />
      </div>
    );
  }

  // Normal routes with Navbar + Footer
  return (
    <div
      className="app"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <div style={{ padding: "0px 5px" }}>
        <Navbar />
      </div>

      {/* main content grows to push footer down */}
      <div style={{ flex: "1" }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/services" element={<Services />} />
          <Route path="/searchservices" element={<SearchResults />} />
          <Route path="/categories" element={<Category />} />
          <Route path="/allposts" element={<AllPosts />} />
          <Route path="/category/:categoryName" element={<CategoryServices />} />
          <Route path="/providerlogin" element={<ProviderLogin />} />
          <Route path="/service/:id" element={<ServiceDetails />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/booking-history" element={<BookingHistory />} />
          <Route path="/booking/:bookingId/confirm" element={<ConfirmBooking />} />
          <Route path="/payment/paypal/success" element={<PayPalSuccessPage />} />
          <Route path="/review" element={<ReviewPage />} />
        </Routes>
      </div>

      <Footer />

      {/* Toast notifications */}
      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default App;
