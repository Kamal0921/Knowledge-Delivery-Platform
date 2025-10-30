// frontend/src/App.jsx

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Register from "./components/Register"; // Import Register component
import Login from "./components/Login";     // Import Login component
import Dashboard from "./components/Dashboard";
import CourseDetail from "./components/CourseDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import ProfileDropdown from "./components/ProfileDropdown";
import ProfilePage from "./components/ProfilePage"; // Assuming you have this

function App() {
  const { isAuthenticated } = useAuth(); // Get authentication state

  return (
    <Router>
      {/* --- Navbar --- */}
      <nav className="navbar">
        <Link to={isAuthenticated ? "/dashboard" : "/login"} style={{textDecoration: 'none'}}>
          <h2>Knowledge Delivery Platform</h2>
        </Link>
        <div className="nav-links">
          {!isAuthenticated ? (
            <>
              {/* Show Register and Login links only when logged out */}
              <Link to="/register">Register</Link>
              <Link to="/login">Login</Link>
            </>
          ) : (
            // Show Profile Dropdown when logged in
            <ProfileDropdown />
          )}
        </div>
      </nav>

      {/* --- Route Definitions --- */}
      <Routes>
        {/* Public Routes: Accessible when logged out */}
        <Route
          path="/register"
          element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />}
        />

        {/* Protected Routes: Require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* Add other protected routes here */}
        </Route>

        {/* Fallback Route: Redirects based on auth status */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;