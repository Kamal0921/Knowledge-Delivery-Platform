import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function CreateCourse({ onCreated }) {
  const { authHeader } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    const body = { title, description, category, difficulty: level };
    try {
      const response = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: {
          ...authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Creation failed');
      setStatus('Course created!');
      if (onCreated) onCreated(data);
      setTitle('');
      setDescription('');
      setCategory('');
      setLevel('');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="form-card">
      <h3>Create New Course</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="create-title">Course Title</label>
          <input
            id="create-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div>
          <label htmlFor="create-desc">Description</label>
          <textarea
            id="create-desc"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="form-input"
            rows={4}
            required
          />
        </div>
        <div>
          <label htmlFor="create-category">Category</label>
          <select
            id="create-category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="form-input"
            required
          >
            <option value="">Select Category</option>
            <option value="Programming">Programming</option>
            <option value="Web">Web Development</option>
            <option value="Data Science">Data Science</option>
            <option value="Cloud">Cloud Computing</option>
            <option value="Artificial Intelligence">Artificial Intelligence</option>
            <option value="Embedded Systems">Embedded Systems</option>
            <option value="Design">Design</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Mobile Development">Mobile Development</option>
          </select>
        </div>
        <div>
          <label htmlFor="create-level">Level</label>
          <select
            id="create-level"
            value={level}
            onChange={e => setLevel(e.target.value)}
            className="form-input"
            required
          >
            <option value="">Select Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <button type="submit" className="btn-primary">Create Course</button>
        </div>
        {status && <p style={{ marginTop: 10, color: status.startsWith('Error') ? 'red' : 'green' }}>{status}</p>}
      </form>
    </div>
  );
}

export default CreateCourse;
