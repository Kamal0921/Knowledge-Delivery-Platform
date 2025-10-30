// frontend/src/components/CourseDetail.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Quiz from './Quiz';
import UpdateProgress from './UpdateProgress';
import QuizManager from './QuizManager';
import ModuleManager from './ModuleManager';
import Roster from './Roster';
import './Roster.css'; // Ensure Roster CSS is imported
import './CourseDetailLayout.css'; // Ensure Layout CSS is imported
import './CompactProgress.css'; // Ensure Compact Progress CSS is imported

// --- Helper for path.basename fallback ---
// Use this simple function if proper 'path-browserify' is not set up
const pathFallback = {
    basename: (p = '') => {
        // Handle potential query strings or hash fragments
        const urlWithoutQuery = p.split('?')[0].split('#')[0];
        const lastSlash = urlWithoutQuery.lastIndexOf('/');
        return lastSlash === -1 ? urlWithoutQuery : urlWithoutQuery.substring(lastSlash + 1);
    }
};
// --- End Helper ---


function CourseDetail() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams(); // This is courseId
  const { authHeader, user } = useAuth(); // Get user info

  // State for selected module
  const [selectedModuleId, setSelectedModuleId] = useState(null);

  // States for inline quiz/manager toggles
  const [takingQuizModuleId, setTakingQuizModuleId] = useState(null);
  const [managingQuizModuleId, setManagingQuizModuleId] = useState(null);

  // Function to fetch course data
  const fetchCourse = useCallback(async () => {
    // Only fetch if user details are available
    if (!user || !user.id || !user.role) {
        console.warn("User details not yet available, delaying fetch.");
        return; // Skip fetch if user info is missing
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:5000/api/courses/${id}`, {
          // Pass user info to backend for filtering modules (Sequential Navigation)
          headers: { ...authHeader(), 'X-User-Id': user.id, 'X-User-Role': user.role },
      });
      if (!response.ok) {
         const errData = await response.json().catch(() => ({ message: 'Failed to fetch course data.' }));
         throw new Error(errData.message || errData.error || `Failed to fetch course data (${response.status})`);
      }
      const data = await response.json();
      setCourse(data); // Set fetched course data

    } catch (err) {
      setError(err.message);
      console.error("Fetch Course Error:", err);
    } finally {
      setLoading(false);
    }
  }, [id, authHeader, user]); // Depend on user object


  // Effect to run fetchCourse when component mounts or user info changes
  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);


  // --- Effect to handle initial/default module selection based on fetched course ---
  useEffect(() => {
      // Run only when course data is loaded AND (no module is currently selected OR the selected one is invalid)
      if (course && Array.isArray(course.modules)) {
           const currentSelectionStillValid = selectedModuleId && course.modules.some(m => m._id === selectedModuleId && !m.isLocked);

           if (!currentSelectionStillValid) { // Select default only if current selection is invalid or null
                const firstAvailableModule = course.modules.find(m => !m.isLocked);
                const firstModuleId = course.modules[0]?._id; // Safely get first ID
                const defaultModuleId = firstAvailableModule ? firstAvailableModule._id : firstModuleId;

                // Only update state if the default is different from current selection
                if (defaultModuleId && defaultModuleId !== selectedModuleId) {
                    setSelectedModuleId(defaultModuleId);
                } else if (!defaultModuleId && selectedModuleId) {
                     setSelectedModuleId(null); // Clear selection if no modules available
                }
           }
      } else if (course && (!course.modules || course.modules.length === 0) && selectedModuleId) {
           setSelectedModuleId(null); // Clear selection if course has no modules
      }
  }, [course, selectedModuleId]);
  // --- END Selection Effect ---


  // Handlers to close quiz/manager and refresh data
  const handleQuizSubmit = () => {
    setTakingQuizModuleId(null);
    fetchCourse(); // Refetch to get updated progress and potentially unlock next module
  };

  const handleQuizUpdate = () => {
    setManagingQuizModuleId(null);
    fetchCourse(); // Refetch course data after quiz update
  };

   const handleModuleAdded = () => {
     // After adding a module, fetch again. Selection effect will handle choosing.
     fetchCourse();
   };

  // --- Render Loading/Error/Not Found States ---
  if (loading) return <p className="page-container">Loading course details...</p>;
  if (error) return <p className="page-container auth-message error">Error: {error}</p>;
  if (!course) return <p className="page-container">Course not found.</p>;

  // --- Derived State (Roles, Progress, Selection) ---
  const isEnrolled = course.enrolledStudents.some(s => s && s._id === user.id);
  const userProgress = (course.progress && course.progress[user.id]) || 0;
  const isAdmin = user.role === 'admin';
  const isInstructor = user.role === 'instructor';
  const isStudent = user.role === 'student';
  const canManageModules = isAdmin || isInstructor; // For adding new modules
  const canManageQuiz = isAdmin || isInstructor;   // For managing existing module quizzes
  const selectedModule = course.modules?.find(m => m._id === selectedModuleId);


  return (
    <div className="page-container course-detail-layout">

      {/* --- COURSE HEADER --- */}
      <div className="course-detail-header">
        <h2>{course.title}</h2>
        <p>{course.description}</p>
        {/* Compact Progress Bar for enrolled students */}
        {isStudent && isEnrolled && (
          <UpdateProgress initialProgress={userProgress} />
        )}
      </div>

      {/* --- TWO-COLUMN WRAPPER --- */}
      <div className="course-content-wrapper">
        {/* --- LEFT SIDEBAR --- */}
        {/* Only render sidebar if there are modules */}
        {course.modules && course.modules.length > 0 && (
          <nav className="module-sidebar">
            <h3>Modules</h3>
            <ul>
              {course.modules.map(module => (
                  <li key={module._id} className={`${module._id === selectedModuleId ? 'active' : ''} ${module.isLocked ? 'locked' : ''}`}>
                    <button
                      onClick={() => {
                        if (isStudent && module.isLocked) return;
                        setTakingQuizModuleId(null);
                        setManagingQuizModuleId(null);
                        setSelectedModuleId(module._id);
                      }}
                      disabled={isStudent && module.isLocked}
                      title={isStudent && module.isLocked ? "Complete previous module to unlock" : module.title}
                    >
                      {module.title}
                      {module.isLocked && " 🔒"}
                    </button>
                  </li>
              ))}
            </ul>
          </nav>
        )}

        {/* --- RIGHT CONTENT AREA --- */}
        <main className="module-content-area">
          {/* Check if a module is selected */}
          {selectedModule ? (
             /* Display Content if UNLOCKED */
             (selectedModule.isLocked) ? (
                 <div className="module-item-detailed">
                     <h2>{selectedModule.title} 🔒</h2>
                     <p>Complete the previous module's quiz to unlock this content.</p>
                 </div>
             ) : (
                // --- DISPLAY SELECTED MODULE DETAILS ---
                <article key={selectedModule._id} className="module-item-detailed">
                  <h2>{selectedModule.title}</h2>

                  {/* Display Content */}
                  {selectedModule.content && (
                     <p style={{ whiteSpace: 'pre-wrap' }}>{selectedModule.content}</p>
                  )}

                  {/* --- RESOURCE RENDERING SECTION --- */}
                  {selectedModule.resources && selectedModule.resources.length > 0 && (
                    <>
                      <h4 style={selectedModule.content ? {marginTop: 'var(--space-6)'} : {}}>
                          Resources
                      </h4>
                      <ul>
                        {selectedModule.resources.map((resourceUrl, index) => {
                           if (!resourceUrl) return null; // Skip null/empty strings

                           const isAbsoluteUrl = resourceUrl.startsWith('http');
                           const finalUrl = isAbsoluteUrl 
                               ? resourceUrl 
                               : `http://localhost:5000${resourceUrl}`; // Prepend host for relative paths

                           let isVideo = false;
                           let isPdf = false;
                           let linkText = pathFallback.basename(resourceUrl);
                           
                           const extension = linkText.split('.').pop()?.toLowerCase();

                           if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(extension)) {
                               isVideo = true;
                           } else if (extension === 'pdf') {
                               isPdf = true;
                           }

                           const icon = isVideo ? '🎬' : isPdf ? '📄' : '🔗';
                           if (!linkText) linkText = `Resource ${index + 1}`;

                           return (
                             <li key={index} style={{ marginBottom: 'var(--space-3)' }}>
                               {isVideo ? (
                                    <div style={{marginTop: 'var(--space-2)'}}>
                                        <label htmlFor={`video-${selectedModule._id}-${index}`} style={{ display: 'block', fontWeight: '500', marginBottom: 'var(--space-1)' }}>
                                            {icon} {linkText}
                                        </label>
                                        <video
                                            id={`video-${selectedModule._id}-${index}`}
                                            controls
                                            width="100%"
                                            style={{maxWidth: '600px', borderRadius: '4px', border: '1px solid var(--border)'}}
                                            preload="metadata"
                                        >
                                            <source src={finalUrl} type={`video/${extension || 'mp4'}`} />
                                            Your browser does not support the video tag. Watch here: <a href={finalUrl} target="_blank" rel="noopener noreferrer">{linkText}</a>
                                        </video>
                                    </div>
                                 ) : (
                                    <a href={finalUrl} target="_blank" rel="noopener noreferrer" title={`Open resource: ${linkText}`}>
                                      {icon} {linkText}
                                    </a>
                                 )}
                             </li>
                           );
                        })}
                      </ul>
                    </>
                  )}
                  {/* --- END RESOURCE RENDERING --- */}

                  {/* --- QUIZ BUTTONS & COMPONENTS --- */}
                  {(() => {
                     const studentScore = (selectedModule.scores && user?.id) ? selectedModule.scores[user.id] : undefined;
                     const hasQuiz = selectedModule.quizQuestions && selectedModule.quizQuestions.length > 0;

                     return (
                       <>
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
                         {canManageQuiz && (
                           <div className="module-quiz-controls">
                             <button onClick={() => setManagingQuizModuleId(managingQuizModuleId === selectedModule._id ? null : selectedModule._id)}>
                               {managingQuizModuleId === selectedModule._id ? 'Close Manager' : 'Manage Quiz'}
                             </button>
                           </div>
                         )}
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
                  {/* --- END QUIZ SECTION --- */}
                </article>
             )
          ) : (
            // Message if no module selected or course has no modules
             <div className="module-item-detailed">
               {course.modules && course.modules.length > 0
                 ? <p>Select a module from the list on the left to view its content.</p>
                 : <p>This course doesn't have any modules yet. {canManageModules ? 'You can add one below!' : ''}</p>
               }
             </div>
          )}

          {/* --- INSTRUCTOR/ADMIN SECTIONS (These appear at the bottom) --- */}
          {(isAdmin || isInstructor) && (
            <div style={{marginTop: 'var(--space-8)'}}>
              <section className="admin-section">
                <h3>Student Roster & Progress</h3>
                <Roster
                  students={course.enrolledStudents}
                  progressMap={course.progress || {}}
                />
              </section>
            </div>
          )}
          {canManageModules && (
            <div style={{marginTop: 'var(--space-8)'}}>
              <section className="admin-section">
                <h3>Add New Module</h3>
                <ModuleManager courseId={course._id} onModuleAdded={handleModuleAdded} />
              </section>
            </div>
          )}
        </main>
        {/* --- END RIGHT CONTENT AREA --- */}
      </div>
      {/* --- END TWO-COLUMN WRAPPER --- */}
    </div>
  );
}

export default CourseDetail;