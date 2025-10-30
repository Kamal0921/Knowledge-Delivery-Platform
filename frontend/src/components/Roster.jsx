// frontend/src/components/Roster.jsx

import React from 'react';
import './Roster.css'; // Use the CSS for display

// Simplified display-only component
function Roster({ students, progressMap }) {

  if (!students || students.length === 0) {
    return (
      <div className="roster-container">
        <p>No students are enrolled in this course yet.</p>
      </div>
    );
  }

  return (
    <div className="roster-container">
      <table className="roster-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Progress</th> {/* Changed Header */}
          </tr>
        </thead>
        <tbody>
          {students.map(student => {
            // Basic check for valid student object
            if (!student || !student._id) {
              return (
                <tr key={Math.random().toString(36).substring(7)}>
                  <td colSpan="3" style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Invalid student data found</td>
                </tr>
              );
            }

            // Get progress, default to 0
            const progress = progressMap[student._id] || 0;

            return (
              <tr key={student._id}>
                <td>{student.name || '(No Name)'}</td>
                <td>{student.email || '(No Email)'}</td>
                <td>
                  {/* Simple Progress Bar Display */}
                  <div className="roster-progress-bar-container">
                    
                    <div
                      className="roster-progress-bar-fill"
                      style={{ width: `${progress}%` }}
                    />
                    <span>{progress}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Roster;