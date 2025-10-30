// frontend/src/components/Dashboard.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CourseList from './CourseList';
import CreateCourse from './CreateCourse';
import EditCourse from './EditCourse'; 

function Dashboard() {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [listRefreshTrigger, setListRefreshTrigger] = useState(0);
  const [editingCourse, setEditingCourse] = useState(null); // Holds course data or null

   const handleCourseCreated = (newCourse) => {
     setShowCreate(false);
     setListRefreshTrigger(prev => prev + 1);
   };

   // --- Handlers for Editing Workflow ---
   const handleEditClick = (courseData) => {
       console.log("handleEditClick called in Dashboard with:", courseData);
       setEditingCourse(courseData); 
       setShowCreate(false); 
   };
   const handleEditCancel = () => {
       setEditingCourse(null); 
   };
   const handleCourseUpdated = (updatedCourse) => {
       setEditingCourse(null); 
       setListRefreshTrigger(prev => prev + 1); 
   };
   // --- End Handlers ---

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h2 className="dashboard-greeting">
            Welcome, <span className="user-name">{user?.name || user?.email || 'User'}!</span>
        </h2>
        <p className="dashboard-subheading">Here are the courses available for you.</p>
      </div>

      {/* Admin Feature: Create Course Button & Form */}
      {user?.role === 'admin' && !editingCourse && (
        <div style={{marginBottom: '1.5rem'}}>
          <button onClick={() => { setShowCreate(s => !s); setEditingCourse(null); }}>
            {showCreate ? 'Cancel Creation' : '+ Create New Course'}
          </button>
        </div>
      )}
      {showCreate && !editingCourse && user?.role === 'admin' && (
        <div className="form-card" style={{marginBottom: '2rem'}}>
          <CreateCourse onCreated={handleCourseCreated} />
        </div>
      )}

      {/* EDIT COURSE FORM */}
      {editingCourse && (user?.role === 'admin' || user?.role === 'instructor') && (
          <div className="form-card" style={{marginBottom: '2rem'}}>
              <EditCourse
                  course={editingCourse}
                  onUpdated={handleCourseUpdated}
                  onCancel={handleEditCancel}
              />
          </div>
      )}

      {/* Course List */}
      <CourseList
          refreshTrigger={listRefreshTrigger}
          onEditClick={handleEditClick} 
      />
    </div>
  );
}

export default Dashboard;