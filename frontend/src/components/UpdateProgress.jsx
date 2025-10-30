// frontend/src/components/UpdateProgress.jsx

import React from 'react';
import './CompactProgress.css'; // <-- Import the new CSS

// Display-only component using the new compact styles
function UpdateProgress({ initialProgress }) {

  const progress = initialProgress || 0;

  return (
    <div className="compact-progress-container">
      <span className="compact-progress-label">Course Progress</span>
      <div className="compact-progress-bar-background">
        
        <div
          className="compact-progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="compact-progress-percentage">{progress}% Complete</span>
    </div>
  );
}

export default UpdateProgress;