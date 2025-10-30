// frontend/src/components/EditCourse.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Define categories for consistency
const CATEGORY_OPTIONS = ['Programming', 'Design', 'Business', 'Marketing', 'General'];

function EditCourse({ course, onUpdated, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]); // Add category state
  const [courseImage, setCourseImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const { authHeader } = useAuth();

  useEffect(() => {
    if (course) {
      setTitle(course.title || '');
      setDescription(course.description || '');
      setCategory(course.category || CATEGORY_OPTIONS[4]); // Pre-fill category, fallback to 'General'
      setCurrentImageUrl(course.imageUrl || '');
      setCourseImage(null);
      setStatus(null);
    }
  }, [course]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
     if (file && file.size > 5 * 1024 * 1024) { 
        setStatus({ type: 'error', text: 'Image file is too large (Max 5MB).' });
        setCourseImage(null); e.target.value = null;
        setCurrentImageUrl(course?.imageUrl || '');
        return;
    }
    setCourseImage(file);
    if(status && status.type === 'error') setStatus(null);
     if (file) {
        const reader = new FileReader();
        reader.onloadend = () => { setCurrentImageUrl(reader.result); };
        reader.readAsDataURL(file);
      } else {
          setCurrentImageUrl(course?.imageUrl || '');
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    const formData = new FormData();
    // Only append if changed
    if (title !== course.title) formData.append('title', title);
    if (description !== course.description) formData.append('description', description);
    if (category !== course.category) formData.append('category', category); // Add category
    if (courseImage) {
      formData.append('courseImage', courseImage);
    }

    // Check if any data changed
    if (title === course.title && description === course.description && category === course.category && !courseImage) {
        setStatus({ type: 'info', text: 'No changes detected.' });
        setLoading(false);
        return;
    }

    try {
      const headers = authHeader();
      delete headers['Content-Type']; 

      const response = await fetch(`http://localhost:5000/api/courses/${course._id}`, {
        method: 'PUT',
        headers: headers,
        body: formData
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || data.message || `Failed to update course (${response.status})`);
      }

      setStatus({ type: 'success', text: 'Course updated successfully!' });
      if (onUpdated) onUpdated(data); // Pass updated course data back

       setTimeout(() => { setStatus(null); }, 2000);
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Error updating course' });
      console.error("Update course error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!course) return null;

  return (
    <div>
      <h3>Edit Course: <span style={{color: 'var(--primary)'}}>{course.title}</span></h3>
      <form onSubmit={handleSubmit}>
        {currentImageUrl && (
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label>Current/Preview Image:</label>
                <img src={currentImageUrl.startsWith('blob:') ? currentImageUrl : (course.imageUrl || currentImageUrl)} alt="Course" style={{ maxWidth: '200px', height: 'auto', display: 'block', marginTop: 'var(--space-2)', borderRadius: '4px' }} />
            </div>
        )}

        {/* Title */}
        <div className="form-group">
          <label htmlFor={`editCourseTitle-${course._id}`}>Course Title</label>
          <input
            id={`editCourseTitle-${course._id}`}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* --- ADD CATEGORY SELECTOR --- */}
        <div className="form-group">
          <label htmlFor={`editCourseCategory-${course._id}`}>Category</label>
          <select
            id={`editCourseCategory-${course._id}`}
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

        {/* Description */}
        <div className="form-group">
          <label htmlFor={`editCourseDesc-${course._id}`}>Course Description</label>
          <textarea
            id={`editCourseDesc-${course._id}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            rows={4}
          />
        </div>

        {/* File Upload */}
        <div className="form-group">
            <label htmlFor={`editCourseImage-${course._id}`}>
                Change Image (Optional, JPG/PNG/GIF, Max 5MB)
            </label>
            <input
              id={`editCourseImage-${course._id}`}
              type="file"
              accept="image/png, image/jpeg, image/gif"
              onChange={handleFileChange}
              disabled={loading}
            />
             {courseImage && <span style={{fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginTop: '0.25rem'}}>New file selected: {courseImage.name}</span>}
        </div>

        {/* Buttons */}
        <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
             {status && (
                <span style={{ marginLeft: 'var(--space-4)', fontSize: '0.9rem', color: status.type === 'error' ? 'var(--error)' : 'var(--success)', fontWeight: '500' }}>
                  {status.text}
                </span>
             )}
        </div>
      </form>
    </div>
  );
}

export default EditCourse;