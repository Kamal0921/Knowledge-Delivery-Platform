import React, { useState } from 'react';

// props: initialQuestion (object), onSave (function), onCancel (function), onRemove (function|optional)
export default function QuestionForm({
  initialQuestion = { question: '', options: ['', '', '', ''], answer: '' },
  onSave,
  onCancel,
  onRemove
}) {
  const [question, setQuestion] = useState(initialQuestion.question);
  const [options, setOptions] = useState(
    initialQuestion.options?.length === 4
      ? initialQuestion.options
      : ['', '', '', '']
  );
  const [answer, setAnswer] = useState(initialQuestion.answer);

  const handleOptionChange = (idx, value) => {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
    // If the correct answer is cleared, unset it
    if (answer === options[idx] && value.trim() === '') {
      setAnswer('');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!question.trim() || options.some(opt => !opt.trim()) || !answer.trim()) {
      alert('Please fill out all fields and select the correct answer.');
      return;
    }
    if (!options.includes(answer)) {
      alert('Correct answer must match one of the options.');
      return;
    }
    onSave({
      question: question.trim(),
      options: options.map(opt => opt.trim()),
      answer: answer.trim()
    });
  };

  return (
    <div className="form-card" style={{ maxWidth: 580, margin: '2rem auto' }}>
      <h3>Add Quiz Question</h3>
      <form onSubmit={handleSave}>
        <div>
          <label htmlFor="quiz-question">Question</label>
          <input
            id="quiz-question"
            type="text"
            placeholder="Enter your question"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            className="form-input"
            required
          />
        </div>
        {[0,1,2,3].map(idx => (
          <div key={idx}>
            <label htmlFor={`option-${idx}`}>{`Option ${idx + 1}`}</label>
            <input
              id={`option-${idx}`}
              type="text"
              placeholder={`Option ${idx + 1}`}
              value={options[idx]}
              onChange={e => handleOptionChange(idx, e.target.value)}
              className="form-input"
              required
            />
          </div>
        ))}
        <div>
          <label htmlFor="correct-answer">Correct Answer</label>
          <select
            id="correct-answer"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            className="form-input"
            required
          >
            <option value="">Choose correct answer</option>
            {options.map((opt, idx) =>
              opt.trim() ? <option key={idx} value={opt}>{opt}</option> : null
            )}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
          <button type="submit" className="btn-primary">Save Question</button>
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
          {onRemove &&
            <button type="button" className="btn-remove" onClick={onRemove}>Remove</button>
          }
        </div>
      </form>
    </div>
  );
}
