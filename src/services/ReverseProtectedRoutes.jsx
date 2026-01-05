import { Navigate } from "react-router-dom";

export default function ReverseProtectedRoutes({ children }) {
  const id = localStorage.getItem("patriaUser");

  if (id) return <Navigate to="/" replace />;

  if (!id) return children;
}
