import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

const ProtectedRoute = ({ children, requiredRole }) => {
  let token = null;
  let role = null;

  if (requiredRole === "serviceProvider") {
    token = localStorage.getItem("providerToken");
    const provider = JSON.parse(localStorage.getItem("provider") || "{}");
    role = provider?.role || "serviceProvider";
  } else if (requiredRole === "user") {
    // Check both possible token keys for backward compatibility
    token = localStorage.getItem("userToken") || localStorage.getItem("token");
    role = "user";
  }

  if (!token || role !== requiredRole) {
    return (
      <Navigate
        to={requiredRole === "serviceProvider" ? "/providerlogin" : "/auth"}
        replace
      />
    );
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string.isRequired,
};

export default ProtectedRoute;