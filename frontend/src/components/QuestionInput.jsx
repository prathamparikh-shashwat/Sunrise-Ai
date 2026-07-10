import React, { useState, useEffect, useRef } from 'react';

export default function QuestionInput({ question, onSubmit }) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Reset value and focus on new question
  useEffect(() => {
    setInputValue('');
    setError('');
    if (question && (question.type === 'number' || question.type === 'text' || question.type === 'email' || question.allow_custom)) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  }, [question]);

  if (!question) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const cleanVal = inputValue.trim();

    if (!cleanVal) {
      setError('Please enter a response.');
      return;
    }

    if (question.type === 'number') {
      const num = Number(cleanVal);
      if (isNaN(num) || num < 0) {
        setError('Please enter a valid positive number.');
        return;
      }
    }

    if (question.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanVal)) {
        setError('Please enter a valid email address.');
        return;
      }
    }

    onSubmit(cleanVal);
    setInputValue('');
    setError('');
  };

  return (
    <div className="input-panel">
      {question.type === 'single_select' ? (
        <div className="options-container">
          <p className="options-hint">Select one option to continue:</p>
          <div className="options-grid" style={{ marginBottom: question.allow_custom ? '1rem' : '0' }}>
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => onSubmit(option)}
                className="option-chip"
                id={`option-${question.id}-${idx}`}
              >
                <span className="option-bullet"></span>
                <span className="option-text">{option}</span>
              </button>
            ))}
          </div>
          
          {question.allow_custom && (
            <form onSubmit={handleFormSubmit} className="number-input-form animate-fade-in" style={{ marginTop: '1rem' }}>
              <p className="options-hint">Or type your custom business type here:</p>
              <div className="number-input-wrapper">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type custom business (e.g. Salon, Software, Restaurant...)"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    if (error) setError('');
                  }}
                  className={`number-field ${error ? 'field-error' : ''}`}
                  id={`input-custom-${question.id}`}
                />
                <button type="submit" className="submit-arrow-btn" id={`submit-btn-custom-${question.id}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="send-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                </button>
              </div>
              {error && <span className="error-message">{error}</span>}
            </form>
          )}
        </div>
      ) : (
        <form onSubmit={handleFormSubmit} className="number-input-form">
          <div className="number-input-wrapper">
            <input
              ref={inputRef}
              type={question.type === 'number' ? 'number' : question.type === 'email' ? 'email' : 'text'}
              min={question.type === 'number' ? '0' : undefined}
              placeholder={
                question.type === 'number' 
                  ? 'Type a number...' 
                  : question.type === 'email' 
                    ? 'Enter your email address...' 
                    : 'Type your response here...'
              }
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (error) setError('');
              }}
              className={`number-field ${error ? 'field-error' : ''}`}
              id={`input-${question.id}`}
            />
            <button type="submit" className="submit-arrow-btn" id={`submit-btn-${question.id}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="send-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </div>
          {error && <span className="error-message">{error}</span>}
        </form>
      )}
    </div>
  );
}
