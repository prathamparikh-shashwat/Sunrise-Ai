import React from 'react';

export default function BusinessSelector({ onSelect }) {
  return (
    <div className="selector-container">
      <div className="selector-header">
        <div className="pulse-dot"></div>
        <span className="selector-subtitle">Sunrise AI Consultation Engine v1.0</span>
        <h1 className="selector-title">Select Business Vertical</h1>
        <p className="selector-desc">
          Begin your strategic operational review. Select your business type below to initialize the custom diagnostic consultation.
        </p>
      </div>

      <div className="selector-grid">
        <button 
          onClick={() => onSelect('tailoring')} 
          className="selector-card group"
          id="select-tailoring"
        >
          <div className="card-glow-bg"></div>
          <div className="card-content">
            <div className="card-icon-wrapper">
              {/* Scissors/Tailor SVG Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="card-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 16.47a4.75 4.75 0 0 0 6.788-6.787M7.864 16.47a4.75 4.75 0 0 1-6.787-6.787m6.787 6.787 5.04-5.04m-5.04 5.04-2.22-2.22m0 0a4.75 4.75 0 0 1 6.787-6.788M3.298 9.68a4.75 4.75 0 0 1 6.787-6.787M3.298 9.68l5.04-5.04m-5.04 5.04 2.22 2.22m0 0 8.93 8.93a1.815 1.815 0 0 0 2.567-2.567l-8.93-8.93" />
              </svg>
            </div>
            <h3 className="card-name">Tailoring Business</h3>
            <p className="card-details">
              Analyze employee efficiency, garment order volume, material wastage, measurement quality checks, and order tracking.
            </p>
            <div className="card-action">
              <span>Launch Consultation</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="arrow-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>
        </button>

        <button 
          onClick={() => onSelect('retail')} 
          className="selector-card group"
          id="select-retail"
        >
          <div className="card-glow-bg"></div>
          <div className="card-content">
            <div className="card-icon-wrapper">
              {/* Storefront/Retail SVG Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="card-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
              </svg>
            </div>
            <h3 className="card-name">Retail Shop</h3>
            <p className="card-details">
              Evaluate floor staff productivity, footfall volumes, dead stock, checkout POS systems, and sales margin bottlenecks.
            </p>
            <div className="card-action">
              <span>Launch Consultation</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="arrow-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
