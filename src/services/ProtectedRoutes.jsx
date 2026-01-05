import { Navigate, useNavigate } from "react-router-dom";

import axios from "axios";

import { useDispatch } from "react-redux";
import { login } from "../redux/UserSlice";

import { baseUrl } from "./apis";

import { useEffect } from "react";

export default function ProtectedRoutes({ children }) {
  const isLoggedIn = !!localStorage.getItem("patriaUser"); // or "isLoggedIn"
  const dispatch = useDispatch();
  const navigate = useNavigate();
  async function getUserData() {
    if (!isLoggedIn) return;
    await axios
      .get(`${baseUrl}/auth/getuser/${localStorage.getItem("patriaUser")}`, {
        headers: {
          token: `${localStorage.getItem("PT")}`,
        },
      })
      .then((res) => {
        dispatch(login(res.data));
      })
      .catch(() => {
        localStorage.clear();
        navigate("/login");
      });
  }

  useEffect(() => {
    getUserData();
  }, []);

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return children;
}
