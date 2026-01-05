import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

export default function RoleBasedRoute({ children, allowedRoles = [] }) {
  const user = useSelector((state) => state.user.user);
  const [isChecking, setIsChecking] = useState(true);

  // Wait a tiny moment to allow Redux to rehydrate user from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 1000); // Adjust as needed — 100ms is usually enough

    return () => clearTimeout(timer);
  }, []);

  // Show loading while checking user state
  if (isChecking) {
    return <div>Loading...</div>; // You can use a spinner here if you want
  }

  if (allowedRoles.length === 0) {
    return children;
  }

  if (user && allowedRoles.includes(user.role)) {
    return children;
  }

  return <Navigate to="/not-found" replace />;
}
