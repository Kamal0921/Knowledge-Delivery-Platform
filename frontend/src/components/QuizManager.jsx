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
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <button onClick={handleSave}>Save Question</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}

// Main Quiz Manager Component
function QuizManager({ courseId, existingQuestions, onQuizUpdate }) {
  const [questions, setQuestions] = useState(existingQuestions);
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
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/quiz`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({ questions: questions }),
      });
      if (!response.ok) throw new Error('Failed to save quiz.');
      setMessage('Quiz saved successfully!');
      onQuizUpdate(); // Refresh parent component
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const newQuestionTemplate = {
    question: '',
    options: ['', '', '', ''],
    answer: ''
  };

  return (
    <div className="quiz-manager">
      <h4>Quiz Questions</h4>
      {questions.map((q, i) => (
        <div key={i} className="question-item">
          <p>{i + 1}. {q.question} (Answer: {q.answer})</p>
          <button onClick={() => handleRemoveQuestion(i)}>Remove</button>
        </div>
      ))}

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
      {message && <p>{message}</p>}
    </div>
  );
}

export default QuizManager;