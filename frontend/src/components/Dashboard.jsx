// frontend/src/components/Dashboard.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CourseList from './CourseList';
import CreateCourse from './CreateCourse';
import EditCourse from './EditCourse';
// Keep EditCourse import

function Dashboard() {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
const [listRefreshTrigger, setListRefreshTrigger] = useState(0);
  const [editingCourse, setEditingCourse] = useState(null);

  // --- ADDED: State for filters ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  // --- END ADD ---

// Callback from CreateCourse
   const handleCourseCreated = (newCourse) => {
     setShowCreate(false);
// Hide create form
     setListRefreshTrigger(prev => prev + 1); // Trigger CourseList refresh
   };
// --- Handlers for Editing Workflow ---
   const handleEditClick = (courseData) => {
       setEditingCourse(courseData);
// Set the state to the course object
       setShowCreate(false);
// Make sure create form is hidden
   };
const handleEditCancel = () => {
       setEditingCourse(null);
// Clear the editing state
   };
   const handleCourseUpdated = (updatedCourse) => {
       setEditingCourse(null);
// Clear the editing state (close the form)
       setListRefreshTrigger(prev => prev + 1);
// Trigger CourseList refresh
   };
   // --- End Handlers ---

   // --- REMOVED: Time-Based Greeting Logic ---
   // const getGreeting = () => { ... };
// const greeting = getGreeting();
   // --- END REMOVAL ---

  return (
    <div className="page-container">

      {/* --- UPDATED WELCOME SECTION --- */}
      <div className="dashboard-header">
        {/* Changed h2 to display "Welcome," */}
        <h2 className="dashboard-greeting">
            Welcome, <span className="user-name">{user?.name || user?.email || 'User'}!</span>
        </h2>
        <p className="dashboard-subheading">Here are the courses available for 
you.</p> {/* Reverted subheading */}
      </div>
      {/* --- END UPDATED WELCOME --- */}


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
      {editingCourse && (user?.role === 'admin' ||
user?.role === 'instructor') && (
          <div className="form-card" style={{marginBottom: '2rem'}}>
              <EditCourse
                  course={editingCourse}
                  onUpdated={handleCourseUpdated}
                  onCancel={handleEditCancel}
              />
 
</div>
      )}

      {/* --- ADDED: Search and Filter UI --- */}
      <div className="filter-container">
        <input
          type="text"
          placeholder="Search by course name..."
          className="filter-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="filter-selects">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Technology">Technology</option>
            <option value="Business">Business</option>
            <option value="Creative Arts">Creative Arts</option>
            <option value="Health & Wellness">Health & Wellness</option>
            <option value="Science">Science</option>
            <option value="Other">Other</option>
          </select>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>
      {/* --- END ADD --- */}

      {/* Course List */}
      <CourseList
          refreshTrigger={listRefreshTrigger}
          onEditClick={handleEditClick}
          searchQuery={searchQuery}
          filterCategory={filterCategory}
          filterDifficulty={filterDifficulty}
      />
    </div>
  );
}

export default Dashboard;