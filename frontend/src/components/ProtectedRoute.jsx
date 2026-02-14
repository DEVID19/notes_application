import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// Wraps any page that needs login.
// If not authenticated → redirect to /login
// If authenticated → render the child page normally
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;