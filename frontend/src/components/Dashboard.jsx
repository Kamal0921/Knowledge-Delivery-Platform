// frontend/src/components/Dashboard.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import CourseList from './CourseList';
import CreateCourse from './CreateCourse';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <h2>Welcome to your Dashboard, {user.role}!</h2>
      <p>Your user ID is: {user.id}</p>
      
      {/* Admin/Instructor Feature */}
      {(user.role === 'admin' || user.role === 'instructor') && (
        <CreateCourse />
      )}

      {/* Student/All Users Feature */}
      <CourseList />
    </div>
  );
}

export default Dashboard;