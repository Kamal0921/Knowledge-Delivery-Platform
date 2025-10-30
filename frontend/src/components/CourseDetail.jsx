// frontend/src/components/CourseDetail.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Quiz from './Quiz';
import UpdateProgress from './UpdateProgress'; // Keep this import
import QuizManager from './QuizManager';
import ModuleManager from './ModuleManager';
import Roster from './Roster';
import './Roster.css';
import './CourseDetailLayout.css';
import './CompactProgress.css'; // <-- Import Compact Progress CSS

function CourseDetail() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const { authHeader, user } = useAuth();
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [takingQuizModuleId, setTakingQuizModuleId] = useState(null);
  const [managingQuizModuleId, setManagingQuizModuleId] = useState(null);

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:5000/api/courses/${id}`, {
          // Pass user info to backend for filtering
          headers: { ...authHeader(), 'X-User-Id': user.id, 'X-User-Role': user.role },
      });
      if (!response.ok) {
         const errData = await response.json().catch(() => ({ message: 'Failed to fetch course data.' }));
         throw new Error(errData.message || errData.error || `Failed to fetch course data (${response.status})`);
      }
      const data = await response.json();
      setCourse(data);

      // Set initial selected module logic
      const firstAvailableModule = data.modules?.find(m => !m.isLocked);
      const firstModuleId = data.modules?.[0]?._id;

      if (!selectedModuleId && firstAvailableModule) {
        setSelectedModuleId(firstAvailableModule._id);
      } else if (!selectedModuleId && firstModuleId) {
        // Fallback for admin/instructor or if no modules completed yet
        setSelectedModuleId(firstModuleId);
      } else if (selectedModuleId && data.modules && !data.modules.some(m => m._id === selectedModuleId)) {
         // If previously selected module is gone or now locked (less likely with current logic but safe)
         setSelectedModuleId(firstAvailableModule?._id ?? firstModuleId ?? null);
      } else if (!data.modules || data.modules.length === 0) {
        setSelectedModuleId(null);
      }

    } catch (err) {
      setError(err.message);
      console.error("Fetch Course Error:", err);
    } finally {
      setLoading(false);
    }
  // Include user.id and user.role as dependencies for fetchCourse
  }, [id, authHeader, selectedModuleId, user.id, user.role]);


  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const handleQuizSubmit = () => {
    setTakingQuizModuleId(null);
    fetchCourse(); // Refetch to get updated progress and potentially unlock next module
  };

  const handleQuizUpdate = () => {
    setManagingQuizModuleId(null);
    fetchCourse(); // Refetch course data after quiz update
  };

   const handleModuleAdded = () => {
     fetchCourse(); // Refetch after adding a module
   };

  if (loading) return <p className="page-container">Loading course details...</p>;
  if (error) return <p className="page-container error-message">Error: {error}</p>;
  if (!course) return <p className="page-container">Course not found.</p>;

  // Role & Progress Checks
  const isEnrolled = course.enrolledStudents.some(s => s && s._id === user.id);
  const userProgress = (course.progress && course.progress[user.id]) || 0;
  const isAdmin = user.role === 'admin';
  const isInstructor = user.role === 'instructor';
  const isStudent = user.role === 'student';
  const canManageModules = isAdmin || isInstructor;
  const canManageQuiz = isAdmin || isInstructor;
  const selectedModule = course.modules?.find(m => m._id === selectedModuleId);

  return (
    <div className="page-container course-detail-layout">

      {/* --- COURSE HEADER (UPDATED) --- */}
      <div className="course-detail-header">
        <h2>{course.title}</h2>
        <p>{course.description}</p>

        {/* --- PROGRESS BAR MOVED HERE --- */}
        {/* Only show for enrolled students */}
        {isStudent && isEnrolled && (
          <UpdateProgress
            initialProgress={userProgress}
          />
        )}
        {/* --- END PROGRESS BAR MOVE --- */}

      </div>

      {/* --- TWO-COLUMN WRAPPER --- */}
      <div className="course-content-wrapper">
        {/* --- LEFT SIDEBAR --- */}
        {course.modules && course.modules.length > 0 && (
          <nav className="module-sidebar">
            <h3>Modules</h3>
            <ul>
              {course.modules.map(module => (
                 // Skip rendering locked modules in sidebar for students if needed,
                 // or show them differently. Let's show them but maybe style differently later.
                  <li key={module._id} className={`${module._id === selectedModuleId ? 'active' : ''} ${module.isLocked ? 'locked' : ''}`}>
                    <button
                      onClick={() => {
                        // Prevent student from selecting a locked module
                        if (isStudent && module.isLocked) return;
                        setTakingQuizModuleId(null);
                        setManagingQuizModuleId(null);
                        setSelectedModuleId(module._id);
                      }}
                      // Optionally disable button if locked
                      disabled={isStudent && module.isLocked}
                      title={isStudent && module.isLocked ? "Complete previous module to unlock" : module.title}
                    >
                      {module.title}
                      {module.isLocked && " 🔒"} {/* Lock icon */}
                    </button>
                  </li>
              ))}
            </ul>
          </nav>
        )}

        {/* --- RIGHT CONTENT AREA --- */}
        <main className="module-content-area">
          {selectedModule ? (
             // --- Check if module is locked FOR STUDENTS ---
             (selectedModule.isLocked) ? ( // Simplified check as isLocked is now always present
                 <div className="module-item-detailed">
                     <h2>{selectedModule.title} 🔒</h2>
                     <p>Complete the previous module's quiz to unlock this content.</p>
                 </div>
             ) : (
                // --- DISPLAY SELECTED MODULE DETAILS (Full module content) ---
                <article key={selectedModule._id} className="module-item-detailed">
                  <h2>{selectedModule.title}</h2>
                  {/* Render content only if not locked (already checked above) */}
                  {selectedModule.content && <p>{selectedModule.content}</p>}
                  {selectedModule.resources && selectedModule.resources.length > 0 && (
                    <>
                      <h4>Resources</h4>
                      <ul>
                        {selectedModule.resources.map((r, i) => (
                          <li key={i}><a href={r} target="_blank" rel="noreferrer">{r}</a></li>
                        ))}
                      </ul>
                    </>
                  )}

                  {/* --- QUIZ BUTTONS & COMPONENTS --- */}
                  {(() => {
                     // Check for scores *only* if the scores map exists
                     const studentScore = (selectedModule.scores && selectedModule.scores[user.id]);
                     const hasQuiz = selectedModule.quizQuestions && selectedModule.quizQuestions.length > 0;

                     return (
                       <>
                         {/* STUDENT QUIZ BUTTONS */}
                         {isStudent && isEnrolled && hasQuiz && (
                           <div className="module-quiz-controls">
                             {studentScore !== undefined ? (
                               <strong>Quiz Score: {studentScore}%</strong>
                             ) : (
                               <button onClick={() => setTakingQuizModuleId(takingQuizModuleId === selectedModule._id ? null : selectedModule._id)}>
                                 {takingQuizModuleId === selectedModule._id ? 'Close Quiz' : 'Take Quiz'}
                               </button>
                             )}
                           </div>
                         )}

                         {/* ADMIN/INSTRUCTOR QUIZ BUTTONS */}
                         {canManageQuiz && (
                           <div className="module-quiz-controls">
                             <button onClick={() => setManagingQuizModuleId(managingQuizModuleId === selectedModule._id ? null : selectedModule._id)}>
                               {managingQuizModuleId === selectedModule._id ? 'Close Manager' : 'Manage Quiz'}
                             </button>
                           </div>
                         )}

                         {/* INLINE QUIZ COMPONENTS */}
                         {takingQuizModuleId === selectedModule._id && (
                           <Quiz
                             courseId={course._id}
                             moduleId={selectedModule._id}
                             onQuizSubmit={handleQuizSubmit}
                           />
                         )}
                         {managingQuizModuleId === selectedModule._id && (
                           <QuizManager
                             courseId={course._id}
                             moduleId={selectedModule._id}
                             existingQuestions={selectedModule.quizQuestions}
                             onQuizUpdate={handleQuizUpdate}
                           />
                         )}
                       </>
                     );
                  })()}
                </article>
             )
          ) : (
            // Message if no module selected/available
             <div className="module-item-detailed">
               {course.modules && course.modules.length > 0
                 ? <p>Select a module from the list to view its content.</p>
                 : <p>This course doesn't have any modules yet. {canManageModules ? 'Add one below!' : ''}</p>
               }
             </div>
          )}

          {/* --- STUDENT PROGRESS SECTION IS REMOVED FROM HERE --- */}

          {/* --- INSTRUCTOR/ADMIN SECTIONS --- */}
          {(isAdmin || isInstructor) && (
            <div style={{marginTop: '2rem'}}>
              <section className="admin-section">
                <h3>Student Roster & Progress</h3>
                <Roster students={course.enrolledStudents} progressMap={course.progress || {}} />
              </section>
            </div>
          )}
          {canManageModules && (
            <div style={{marginTop: '2rem'}}>
              <section className="admin-section">
                <h3>Add New Module</h3>
                <ModuleManager courseId={course._id} onModuleAdded={handleModuleAdded} />
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CourseDetail;

