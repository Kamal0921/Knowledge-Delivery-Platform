// frontend/src/components/CourseList.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const { authHeader, user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/courses', {
          method: 'GET',
          headers: authHeader() // Use authHeader, though this route is public
        });
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchCourses();
  }, [authHeader]);

  const handleEnroll = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/enroll`, {
        method: 'PUT',
        headers: authHeader()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Enrollment failed');
      
      alert('Enrolled successfully!');
      // Refresh course list or update state
      setCourses(courses.map(c => c._id === courseId ? data : c));
    } catch (err) {
      alert(err.message);
    }
  };

  if (error) return <p>Error loading courses: {error}</p>;

  return (
    <div className="course-list">
      <h3>Available Courses</h3>
      {courses.length === 0 ? <p>No courses available.</p> : (
        <ul>
          {courses.map(course => (
            <li key={course._id} className="course-item">
                <Link to={`/course/${course._id}`}>
                    <strong>{course.title}</strong>
              </Link>
              <p>{course.description}</p>
              {user.role === 'student' && !course.enrolledStudents.includes(user.id) && (
                <button onClick={() => handleEnroll(course._id)}>Enroll</button>
              )}
              {course.enrolledStudents.includes(user.id) && (
                <span className="enrolled-tag">Enrolled</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CourseList;