// frontend/src/components/CourseDetail.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Quiz from './Quiz';
import UpdateProgress from './UpdateProgress';
import QuizManager from './QuizManager';

function CourseDetail() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const { authHeader, user } = useAuth();

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/courses/${id}`, {
        headers: authHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch course data.');
      const data = await response.json();
      setCourse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, authHeader]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  if (loading) return <p>Loading course details...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!course) return <p>Course not found.</p>;

  const isEnrolled = course.enrolledStudents.includes(user.id);
  const userProgress = course.progress[user.id] || 0;
  const userScore = course.scores[user.id];
  const isInstructor = user.role === 'admin' || user.role === 'instructor';

  return (
    <div className="course-detail-container">
      <h2>{course.title}</h2>
      <p>{course.description}</p>

      {!isEnrolled && user.role === 'student' && (
        <p>You are not enrolled. Please enroll from the dashboard.</p>
      )}

      {/* --- STUDENT VIEW --- */}
      {user.role === 'student' && (
        <>
          {!isEnrolled && (
            <p>You are not enrolled. Please enroll from the dashboard.</p>
          )}

          {isEnrolled && (
            <>
              <UpdateProgress 
                courseId={course._id} 
                initialProgress={userProgress} 
              />
              <hr />
              <h3>Quiz</h3>
              {userScore !== undefined ? (
                <h4>Your Quiz Score: {userScore}%</h4>
              ) : (
                <Quiz courseId={course._id} onQuizSubmit={fetchCourse} />
              )}
            </>
          )}
        </>
      )}

      {/* --- INSTRUCTOR/ADMIN VIEW --- */}
      {isInstructor && (
        <>
          <hr />
          <h3>Quiz Management</h3>
          <QuizManager 
            courseId={course._id}
            existingQuestions={course.quizQuestions}
            onQuizUpdate={fetchCourse}
          />
        </>
      )}
    </div>
  );
}

export default CourseDetail;