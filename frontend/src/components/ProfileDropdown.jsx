// frontend/src/components/ProfileDropdown.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProfileDropdown.css'; // Import our new CSS

function ProfileDropdown() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Helper to get initials from name or email
 const getInitials = () => {
    if (!user) return '?';

    // 1. Try to use user.name
    if (user.name && user.name.length > 0) {
      const parts = user.name.split(' ');
      const first = parts[0][0] || '';
      const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
      return (first + last).toUpperCase();
    }
    
    // 2. Fallback to user.email
    if (user.email && user.email.length > 0) {
      return (user.email[0] || '?').toUpperCase();
    }
    
    // 3. Absolute fallback
    return '?';
  };

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean-up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

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
        
        {/* Header with user info */}
        <div className="dropdown-header">
          <div className="dropdown-header-avatar">{getInitials()}</div>
          <div className="dropdown-header-info">
            <strong>{user.name || 'User'}</strong>
            <span>{user.email || 'No email'}</span>
          </div>
        </div>
        
        {/* Role-Based Links */}
        <div className="dropdown-section">
          {user.role === 'student' && (
            <Link to="/dashboard" className="dropdown-item" onClick={() => setIsOpen(false)}>
              My Learning
            </Link>
          )}
          {user.role === 'instructor' && (
            <Link to="/dashboard" className="dropdown-item" onClick={() => setIsOpen(false)}>
              Instructor Dashboard
            </Link>
          )}
          {user.role === 'admin' && (
            <>
              <Link to="/dashboard" className="dropdown-item" onClick={() => setIsOpen(false)}>
                Admin Dashboard
              </Link>
              {/* This link already exists in CourseList, but good to have here too */}
              <Link to="/dashboard" className="dropdown-item" onClick={() => setIsOpen(false)}> 
                Create Course
              </Link>
            </>
          )}
        </div>

        {/* General Links for All */}
        <div className="dropdown-section">
          <Link to="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
            Account Settings
          </Link>
          {/* Add more links here like "Purchase History" if you build them */}
        </div>
        
        {/* Logout Button */}
        <div className="dropdown-section">
          <button onClick={logout} className="dropdown-logout">
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileDropdown;