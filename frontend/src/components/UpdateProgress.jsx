// frontend/src/components/UpdateProgress.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function UpdateProgress({ courseId, initialProgress }) {
  const [progress, setProgress] = useState(initialProgress);
  const [message, setMessage] = useState('');
  const { authHeader } = useAuth();

  const handleProgressChange = (e) => {
    setProgress(e.target.value);
  };

  const handleSubmitProgress = async () => {
    try {
      // Per SRS, progress is a query param [cite: 80]
      const response = await fetch(
        `http://localhost:5000/api/courses/${courseId}/progress?progress=${progress}`, 
        {
          method: 'PUT',
          headers: authHeader(),
        }
      );
      if (!response.ok) throw new Error('Failed to update progress.');
      setMessage('Progress updated successfully!');
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="progress-updater">
      <h4>Your Progress: {progress}%</h4>
      <input
        type="range"
        min="0"
        max="100"
        value={progress}
        onChange={handleProgressChange}
      />
      <button onClick={handleSubmitProgress}>Update Progress</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default UpdateProgress;