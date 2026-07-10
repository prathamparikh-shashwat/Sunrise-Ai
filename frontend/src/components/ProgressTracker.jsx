import React from 'react';

export default function ProgressTracker({ current, total, businessName, onReset }) {
  const percentage = Math.min(100, Math.round(((current) / total) * 100));

  return (
    <div className="progress-header">
      <div className="progress-meta">
        <div className="progress-info">
          <span className="business-badge">{businessName}</span>
          <span className="step-counter">Diagnostic Step {current} of {total}</span>
        </div>
        <button onClick={onReset} className="abort-btn" id="abort-consultation">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="btn-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
          </svg>
          Change Business
        </button>
      </div>
      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
