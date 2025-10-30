// frontend/src/components/CourseList.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function CourseList({ refreshTrigger, onEditClick }) {
  const [courses, setCourses] = useState([]); // Master list of courses
  const [listError, setListError] = useState(null);
  const { authHeader, user } = useAuth();

  // --- UPDATED: State for Filters ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All'); // New state for category
  // --- END UPDATE ---

  const fetchCourses = useCallback(async () => {
    try {
      setListError(null);
      const response = await fetch('http://localhost:5000/api/courses', {
        method: 'GET',
        headers: user ? authHeader() : { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`Failed to fetch courses (${response.status})`);
      const data = await response.json();
      setCourses(data); // Set the master list
    } catch (err) {
      setListError(err.message);
      console.error("Fetch Courses Error:", err);
    }
  }, [authHeader, user]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses, refreshTrigger]);

  // --- NEW: Dynamically get unique categories from the course list ---
  const uniqueCategories = useMemo(() => {
    // Use a Set to get unique values, handle 'General' default
    const categories = new Set(courses.map(course => course.category || 'General'));
    return ['All', ...Array.from(categories).sort()]; // Return sorted list with 'All' at start
  }, [courses]);
  // --- END NEW ---

  // --- UPDATED: useMemo to process courses ---
  const processedCourses = useMemo(() => {
    let processed = [...courses];

    // 1. Filter by Search Term
    if (searchTerm.trim()) {
      processed = processed.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Filter by Category
    if (selectedCategory !== 'All') {
      processed = processed.filter(course =>
        (course.category || 'General') === selectedCategory // Match category
      );
    }
    
    // 3. Sort (Default A-Z, you can remove this if not needed)
    processed.sort((a, b) => a.title.localeCompare(b.title));

    return processed;
  }, [courses, searchTerm, selectedCategory]); // Update dependencies
  // --- END UPDATE ---


  const handleEnroll = async (courseId) => {
     if (!courseId) { setListError("Cannot enroll: Course ID is missing."); return; }
     try {
       setListError(null);
       if (!user || (user.role !== 'admin' && user.role !== 'instructor')) { alert('Only admin or instructor can enroll students.'); return; }
       const studentId = window.prompt('Enter the student ID to enroll:');
       if (!studentId) return;
       const headers = { ...authHeader(), 'Content-Type': 'application/json' };
       const response = await fetch(`http://localhost:5000/api/courses/${courseId}/enroll`, { method: 'PUT', headers, body: JSON.stringify({ studentId }) });
       const data = await response.json().catch(() => ({}));
       if (!response.ok) throw new Error(data.error || data.message || 'Enrollment failed');
       alert('Student enrolled successfully!');
       fetchCourses(); 
     } catch (err) { setListError(`Enrollment Error: ${err.message}`); }
  };

  const handleDelete = async (courseId, courseTitle) => {
      if (!courseId) { setListError("Cannot delete: Course ID is missing."); return; }
      if (!window.confirm(`Are you sure you want to delete the course "${courseTitle || 'this course'}"? This action cannot be undone.`)) { return; }
      try {
          setListError(null);
          const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, { method: 'DELETE', headers: authHeader() });
          const data = await response.json().catch(() => ({})); 
          if (!response.ok) { throw new Error(data.error || data.message || `Failed to delete (${response.status})`); }
          else { alert(data.message || `Course "${courseTitle || 'Selected'}" deleted successfully.`); fetchCourses(); }
      } catch (err) { setListError(err.message); }
  };

  const isAdmin = user?.role === 'admin';
  const isInstructor = user?.role === 'instructor';
  const isStudentCheck = user?.role === 'student';
  const canManage = isAdmin || isInstructor;
  const canDelete = isAdmin;
  const isUserEnrolled = (course) => {
    if (!user || !course || !Array.isArray(course.enrolledStudents)) return false;
    if (course.enrolledStudents.length === 0) return false;
    if (typeof course.enrolledStudents[0] === 'object' && course.enrolledStudents[0] !== null) { return course.enrolledStudents.some(s => s && s._id === user.id); }
    else { return course.enrolledStudents.some(id => id && id === user.id); }
  };

  return (
    <div className="course-list-container">
      <h3>Available Courses</h3>

      {/* --- UPDATED: Filter Controls --- */}
      <div className="filter-controls">
        <input
          type="text"
          placeholder="Search courses by name..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search courses"
        />
        {/* New Category Filter */}
        <select
          className="filter-select" // Use new class
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          aria-label="Filter by category"
        >
          {uniqueCategories.map(cat => (
            <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
          ))}
        </select>
        {/* Sort Select is removed */}
      </div>
      {/* --- END UPDATED CONTROLS --- */}

      {listError && ( <p className="auth-message error" style={{marginBottom: 'var(--space-6)'}}> {listError} </p> )}

      {courses.length > 0 && processedCourses.length === 0 && !listError ? (
            <p>No courses found matching your filters.</p>
        ) : courses.length === 0 && !listError ? (
             <p>No courses available yet.</p>
        ) : (
            <ul className="course-list">
            {processedCourses.map(course => (
                course && course._id ? (
                    <li key={course._id} className="course-item">
                        <div className="course-item-image-placeholder" style={course.imageUrl ? { backgroundImage: `url(${course.imageUrl})` } : {}}>
                            {!course.imageUrl && ( <span>{course.title ? course.title.substring(0, 1).toUpperCase() : '?'}</span> )}
                        </div>
                        <div className="course-item-content">
                            <Link to={`/course/${course._id}`} title={course.title}>
                              <strong>{course.title || '(No Title)'}</strong>
                            </Link>
                            <p>{course.description}</p>
                        </div>
                        <div className="course-item-footer">
                            <div className="course-footer-left">
                                {(() => {
                                    const enrolled = isUserEnrolled(course);
                                    if (enrolled) return <span className="enrolled-tag">Enrolled</span>;
                                    if (isStudentCheck) return <span className="not-enrolled">Not enrolled</span>;
                                    if (canManage) { 
                                        return (
                                            <div className="course-admin-actions">
                                                <button onClick={() => handleEnroll(course._id)} className="btn-small">Enroll Student</button>
                                                <button
                                                   className="btn-secondary btn-small"
                                                   onClick={() => {
                                                       if (typeof onEditClick === 'function') { onEditClick(course); }
                                                       else { console.error("onEditClick prop missing!"); }
                                                   }}
                                                   title="Edit Course"
                                                >Edit</button>
                                                {canDelete && (
                                                    <button className="btn-remove btn-small" onClick={() => handleDelete(course._id, course.title)} title="Delete Course">Delete</button>
                                                )}
                                            </div>
                                        );
                                    }
                                    return <span className="not-enrolled">Login to enroll</span>;
                                })()}
                            </div>
                            <div className="course-footer-right">
                                <Link to={`/course/${course._id}`}> View Course &rarr; </Link>
                            </div>
                        </div>
                    </li>
                ) : null
            ))}
            </ul>
        )
      }
    </div>
  );
}

export default CourseList;