import React, { useState } from 'react';
import { analyzeBusiness } from '../utils/analyzer';

export default function ReportDashboard({ businessType, answers, onReset, questions, sheetSync }) {
  const analysis = analyzeBusiness(businessType, answers);
  const [completedRecs, setCompletedRecs] = useState({});

  const toggleRec = (index) => {
    setCompletedRecs(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Find question label by ID
  const getQuestionText = (id) => {
    const q = questions.find(item => item.id === id);
    return q ? q.question : id;
  };

  const getRiskColor = (score) => {
    if (score < 40) return '#10B981'; // Green (low)
    if (score < 70) return '#F59E0B'; // Orange (medium)
    return '#EF4444'; // Red (high)
  };

  return (
    <div className="dashboard-container">
      {/* Header section */}
      <div className="dashboard-header animate-fade-in">
        <div className="dashboard-badge">Diagnostic Report Complete</div>
        {sheetSync?.status === 'saving' && (
          <div className="sheet-sync-banner sheet-sync-saving">Saving your responses to Google Sheets...</div>
        )}
        {sheetSync?.status === 'success' && (
          <div className="sheet-sync-banner sheet-sync-success">
            Saved to Google Sheets.
            {sheetSync.url && (
              <> <a href={sheetSync.url} target="_blank" rel="noopener noreferrer">Open spreadsheet</a></>
            )}
          </div>
        )}
        {sheetSync?.status === 'error' && (
          <div className="sheet-sync-banner sheet-sync-error">
            Could not save to Google Sheets: {sheetSync.message}
          </div>
        )}
        <h1 className="dashboard-title">
          {businessType === 'tailoring' 
            ? 'Tailoring Operations Review' 
            : businessType === 'retail' 
              ? 'Retail Shop Performance Review' 
              : businessType === 'cattlefeed'
                ? 'Cattle Feed Business Operations Review'
                : 'General Business Operations Review'}
        </h1>
        <p className="dashboard-subtitle">{analysis.summary}</p>
      </div>

      <div className="dashboard-grid">
        {/* Risk meter card */}
        <div className="metric-card animate-slide-up">
          <h3 className="card-heading">Operational Vulnerability Index</h3>
          <div className="risk-meter-container">
            <svg viewBox="0 0 100 100" className="risk-ring">
              <circle cx="50" cy="50" r="40" className="ring-track" />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                className="ring-fill" 
                style={{
                  strokeDasharray: '251.2',
                  strokeDashoffset: `${251.2 - (251.2 * analysis.riskScore) / 100}`,
                  stroke: getRiskColor(analysis.riskScore)
                }}
              />
            </svg>
            <div className="risk-text-overlay">
              <span className="risk-value" style={{ color: getRiskColor(analysis.riskScore) }}>
                {analysis.riskScore}%
              </span>
              <span className="risk-label">
                {analysis.riskScore < 40 ? 'Optimized' : analysis.riskScore < 70 ? 'Moderate Risk' : 'High Risk'}
              </span>
            </div>
          </div>
          <div className="metric-details">
            <p>Risk is evaluated dynamically based on operating systems, staff counts, and customer/order volumes.</p>
          </div>
        </div>

        {/* AI Key Insights */}
        <div className="insights-card animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h3 className="card-heading">AI Consultant Key Insights</h3>
          <div className="insights-list">
            {analysis.insights.map((insight, idx) => (
              <div key={idx} className="insight-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="insight-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18ZM12 2.25V4.5m5.303.197-1.591 1.591M21 12h-2.25m-.197 5.303-1.591-1.591M12 21.75V19.5m-5.303-.197 1.591-1.591M3 12h2.25m.197-5.303 1.591 1.591" />
                </svg>
                <p className="insight-text">{insight}</p>
              </div>
            ))}
            <div className="insight-item">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="insight-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <p className="insight-text">
                Your primary objective is <strong>{answers[businessType === 'tailoring' ? 'TQ7' : businessType === 'retail' ? 'RQ7' : businessType === 'cattlefeed' ? 'CFQ7' : 'GQ5']}</strong>. The strategies below are focused on accelerating this outcome.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic action roadmap */}
      <div className="roadmap-section animate-slide-up" style={{ animationDelay: '200ms' }}>
        <h2 className="section-title">Strategic Action Roadmap</h2>
        <p className="section-subtitle">Actionable tactics customized for your specific operational challenges. Mark items complete as you plan to implement them.</p>

        <div className="recommendations-stack">
          {analysis.recommendations.map((rec, index) => {
            const isCompleted = completedRecs[index];
            return (
              <div 
                key={index} 
                className={`recommendation-card ${isCompleted ? 'completed-card' : ''}`}
                onClick={() => toggleRec(index)}
              >
                <div className="rec-checkbox-wrapper">
                  <div className={`rec-checkbox ${isCompleted ? 'checked' : ''}`}>
                    {isCompleted && (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="check-svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="rec-content">
                  <div className="rec-meta">
                    <span className="rec-badge">{rec.area}</span>
                    <span className="rec-status-tag">{isCompleted ? 'Added to Agenda' : 'Action Required'}</span>
                  </div>
                  <h4 className="rec-title">{rec.title}</h4>
                  <p className="rec-desc">{rec.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Answers Ledger (Summary) */}
      <div className="ledger-section animate-slide-up" style={{ animationDelay: '300ms' }}>
        <h3 className="ledger-title">Data Ledger</h3>
        <div className="ledger-grid">
          {Object.entries(answers).map(([key, val]) => (
            <div key={key} className="ledger-item">
              <span className="ledger-q">{getQuestionText(key)}</span>
              <span className="ledger-a">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Consultation */}
      <div className="reset-container">
        <button onClick={onReset} className="reset-btn" id="restart-diagnostic">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="btn-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          New Consultation Run
        </button>
      </div>
    </div>
  );
}
