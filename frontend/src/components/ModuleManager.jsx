// frontend/src/components/ModuleManager.jsx

import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

// Assuming styles for labels, inputs, textareas, buttons are defined in index.css

export default function ModuleManager({ courseId, onModuleAdded }) {
  const { authHeader } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [resourcesText, setResourcesText] = useState('');
  const [files, setFiles] = useState([]); // State to hold selected files
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Ref for the file input to allow resetting
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
     const selectedFiles = Array.from(e.target.files);
     const maxSize = 50 * 1024 * 1024; // 50MB
     const largeFiles = selectedFiles.filter(f => f.size > maxSize);

     if (largeFiles.length > 0) {
        setError(`File(s) too large (Max 50MB): ${largeFiles.map(f => f.name).join(', ')}`);
        // Filter out large files but keep valid ones (optional)
        const validFiles = selectedFiles.filter(f => f.size <= maxSize);
        setFiles(validFiles);
     } else {
        setFiles(selectedFiles); // Store the array of selected files
        if (error) setError(null); // Clear previous size errors
     }
  };


  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');
    if (!title.trim()) {
      setError('Module Title is required.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content || '');

    // Append text resources (URLs)
    resourcesText
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean)
      .forEach(r => formData.append('resources', r));

    // Append uploaded files
    files.forEach(file => {
      formData.append('resources', file);
    });

    try {
      setLoading(true);
      const headers = authHeader();
      delete headers['Content-Type'];

      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/modules`, {
        method: 'POST',
        headers,
        body: formData
      });

      const responseData = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(responseData.error || responseData.message || `Failed to add module (${res.status})`);
      }

      setSuccessMessage('Module added successfully!');
      // Reset form fields
      setTitle('');
      setContent('');
      setResourcesText('');
      setFiles([]);
      if (fileInputRef.current) {
         fileInputRef.current.value = "";
      }

      if (onModuleAdded) onModuleAdded();

      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      console.error("Add module error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    // This div will be styled based on where it's placed (e.g., inside .admin-section)
    <div className="module-manager-form">
      {/* Form structure using divs for grouping, styled by index.css */}
      <form onSubmit={submit}>

        {/* --- Section 1: Title & Content --- */}
        <div>
          <label htmlFor={`moduleTitleInput-${courseId}`}>Module Title *</label>
          <input
            id={`moduleTitleInput-${courseId}`}
            type="text"
            placeholder="e.g., Introduction to..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor={`moduleContentInput-${courseId}`}>Module Content (Optional)</label>
          <textarea
            id={`moduleContentInput-${courseId}`}
            placeholder="Enter main text content, explanations, examples..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={8} // More rows for content input
            disabled={loading}
          />
        </div>

        <hr style={{ margin: 'var(--space-6) 0 var(--space-4) 0' }} />

        {/* --- Section 2: Resources --- */}
        <h4 style={{ color: 'var(--muted)', fontWeight: '500', fontSize: '1rem', marginBottom: 'var(--space-4)'}}>
            Add Resources (Optional)
        </h4>

        <div>
          <label htmlFor={`moduleResourcesTextInput-${courseId}`}>Resource Links (URLs, one per line)</label>
          <textarea
            id={`moduleResourcesTextInput-${courseId}`}
            value={resourcesText}
            onChange={e => setResourcesText(e.target.value)}
            rows={3}
            placeholder="https://example.com/video1&#10;https://anothersite.com/doc.pdf" // Example with newline
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor={`moduleFilesInput-${courseId}`}>Upload Files (PDFs, Videos - Max 50MB each)</label>
          <input
            id={`moduleFilesInput-${courseId}`}
            type="file"
            accept="application/pdf, video/*" // Accept PDFs OR any video type
            multiple // Allow selecting multiple files
            onChange={handleFileChange}
            ref={fileInputRef} // Assign ref
            disabled={loading}
             // Style is handled by index.css rules for input[type="file"]
          />
          {/* Display names of selected files */}
          {files.length > 0 && (
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
              Selected ({files.length}): {files.map(f => f.name).join(', ')}
            </div>
          )}
        </div>

        {/* --- Status Messages & Submit --- */}
        {/* Use auth-message styles for consistency */}
        {error && <p className="auth-message error" style={{marginBottom: 'var(--space-4)'}}>{error}</p>}
        {successMessage && <p className="auth-message success" style={{marginBottom: 'var(--space-4)'}}>{successMessage}</p>}

        <button type="submit" disabled={loading} style={{ marginTop: 'var(--space-4)'}}>
          {loading ? 'Adding Module...' : '+ Add Module'}
        </button>

      </form>
    </div>
  );
}