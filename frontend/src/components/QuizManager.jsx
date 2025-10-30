// frontend/src/components/QuizManager.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// This is a sub-component for managing a single question
function QuestionForm({ initialQuestion, onSave, onCancel }) {
  const [question, setQuestion] = useState(initialQuestion.question);
  const [options, setOptions] = useState(initialQuestion.options);
  const [answer, setAnswer] = useState(initialQuestion.answer);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSave = () => {
    // Basic validation
    if (!question || options.some(opt => !opt) || !answer) {
      alert("Please fill out all fields and select a correct answer.");
      return;
    }
    if (!options.includes(answer)) {
      alert("The correct answer must be one of the options.");
      return;
    }
    onSave({ question, options, answer });
  };

  return (
    <div className="question-form">
      <input
        type="text"
        placeholder="Question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      {options.map((opt, i) => (
        <input
          key={i}
          type="text"
          placeholder={`Option ${i + 1}`}
          value={opt}
          onChange={(e) => handleOptionChange(i, e.target.value)}
        />
      ))}
      <select value={answer} onChange={(e) => setAnswer(e.target.value)}>
        <option value="">Select Correct Answer</option>
        {options.filter(opt => opt).map((opt) => ( // Only show non-empty options
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <div> {/* Wrapper for buttons */}
        <button onClick={handleSave}>Save Question</button>
        <button onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </div>
  );
}

// Main Quiz Manager Component
function QuizManager({ courseId, moduleId, existingQuestions, onQuizUpdate }) {
  const [questions, setQuestions] = useState(existingQuestions || []); // Handle null
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState('');
  const { authHeader } = useAuth();

  const handleAddNewQuestion = (newQuestion) => {
    setQuestions([...questions, newQuestion]);
    setIsAdding(false);
  };

  const handleRemoveQuestion = (index) => {
    if (window.confirm('Are you sure you want to remove this question?')) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSaveQuiz = async () => {
    setMessage(''); // Clear previous messages
    try {
      const response = await fetch(
        `http://localhost:5000/api/courses/${courseId}/modules/${moduleId}/quiz`, 
        {
          method: 'PUT',
          headers: authHeader(),
          body: JSON.stringify({ questions: questions }),
        }
      );
      
      // --- UPDATED ERROR HANDLING ---
      if (!response.ok) {
        // Try to get the specific error message from the backend
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || `Failed to save quiz. Server responded with ${response.status}`);
      }
      // --- END UPDATE ---
      
      setMessage('Quiz saved successfully!');
      
      setTimeout(() => {
        onQuizUpdate(); // Refresh parent component
      }, 1500);

    } catch (err) {
      // This will now display the detailed error message
      setMessage(`Error: ${err.message}`);
    }
  };

  const newQuestionTemplate = {
    question: '',
    options: ['', '', '', ''],
    answer: ''
  };

  return (
    <div className="quiz-manager" style={{marginTop: '1.5rem', borderTop: '2px solid var(--border)', paddingTop: '1.5rem'}}>
      <h5>Manage Quiz for this Module</h5>
      {questions.map((q, i) => (
        <div key={i} className="question-item">
          <p>{i + 1}. {q.question} <i>(Answer: {q.answer})</i></p>
          <button onClick={() => handleRemoveQuestion(i)} className="btn-remove">
            Remove
          </button>
        </div>
      ))}
      {questions.length === 0 && !isAdding && <p>No questions yet. Add one!</p>}

      {isAdding ? (
        <QuestionForm
          initialQuestion={newQuestionTemplate}
          onSave={handleAddNewQuestion}
          onCancel={() => setIsAdding(false)}
        />
      ) : (
        <button onClick={() => setIsAdding(true)}>Add New Question</button>
      )}

      <hr />
      <button onClick={handleSaveQuiz} disabled={isAdding}>
        Save Entire Quiz
      </button>
      {/* This message will now be more informative */}
      {message && <p style={{color: message.startsWith('Error:') ? 'var(--error)' : 'var(--success)'}}>{message}</p>}
    </div>
  );
}

export default QuizManager;