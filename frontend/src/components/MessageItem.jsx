import React, { useEffect, useState } from 'react';

export default function MessageItem({ message }) {
  const { sender, text } = message;
  const isBot = sender === 'bot';

  return (
    <div className={`message-wrapper ${isBot ? 'bot-wrapper' : 'user-wrapper'}`}>
      {isBot && (
        <div className="avatar-container">
          <div className="avatar-glow"></div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="avatar-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21m0 0-.813-5.096M9 21h3m-3.097-14.704 5.097 5.096m0 0-5.097 5.097M13.9 11.3l-5.097-5.097m0 0L3 11.3m5.8-5.097v14.7M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
      )}
      
      <div className={`message-bubble ${isBot ? 'bot-bubble' : 'user-bubble'}`}>
        <p className="message-text">{text}</p>
      </div>

      {!isBot && (
        <div className="user-avatar-container">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="user-avatar-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
      )}
    </div>
  );
}
