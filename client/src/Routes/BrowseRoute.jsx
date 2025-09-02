import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Dashboard from "../Pages/Dashboard";
import LoginPage from "../Pages/AuthPages/LoginPage";
import SignupPage from "../Pages/AuthPages/SignupPage";
import { checkExistingSession, selectAuthStatus, selectIsLoggedIn } from "../Features/auth/AuthSlice";

function Private({ children }) {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const status = useSelector(selectAuthStatus);
  if (status === "loading") return <div>Checking session...</div>;
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default function BrowseRoute() {
  const dispatch = useDispatch();
  React.useEffect(() => { dispatch(checkExistingSession()); }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/" element={<Private><Dashboard /></Private>} />
    </Routes>
  );
}

