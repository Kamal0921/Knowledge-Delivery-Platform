// frontend/src/components/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css'; // Import our new CSS

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] =useState(null);
  const { authHeader } = useAuth();

  // Helper to get initials from name or email
  const getInitials = (name, email) => {
    if (name) {
      const parts = name.split(' ');
      const first = parts[0][0] || '';
      const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
      return (first + last).toUpperCase();
    }
    if (email) {
      return (email[0] || '?').toUpperCase();
    }
    return '?';
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: authHeader(),
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch profile data.');
        }
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [authHeader]);

  if (loading) return <p className="page-container">Loading profile...</p>;
  if (error) return <p className="page-container error-message">{error}</p>;
  if (!profile) return <p className="page-container">No profile data found.</p>;

  return (
    <div className="page-container">
      <h2>Account Settings</h2>
      <div className="profile-card">
        <div className="profile-avatar-large">
          {getInitials(profile.name, profile.email)}
        </div>
        
        <h3>{profile.name}</h3>
        <p className="profile-email">{profile.email}</p>
        <span className="profile-role-tag">{profile.role}</span>
        
        <hr className="profile-divider" />
        
        <div className="profile-info">
          <strong>User ID:</strong>
          <span>{profile._id}</span>
        </div>
        <div className="profile-info">
          <strong>Joined:</strong>
          <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;