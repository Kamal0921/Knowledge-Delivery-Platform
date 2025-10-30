// frontend/src/components/CreateCourse.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Define categories for consistency
const CATEGORY_OPTIONS = ['Programming', 'Design', 'Business', 'Marketing', 'General'];

function CreateCourse({ onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]); // Default to first category
  const [courseImage, setCourseImage] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const { authHeader } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) { // 5MB limit check
        setStatus({ type: 'error', text: 'Image file is too large (Max 5MB).' });
        setCourseImage(null);
        e.target.value = null;
        return;
    }
    setCourseImage(file);
    if(status && status.type === 'error') setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category); // --- ADD CATEGORY ---
    if (courseImage) {
      formData.append('courseImage', courseImage);
    }

    try {
      const headers = authHeader();
      delete headers['Content-Type']; 

      const response = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: headers,
        body: formData
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || data.message || `Failed to create course (${response.status})`);
      }

      // Reset form
      setTitle('');
      setDescription('');
      setCategory(CATEGORY_OPTIONS[0]); // Reset category
      setCourseImage(null);
      e.target.reset();
      setStatus({ type: 'success', text: 'Course created successfully!' });
      if (onCreated) onCreated(data);

    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Error creating course' });
      console.error("Create course error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    // This div is styled by .form-card in index.css
    <div>
      <h3>Create New Course</h3>
      <form onSubmit={handleSubmit}>
        {/* Input Group for Title */}
        <div className="form-group">
          <label htmlFor="courseTitleInput">Course Title</label>
          <input
            id="courseTitleInput"
            type="text"
            placeholder="e.g., Introduction to React"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* --- ADD CATEGORY SELECTOR --- */}
        <div className="form-group">
          <label htmlFor="courseCategoryInput">Category</label>
          <select
            id="courseCategoryInput"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
          >
            {CATEGORY_OPTIONS.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        {/* --- END ADD --- */}

        {/* Input Group for Description */}
        <div className="form-group">
          <label htmlFor="courseDescriptionInput">Course Description</label>
          <textarea
            id="courseDescriptionInput"
            placeholder="Describe what the course is about..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            rows={4}
          />
        </div>

        {/* Input Group for File Upload */}
        <div className="form-group">
            <label htmlFor="courseImageInput">
                Course Image (Optional, JPG/PNG/GIF, Max 5MB)
            </label>
            <input
              id="courseImageInput"
              type="file"
              accept="image/png, image/jpeg, image/gif"
              onChange={handleFileChange}
              disabled={loading}
            />
            {courseImage && <span style={{fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginTop: '0.25rem'}}>Selected: {courseImage.name}</span>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Course'}
        </button>
      </form>
      {status && (
        <p className={`auth-message ${status.type === 'error' ? 'error' : 'success'}`} style={{ marginTop: '1rem' }}>
          {status.text}
        </p>
      )}
    </div>
  );
}

export default CreateCourse;