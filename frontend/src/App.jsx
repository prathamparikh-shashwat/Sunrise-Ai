import React, { useState, useEffect, useRef } from 'react';
import ProgressTracker from './components/ProgressTracker';
import MessageItem from './components/MessageItem';
import QuestionInput from './components/QuestionInput';
import ReportDashboard from './components/ReportDashboard';
import { submitAnswers } from './api/client';

// Import JSON question files
import tailoringData from './data/tailoring.json';
import retailData from './data/retail.json';
import cattlefeedData from './data/cattlefeed.json';
import generalData from './data/general.json';

const businessSelectionQuestion = {
  id: 'business_type',
  question: "Welcome to Sunrise AI Consultant. Please tell us your business:",
  type: 'text'
};

function App() {
  const [stage, setStage] = useState('chat'); // 'chat' | 'report' | 'loading'
  const [businessType, setBusinessType] = useState(null); // 'tailoring' | 'retail' | 'general' | null
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(-1); // -1 represents business selection
  const [answers, setAnswers] = useState({});
  const [sheetSync, setSheetSync] = useState({ status: 'idle' });
  const [suggestions, setSuggestions] = useState(null);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: businessSelectionQuestion.question
    }
  ]);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to the bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (stage === 'chat') {
      scrollToBottom();
    }
  }, [messages, stage]);

  // Determine current active questions
  const getQuestions = () => {
    if (businessType === 'tailoring') return tailoringData.questions;
    if (businessType === 'retail') return retailData.questions;
    if (businessType === 'cattlefeed') return cattlefeedData.questions;
    if (businessType === 'general') return generalData.questions;
    return [];
  };

  const getBusinessName = () => {
    if (businessType === 'tailoring') return tailoringData.business_type;
    if (businessType === 'retail') return retailData.business_type;
    if (businessType === 'cattlefeed') return cattlefeedData.business_type;
    if (businessType === 'general') return generalData.business_type;
    return '';
  };

  // Submit answers to Google Sheets via backend API
  const submitToGoogleSheets = async (type, finalAnswers) => {
    setSheetSync({ status: 'saving' });
    try {
      const data = await submitAnswers(type, finalAnswers);
      setSheetSync({
        status: 'success',
        message: data.message,
        url: data.spreadsheet_url,
      });
      if (data.suggestions) {
        setSuggestions({
          list: data.suggestions,
          source: data.ai_source,
          message: data.ai_message
        });
      }
      // Hold on the loading screen for a brief period to allow smooth animation
      setTimeout(() => {
        setStage('report');
      }, 1500);
    } catch (error) {
      setSheetSync({
        status: 'error',
        message: error.message,
      });
      // Transition to report page even on error to display the error status
      setTimeout(() => {
        setStage('report');
      }, 1500);
    }
  };

  // Process user answer submission
  const handleAnswerSubmit = (value) => {
    // Case 1: Initial business selection question (with keyword matching logic)
    if (activeQuestionIndex === -1) {
      const normalized = value.toLowerCase().trim();
      let type = 'general';
      let displayType = 'General Business';

      // Keyword lists for mapping custom inputs
      const tailoringKeywords = ['tailor', 'stitch', 'boutique', 'garment', 'dressmaking', 'alteration', 'sew', 'couture', 'fashion design'];
      const retailKeywords = ['retail', 'shop', 'store', 'supermarket', 'groceries', 'market', 'mall', 'pos', 'billing', 'sales', 'boutique shop', 'pharmacy', 'merchant'];
      const cattlefeedKeywords = ['feed', 'cattle', 'livestock', 'fodder', 'animal feed', 'cattlefeed', 'dairy feed', 'poultry feed', 'grain mill'];

      const matchesTailoring = tailoringKeywords.some(keyword => normalized.includes(keyword));
      const matchesRetail = retailKeywords.some(keyword => normalized.includes(keyword));
      const matchesCattlefeed = cattlefeedKeywords.some(keyword => normalized.includes(keyword));

      // Quick check: if exact button clicked, map directly
      if (value === 'Tailoring Business') {
        type = 'tailoring';
        displayType = 'Tailoring Business';
      } else if (value === 'Retail Shop') {
        type = 'retail';
        displayType = 'Retail Shop';
      } else if (value === 'Cattle Feed Business' || value === 'Cattle Feed') {
        type = 'cattlefeed';
        displayType = 'Cattle Feed Business';
      } else if (matchesTailoring) {
        type = 'tailoring';
        displayType = 'Tailoring Business';
      } else if (matchesRetail) {
        type = 'retail';
        displayType = 'Retail Shop';
      } else if (matchesCattlefeed) {
        type = 'cattlefeed';
        displayType = 'Cattle Feed Business';
      }

      setBusinessType(type);
      setAnswers({
        business_type: value
      });
      setActiveQuestionIndex(0);

      // Append user answer bubble
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: value }
      ]);

      const questionsList = type === 'tailoring' 
        ? tailoringData.questions 
        : type === 'retail' 
          ? retailData.questions 
          : type === 'cattlefeed'
            ? cattlefeedData.questions
            : generalData.questions;

      const firstQuestion = questionsList[0];

      // Formulate conversational bot welcome message
      let welcomeMsg = '';
      if (type === 'general') {
        welcomeMsg = `Understood. Initializing our General Business diagnostic engine for "${value}". Let's start.`;
      } else {
        welcomeMsg = `Understood. Mapping "${value}" to our ${displayType} diagnostic engine. Let's start.`;
      }

      // Append bot welcome and first question
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: welcomeMsg
          },
          {
            sender: 'bot',
            text: firstQuestion.question
          }
        ]);
      }, 350);
      return;
    }

    // Case 2: Standard questionnaire questions
    const questions = getQuestions();
    const currentQ = questions[activeQuestionIndex];

    // Record response
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: value
    }));

    // Append user message
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: value }
    ]);

    // Move to next question or compile report
    const nextIndex = activeQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setActiveQuestionIndex(nextIndex);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: questions[nextIndex].question }
        ]);
      }, 350);
    } else {
      // Build final answers dictionary including the final answer
      const finalAnswers = {
        ...answers,
        [currentQ.id]: value
      };
      
      // Transition to loading screen immediately
      setStage('loading');

      // Submit responses to Google Sheets backend
      submitToGoogleSheets(businessType, finalAnswers);
    }
  };

  // Reset chat state to beginning
  const handleReset = () => {
    setStage('chat');
    setBusinessType(null);
    setActiveQuestionIndex(-1);
    setAnswers({});
    setSheetSync({ status: 'idle' });
    setSuggestions(null);
    setMessages([
      {
        sender: 'bot',
        text: businessSelectionQuestion.question
      }
    ]);
  };

  const questions = getQuestions();

  return (
    <>
      <header className="app-header">
        <div className="brand-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="brand-logo-svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3M18 9l3 3-3 3M6 9l-3 3 3 3" />
          </svg>
          <div>
            <span className="brand-name">Sunrise</span>
            <span className="brand-tagline">AI Consultant</span>
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
          MODE: CONVERSATIONAL DIAGNOSTIC
        </div>
      </header>

      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {stage === 'chat' && (
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }} className="animate-fade-in">
            {businessType && (
              <ProgressTracker 
                current={activeQuestionIndex + 1} 
                total={questions.length} 
                businessName={getBusinessName()} 
                onReset={handleReset} 
              />
            )}
            
            <div className="chat-container">
              <div className="chat-messages">
                {messages.map((msg, index) => (
                  <MessageItem key={index} message={msg} />
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              <QuestionInput 
                question={
                  activeQuestionIndex === -1 
                    ? businessSelectionQuestion 
                    : questions[activeQuestionIndex]
                } 
                onSubmit={handleAnswerSubmit} 
              />
            </div>
          </div>
        )}

        {stage === 'loading' && (
          <div className="loading-screen animate-fade-in">
            <div className="loading-card">
              <div className="loading-pulse-container">
                <div className="pulse-circle pulse-1"></div>
                <div className="pulse-circle pulse-2"></div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="loading-icon-svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21L15.607 13H10.187L11 9L4.393 17H9.813z" />
                </svg>
              </div>
              <h2 className="loading-title">Just a moment, AI is analyzing...</h2>
              <p className="loading-subtitle-exact">just a moment ai is nalysis</p>
              <div className="loading-bar-container">
                <div className="loading-bar-progress"></div>
              </div>
              <p className="loading-status-text">Processing your responses & generating strategic suggestions</p>
            </div>
          </div>
        )}

        {stage === 'report' && (
          <ReportDashboard 
            businessType={businessType} 
            answers={answers} 
            questions={questions}
            sheetSync={sheetSync}
            suggestions={suggestions}
            onReset={handleReset} 
          />
        )}
      </main>
    </>
  );
}

export default App;
