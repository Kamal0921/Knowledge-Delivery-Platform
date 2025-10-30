// frontend/src/components/CourseList.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 1. Accept new props
function CourseList({
  refreshTrigger,
  onEditClick,
  searchQuery,
  filterCategory,
  filterDifficulty
}) {
  const [courses, setCourses] = useState([]);
const [listError, setListError] = useState(null); // Renamed error state
  const { authHeader, user } = useAuth();

  const fetchCourses = useCallback(async () => {
    try {
      setListError(null);

      // 2. Build query parameters
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterCategory) params.append('category', filterCategory);
      if (filterDifficulty) params.append('difficulty', filterDifficulty);
      
      // 3. Append params string to fetch URL
      const response = await fetch(`http://localhost:5000/api/courses?${params.toString()}`, {
        method: 'GET',
        headers: user ? authHeader() : { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`Failed to fetch courses (${response.status})`);
      const data = await response.json();
      setCourses(data);
    } catch (err) {
    
setListError(err.message);
      console.error("Fetch Courses Error:", err);
    }
    // 4. Add new props to dependency array
  }, [authHeader, user, searchQuery, filterCategory, filterDifficulty]);

useEffect(() => {
    fetchCourses();
    // 5. Add new props to dependency array
  }, [fetchCourses, refreshTrigger]);

const handleEnroll = async (courseId) => {
     try {
       if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
         alert('Only admin or instructor can enroll students.');
return;
       }
       const studentId = window.prompt('Enter the student ID to enroll:');
       if (!studentId) return;
const headers = { ...authHeader(), 'Content-Type': 'application/json' };
       const response = await fetch(`http://localhost:5000/api/courses/${courseId}/enroll`, {
         method: 'PUT', headers, body: JSON.stringify({ studentId })
       });
const data = await response.json().catch(() => ({}));
       if (!response.ok) throw new Error(data.error || data.message || 'Enrollment failed');
       alert('Student enrolled successfully!');
fetchCourses();
     } catch (err) {
       alert(`Enrollment Error: ${err.message}`);
       console.error("Enroll Error:", err);
     }
  };
const handleDelete = async (courseId, courseTitle) => {
      if (!window.confirm(`Are you sure you want to delete the course "${courseTitle}"? This action cannot be undone.`)) { return;
}
      try {
          setListError(null);
const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
              method: 'DELETE',
              headers: authHeader(),
          });
if (!response.ok) {
              const errData = await response.json().catch(() => ({}));
throw new Error(errData.error || errData.message || `Failed to delete course (${response.status})`);
}
          alert(`Course "${courseTitle}" deleted successfully.`);
          fetchCourses();
} catch (err) {
          setListError(`Error deleting course: ${err.message}`);
console.error("Delete course error:", err);
      }
  };

  // Role checks
  const isAdmin = user?.role === 'admin';
const isInstructor = user?.role === 'instructor';
  const isStudentCheck = user?.role === 'student';
  const canManage = isAdmin || isInstructor;
// Combined check for admin actions
  const canDelete = isAdmin;
// Enrollment check function
  const isUserEnrolled = (course) => {
    if (!user || !course || !Array.isArray(course.enrolledStudents)) return false;
if (course.enrolledStudents.length === 0) return false;
    if (typeof course.enrolledStudents[0] === 'object' && course.enrolledStudents[0] !== null) {
      return course.enrolledStudents.some(s => s && s._id === user.id);
} else {
      return course.enrolledStudents.some(id => id && id === user.id);
    }
  };
return (
    <div className="course-list-container">
      <h3>Available Courses</h3>
      {listError && <p className="auth-message error" style={{marginBottom: 'var(--space-6)'}}>{listError}</p>}

      {courses.length === 0 && !listError ? <p>No courses matching your filters.</p> : (
        <ul className="course-list">
          {courses.map(course => (
            <li key={course._id} className="course-item">
              <div
         
className="course-item-image-placeholder"
                style={course.imageUrl ? { backgroundImage: `url(http://localhost:5000${course.imageUrl})` } : {}}
              >
                 {!course.imageUrl && ( <span>{course.title ? course.title.substring(0, 1).toUpperCase() : '?'}</span> )}
              </div>
              <div className="course-item-content">
 
<Link to={`/course/${course._id}`} title={course.title}>
                  <strong>{course.title}</strong>
                </Link>
                <p>{course.description}</p>
              </div>

              {/* --- UPDATED FOOTER STRUCTURE 
 --- */}
              <div className="course-item-footer">
                 {/* Left Side: Enrollment Status or Admin Actions */}
                 <div className="course-footer-left">
                    {(() => {
                   
const enrolled = isUserEnrolled(course);
                        if (enrolled) return <span className="enrolled-tag">Enrolled</span>;
                        if (isStudentCheck) return <span className="not-enrolled">Not enrolled</span>;
// Show admin actions group only if user is admin/instructor AND not enrolled as student
                        if (canManage && !enrolled) {
                             return (
                            
<div className="course-admin-actions">
                                    <button onClick={() => handleEnroll(course._id)} className="btn-small">Enroll Student</button>
                                    <button className="btn-secondary btn-small" onClick={() => onEditClick(course)} title="Edit Course">Edit</button>
           
{canDelete && (
                                        <button className="btn-remove btn-small" onClick={() => handleDelete(course._id, course.title)} title="Delete Course">Delete</button>
                         
)}
                                </div>
                             );
}
                        // Default for logged out or other roles
                        return <span className="not-enrolled">Login to enroll</span>;
})()}
                 </div>

                 {/* Right Side: View Course Link */}
                 <div className="course-footer-right">
                    <Link to={`/course/${course._id}`}>
                     
View Course &rarr;
                    </Link>
                 </div>
              </div>
              {/* --- END UPDATED FOOTER --- */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CourseList;