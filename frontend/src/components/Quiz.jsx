// frontend/src/components/Quiz.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Quiz.css'; // <-- Import the new CSS file

// Now accepts courseId, moduleId, and onQuizSubmit
function Quiz({ courseId, moduleId, onQuizSubmit }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState('');
  const { authHeader } = useAuth();

  // --- NEW STATE: to store the results from the backend ---
  const [quizResult, setQuizResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // This fetches the questions for the student to take
    const fetchQuiz = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/courses/${courseId}/modules/${moduleId}/quiz`, 
          {
            headers: authHeader(),
          }
        );
        if (!response.ok) throw new Error('Failed to load quiz.');
        const data = await response.json();
        setQuestions(data);
        
        // Initialize answers state with nulls
        const initialAnswers = {};
        data.forEach(q => {
          initialAnswers[q._id] = null;
        });
        setAnswers(initialAnswers);
      } catch (err) {
        setMessage(err.message);
      }
    };
    fetchQuiz();
  }, [courseId, moduleId, authHeader]);

  const handleAnswerChange = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  // --- UPDATED: This function now sends answers, not a demoScore ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      // Send the student's answers to the backend
      const response = await fetch(
        `http://localhost:5000/api/courses/${courseId}/modules/${moduleId}/quiz/submit`, 
        {
          method: 'POST',
          headers: authHeader(), // authHeader() already sets Content-Type: json
          body: JSON.stringify({ answers: answers }), // Send the answers object
        }
      );
      
      const resultData = await response.json();
      
      if (!response.ok) {
        throw new Error(resultData.error || 'Failed to submit quiz.');
      }
      
      // Save the full result from the backend into our new state
      setQuizResult(resultData);

    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NEW: This is the Results View ---
  // This view renders once `quizResult` is set
  if (quizResult) {
    return (
      <div className="quiz-results-container">
        <div className="quiz-results-header">
          <h3>Quiz Complete!</h3>
          <p>Your Score: {quizResult.score}%</p>
          <span>({quizResult.correctCount} / {quizResult.totalQuestions} correct)</span>
        </div>
        
        {quizResult.quizQuestions.map((question, index) => {
          // Get the user's answer for this question
          const userAnswer = quizResult.userAnswers[question._id];
          const isCorrect = userAnswer === question.answer;

          return (
            <div key={question._id} className="quiz-result-item">
              <p><strong>{index + 1}. {question.question}</strong></p>
              
              {/* Always show the correct answer */}
              <span className="quiz-result-answer correct">
                Correct Answer: {question.answer}
              </span>

              {/* If incorrect, show their answer */}
              {!isCorrect && userAnswer && (
                <span className="quiz-result-answer incorrect">
                  Your Answer: {userAnswer}
                </span>
              )}
              {/* If incorrect and they didn't answer */}
              {!isCorrect && !userAnswer && (
                <span className="quiz-result-answer incorrect">
                  Your Answer: (No answer)
                </span>
              )}
            </div>
          );
        })}
        
        <button onClick={onQuizSubmit} style={{marginTop: '1rem'}}>
          Close Results
        </button>
      </div>
    );
  }

  // --- This is the existing Quiz View ---
  // This view renders as long as `quizResult` is null
  if (questions.length === 0) return <p>No quiz available for this module.</p>;

  return (
    <form className="quiz-form" onSubmit={handleSubmit} style={{marginTop: '1rem'}}>
      {questions.map((q) => (
        <div key={q._id} className="quiz-question">
          <p><strong>{q.question}</strong></p>
          {q.options.map((option, idx) => (
            <label key={`${q._id}-option-${idx}`}>
              <input
                type="radio"
                name={q._id}
                value={option}
                onChange={() => handleAnswerChange(q._id, option)}
                checked={answers[q._id] === option}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      ))}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}

export default Quiz;