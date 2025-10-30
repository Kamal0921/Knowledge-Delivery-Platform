// frontend/src/components/ProfileDropdown.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProfileDropdown.css'; // Import the new CSS

function ProfileDropdown() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Helper to get initials from name or email
  const getInitials = () => {
    if (!user) return '?';
    if (user.name && user.name.length > 0) {
      const parts = user.name.split(' ');
      const first = parts[0][0] || '';
      const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
      return (first + last).toUpperCase();
    }
    if (user.email && user.email.length > 0) {
      return (user.email[0] || '?').toUpperCase();
    }
    return '?';
  };

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Handle logout
  const handleLogout = () => {
    setIsOpen(false); // Close dropdown
    logout(); // Call logout from context
    navigate('/login'); // Redirect to login page
  };

  if (!user) return null; // Don't render if not logged in

  return (
    <div className="profile-dropdown-wrapper" ref={dropdownRef}>
      {/* 1. The Avatar Trigger */}
      <div
        className="profile-avatar-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Account"
      >
        {getInitials()}
      </div>

      {/* 2. The Dropdown Menu */}
      <div className={`dropdown-menu ${isOpen ? 'active' : ''}`}>

        {/* --- Header with user info --- */}
        <div className="dropdown-header">
          <div className="dropdown-header-avatar">{getInitials()}</div>
          <div className="dropdown-header-info">
            <strong>{user.name || 'User'}</strong>
            <span>{user.email || 'No email'}</span>
          </div>
        </div>

        {/* --- Role-Based Links --- */}
        <div className="dropdown-section">
          {user.role === 'student' && (
            <Link to="/dashboard" className="dropdown-item" onClick={() => setIsOpen(false)}>
              My Learning
            </Link>
          )}
          {(user.role === 'admin' || user.role === 'instructor') && (
            <Link to="/dashboard" className="dropdown-item" onClick={() => setIsOpen(false)}>
              Dashboard
            </Link>
          )}
          {/* Add other links like "My Cart" or "Wishlist" here if you build them */}
        </div>

        {/* --- Account Section --- */}
        <div className="dropdown-section">
          <Link to="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
            Account Settings
          </Link>
          {/* Add other links like "Payment Methods" here if you build them */}
        </div>

        {/* --- Logout Button --- */}
        <div className="dropdown-section">
          <button onClick={handleLogout} className="dropdown-logout">
            Log out
          </button>
        </div>

      </div>
    </div>
  );
}

export default ProfileDropdown;