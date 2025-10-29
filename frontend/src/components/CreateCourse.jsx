// frontend/src/components/CreateCourse.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function CreateCourse() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { authHeader } = useAuth();
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ title, description })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create course');

      setMessage('Course created successfully!');
      setTitle('');
      setDescription('');
      // You would typically trigger a refresh of the course list here
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="create-course-form">
      <h3>Create New Course</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Course Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Course Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Create Course</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default CreateCourse;