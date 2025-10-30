// frontend/src/components/EditCourse.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
// Props: course (object with existing data), onUpdated (callback), onCancel (callback)
function EditCourse({ course, onUpdated, onCancel }) {
  const [title, setTitle] = useState('');
const [description, setDescription] = useState('');
  const [courseImage, setCourseImage] = useState(null);
// For new image file
  const [currentImageUrl, setCurrentImageUrl] = useState('');
// To display/preview image
  
  // --- ADDED: State for new fields ---
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  // --- END ADD ---
  
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
const { authHeader } = useAuth();

  // Pre-fill form when component mounts or course prop changes
  useEffect(() => {
    if (course) {
      setTitle(course.title || '');
      setDescription(course.description || '');
      setCurrentImageUrl(course.imageUrl || ''); // Set current image URL from prop
      
      // --- ADDED: Pre-fill new fields ---
      setCategory(course.category || 'Other');
      setDifficulty(course.difficulty || 'Beginner');
      // --- END ADD ---

      setCourseImage(null); // Reset file input state on new course edit
      setStatus(null); // Clear status
    }
  }, [course]);
// Rerun effect if the course prop changes

  const handleFileChange = (e) => {
    const file = e.target.files[0];
if (file && file.size > 5 * 1024 * 1024) { // 5MB limit check
        setStatus({ type: 'error', text: 'Image file is too large (Max 5MB).' });
setCourseImage(null);
        e.target.value = null; // Reset file input visually
        // Revert preview to original image if selection fails
         setCurrentImageUrl(course?.imageUrl || '');
return;
    }
    setCourseImage(file); // Store the selected file object
    if(status && status.type === 'error') setStatus(null);
// Create a preview URL for the newly selected image
     if (file) {
        const reader = new FileReader();
reader.onloadend = () => {
          setCurrentImageUrl(reader.result);
// Show preview using Data URL
        };
        reader.readAsDataURL(file);
} else {
          // If user cancels file selection, revert preview to original
          setCurrentImageUrl(course?.imageUrl || '');
}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
const formData = new FormData();
    // Only append fields if they have changed or are required
    if (title !== course.title) formData.append('title', title);
if (description !== course.description) formData.append('description', description);
    
    // --- ADDED: Append new fields if changed ---
    if (category !== course.category) formData.append('category', category);
    if (difficulty !== course.difficulty) formData.append('difficulty', difficulty);
    // --- END ADD ---

    if (courseImage) { // Only append if a *new* image file was selected
      formData.append('courseImage', courseImage);
}

    // Check if any data is actually being sent
    // Note: FormData doesn't have a simple size check, use check based on state
    if (title === course.title && description === course.description && !courseImage && category === course.category && difficulty === course.difficulty) {
        setStatus({ type: 'info', text: 'No changes detected.' });
setLoading(false);
        return; // Don't send request if nothing changed
    }

    try {
      const headers = authHeader();
delete headers['Content-Type']; // Let browser set boundary

      const response = await fetch(`http://localhost:5000/api/courses/${course._id}`, { // Use PUT and course ID
        method: 'PUT',
        headers: headers,
        body: formData
      });
const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || data.message || `Failed to update course (${response.status})`);
}

      setStatus({ type: 'success', text: 'Course updated successfully!' });
      if (onUpdated) onUpdated(data);
// Notify parent with updated data

       setTimeout(() => {
           setStatus(null); // Clear message after delay
           // Optionally call onCancel() here to close the form automatically
           // onCancel();
       }, 2000);
} catch (err) {
      setStatus({ type: 'error', text: err.message || 'Error updating course' });
console.error("Update course error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!course) return null;
// Don't render if no course data

  return (
    // Assuming this will be rendered inside a .form-card or modal
    <div>
      <h3>Edit Course: <span style={{color: 'var(--primary)'}}>{course.title}</span></h3>
      <form onSubmit={handleSubmit}>
        {/* Current Image Preview */}
        {currentImageUrl && (
            <div style={{ marginBottom: 'var(--space-4)' }}>
                <label>Current/Preview Image:</label>
 
<img
                   src={currentImageUrl.startsWith('data:') ? currentImageUrl : `http://localhost:5000${currentImageUrl}`} // Shows original URL or preview Data URL
                   alt="Course"
                   style={{
                    
maxWidth: '200px', height: 'auto', display: 'block',
                       marginTop: 'var(--space-2)', borderRadius: '4px',
                       border: '1px solid var(--border)'
                   }}
                />
     
</div>
        )}

        {/* Title */}
        <div>
          <label htmlFor={`editCourseTitle-${course._id}`}>Course Title *</label>
          <input
            id={`editCourseTitle-${course._id}`}
            type="text"
            value={title}
        
onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor={`editCourseDesc-${course._id}`}>Course Description</label>
          <textarea
            
id={`editCourseDesc-${course._id}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            rows={4}
          />
        </div>

        {/* --- ADDED: Select Inputs --- */}
        <div>
          <label htmlFor={`editCourseCategory-${course._id}`}>Category</label>
          <select
            id={`editCourseCategory-${course._id}`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
          >
            <option value="Technology">Technology</option>
            <option value="Business">Business</option>
            <option value="Creative Arts">Creative Arts</option>
            <option value="Health & Wellness">Health & Wellness</option>
            <option value="Science">Science</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor={`editCourseDifficulty-${course._id}`}>Difficulty</label>
          <select
            id={`editCourseDifficulty-${course._id}`}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={loading}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        {/* --- END ADD --- */}

        {/* File Upload (for changing image) */}
        <div>
          
<label htmlFor={`editCourseImage-${course._id}`}>
                Change Image (Optional, JPG/PNG/GIF, Max 5MB)
            </label>
            <input
              id={`editCourseImage-${course._id}`}
              type="file"
              accept="image/png, image/jpeg, image/gif"
        
onChange={handleFileChange}
              disabled={loading}
              // Style handled by global CSS
            />
             {courseImage && <span style={{fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginTop: '0.25rem'}}>New file selected: {courseImage.name}</span>}
        </div>

        {/* Buttons */}
     
<div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <button type="submit" disabled={loading}>
              {loading ?
'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
             {/* Status Message Display Near Buttons */}
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