import React, { useState } from 'react';
import { analyzeBusiness } from '../utils/analyzer';

export default function ReportDashboard({ businessType, answers, onReset, questions, sheetSync, suggestions }) {
  const analysis = analyzeBusiness(businessType, answers);
  const [completedRecs, setCompletedRecs] = useState({});
  const [activeTab, setActiveTab] = useState('report'); // 'report' | 'suggestions'
  const [checkedAddons, setCheckedAddons] = useState(null);

  const sugData = suggestions && suggestions.list ? suggestions.list : null;

  // Initialize checkedAddons state on first render when sugData is available
  if (sugData && sugData.solutions && checkedAddons === null) {
    const initial = {};
    sugData.solutions.forEach((sol, idx) => {
      if (sol.is_addon) {
        initial[idx] = true;
      }
    });
    setCheckedAddons(initial);
  }

  const toggleAddon = (idx) => {
    if (!checkedAddons) return;
    setCheckedAddons(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Helper to parse numerical value from pricing strings (e.g. "$79" or "$25/mo")
  const basePriceNum = sugData && sugData.base_price 
    ? parseFloat(sugData.base_price.replace(/[^0-9.]/g, '')) 
    : 0;

  let totalAddonsPrice = 0;
  if (sugData && sugData.solutions && checkedAddons) {
    sugData.solutions.forEach((sol, idx) => {
      if (sol.is_addon && checkedAddons[idx]) {
        const priceNum = parseFloat(sol.pricing.replace(/[^0-9.]/g, ''));
        if (!isNaN(priceNum)) {
          totalAddonsPrice += priceNum;
        }
      }
    });
  }
  const totalPrice = basePriceNum + totalAddonsPrice;

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

      {/* Tab Navigation */}
      <div className="dashboard-tabs animate-fade-in">
        <button 
          className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="tab-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          Diagnostic Report
        </button>
        <button 
          className={`tab-btn ${activeTab === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggestions')}
        >
          {sheetSync && sheetSync.status === 'saving' ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="tab-icon ai-glow" style={{ animation: 'spinIcon 2s infinite linear' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="tab-icon ai-glow">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21m0 0-.813-5.096L3.6 14.85l5.096-.813L9.813 9l.813 5.037 5.096.813-5.096.813ZM19.071 4.929a10 10 0 1 1-14.142 14.142 10 10 0 0 1 14.142-14.142Z" />
            </svg>
          )}
          Software Solutions
          {sheetSync && sheetSync.status === 'saving' && (
            <span className="tab-loading-dot" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--terracotta)', marginLeft: '6px', animation: 'pulseOuter 1.5s infinite ease-in-out' }}></span>
          )}
        </button>
      </div>

      {activeTab === 'report' && (
        <>
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
        </>
      )}

      {activeTab === 'suggestions' && (
        <div className="suggestions-section animate-slide-up">
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 className="section-title">Shashwat Software Recommendations</h2>
            <p className="section-subtitle">
              Based on your diagnostic answers, we have structured a custom solution from the Shashwat software suite to optimize your business operations.
            </p>
          </div>

          {sheetSync && sheetSync.status === 'saving' ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 2rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
              <div className="loading-pulse-container" style={{ margin: '0 auto' }}>
                <div className="pulse-circle pulse-1"></div>
                <div className="pulse-circle pulse-2"></div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="loading-icon-svg" style={{ animation: 'spinIcon 3s infinite linear' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21L15.607 13H10.187L11 9L4.393 17H9.813z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Generating Software Solutions...</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, maxWidth: '400px' }}>AI is currently analyzing your diagnostic answers to build a customized software recommendation package.</p>
            </div>
          ) : sugData && sugData.software_name ? (
            <div className="solutions-container">
              {/* Product recommendation hero */}
              <div className="solutions-hero animate-slide-up">
                <div className="product-recommendation-card">
                  <div className="product-hero-header">
                    <div className="product-icon-wrapper">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="product-icon-svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                      </svg>
                    </div>
                    <div className="product-title-area">
                      <h3 className="product-name-title">{sugData.software_name}</h3>
                      <span className="product-tagline">{sugData.tagline}</span>
                    </div>
                  </div>

                  <div className="recommendation-rationale-box">
                    <strong>Why {sugData.recommended_tier}?</strong>
                    <p style={{ margin: '0.25rem 0 0 0' }}>{sugData.tier_rationale}</p>
                  </div>

                  <div className="base-features-box">
                    <h4 className="base-features-title">Included Base Features:</h4>
                    <div className="features-grid">
                      {sugData.base_features && sugData.base_features.map((feature, idx) => (
                        <div key={idx} className="feature-tick-item">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="feature-tick-svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing Calculator Card */}
                <div className="pricing-calculator-card">
                  <div>
                    <h3 className="calculator-title">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="calc-icon">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18a2.25 2.25 0 0 1-2.25 2.25h-6A2.25 2.25 0 0 1 5.25 18v-8.25A2.25 2.25 0 0 1 7.5 7.5h6a2.25 2.25 0 0 1 2.25 2.25v1.5m-3 0.75h3m-3 3h3M12 10.5h-1.5m1.5 3h-1.5m-7.5-3h.008v.008H3.75V10.5Zm0 3h.008v.008H3.75v-.008Zm3-6h.008v.008H6.75V7.5Zm0 3h.008v.008H6.75V10.5Zm0 3h.008v.008H6.75v-.008Zm3-6h.008v.008H9.75V7.5Zm0 3h.008v.008H9.75V10.5Zm0 3h.008v.008H9.75v-.008Zm3-3h.008v.008H12.75V10.5Zm0 3h.008v.008H12.75v-.008Z" />
                      </svg>
                      Pricing Estimator
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 1.25rem 0' }}>
                      Estimate your monthly software subscription cost based on selected modules.
                    </p>
                    
                    <div className="calc-ledger">
                      <div className="ledger-row">
                        <div className="ledger-label">
                          <span>{sugData.recommended_tier}</span>
                          <span className="ledger-sub">Base License Fee</span>
                        </div>
                        <span className="ledger-val">{sugData.base_price}/{sugData.billing_cycle === 'monthly' ? 'mo' : sugData.billing_cycle}</span>
                      </div>

                      {sugData.solutions && sugData.solutions.map((sol, idx) => {
                        if (sol.is_addon) {
                          const isChecked = checkedAddons ? checkedAddons[idx] : false;
                          return (
                            <div key={idx} className="ledger-row" style={{ opacity: isChecked ? 1 : 0.4, transition: 'all 0.2s ease' }}>
                              <div className="ledger-label">
                                <span>{sol.solution_title}</span>
                                <span className="ledger-sub">{isChecked ? 'Active Add-on' : 'Deactivated'}</span>
                              </div>
                              <span className={`ledger-val ${isChecked ? 'addon' : ''}`}>
                                {isChecked ? sol.pricing : '$0.00'}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="total-pricing-row">
                      <span className="total-label">Total / Month</span>
                      <div className="total-price-box">
                        <span className="total-price-number">${totalPrice.toFixed(2)}</span>
                        <span className="total-price-period">Estimated subscription fee</span>
                      </div>
                    </div>

                    <button className="subscribe-btn-cta" style={{ marginTop: '1.25rem' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                      </svg>
                      Deploy Software Package
                    </button>
                  </div>
                </div>
              </div>

              {/* Solution modules grid */}
              <div className="solutions-grid-section animate-slide-up" style={{ animationDelay: '100ms' }}>
                <h3 className="solutions-grid-title">Problem-Solution Alignment</h3>
                <p className="section-subtitle" style={{ marginBottom: '1rem' }}>
                  Click on any card to enable or disable the paid modules and customize your setup.
                </p>

                <div className="solutions-cards-stack">
                  {sugData.solutions && sugData.solutions.map((sol, idx) => {
                    const isAddon = sol.is_addon;
                    const isChecked = isAddon ? (checkedAddons ? checkedAddons[idx] : false) : true;
                    
                    return (
                      <div 
                        key={idx}
                        className={`solution-interactive-card ${isChecked ? 'selected-card' : ''}`}
                        onClick={() => {
                          if (isAddon) toggleAddon(idx);
                        }}
                      >
                        <div className="card-checkbox-container">
                          <div className="custom-card-checkbox">
                            {isChecked && (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="checkbox-tick-svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                              </svg>
                            )}
                          </div>
                        </div>

                        <div className="solution-card-body">
                          <div className="solution-card-header">
                            <h4 className="solution-card-title">{sol.solution_title}</h4>
                            <span className={isAddon ? 'addon-indicator-badge' : 'included-indicator-badge'}>
                              {isAddon ? 'Add-on' : 'Included'}
                            </span>
                          </div>
                          <p className="solution-card-desc">{sol.description}</p>
                          
                          <div className="solution-card-footer">
                            <span className="challenge-mapping">
                              Solves: {sol.challenge}
                            </span>
                            <span className={`solution-price-tag ${isAddon ? 'addon-price' : 'included-price'}`}>
                              {sol.pricing}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* API and Metadata Status */}
              {suggestions.source && (
                <div className="ai-status-indicator animate-slide-up" style={{ marginTop: '2rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="ai-status-icon" style={{ width: '1.25rem', height: '1.25rem', color: 'var(--blue-steel)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 1 1 1.084 1.085l-.041.02H11.25Zm0 3h.018v.018h-.018V14.25Zm0 3h.018v.018h-.018V17.25ZM9 12.75l.041-.02a.75.75 0 1 1 1.084 1.085L10.084 13.8a.75.75 0 0 1-1.084-1.085ZM9 15.75l.041-.02a.75.75 0 1 1 1.084 1.085L10.084 16.8a.75.75 0 0 1-1.084-1.085ZM12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Z" />
                  </svg>
                  <span>
                    <strong>Source:</strong> {suggestions.source === 'genai' ? 'Gemini AI Advisor' : suggestions.source === 'openrouter' ? 'OpenRouter Fallback' : 'Local Offline Expert System'}. {suggestions.message}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-muted)' }}>
              <p style={{ color: 'var(--text-muted)' }}>
                {sheetSync && sheetSync.status === 'error' 
                  ? `Failed to generate suggestions: ${sheetSync.message}` 
                  : 'No suggestions available. Please complete the questionnaire to generate ideas.'}
              </p>
            </div>
          )}
        </div>
      )}

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
