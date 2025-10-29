// frontend/src/App.jsx

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard"; // Import Dashboard
import CourseDetail from "./components/CourseDetail"; // Import CourseDetail
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute
import { useAuth } from "./context/AuthContext";
import "./App.css";

function App() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <Router>
      <nav className="navbar">
        <h2>Knowledge Delivery Platform</h2>
        <div className="nav-links">
          {!isAuthenticated ? (
            <>
              <Link to="/register">Register</Link>
              <Link to="/login">Login</Link>
            </>
          ) : (
            <button onClick={logout} className="logout-btn">Logout</button>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/course/:id" element={<CourseDetail />} /> 
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;