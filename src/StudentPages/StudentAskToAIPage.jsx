import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
// Import the new API functions
import { setupGeneralChatThread, loadGeneralChatHistory, askGeneralQuestion } from '../api.js';

// --- SVG Icons ---
const FaCommentsIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="24" height="24" fill="currentColor" className={className}>
    <path d="M532 32H44C19.7 32 0 51.7 0 76v224c0 24.3 19.7 44 44 44h19.3l8.4 14.6c19.1 33.1 55.4 53.4 94.9 53.4H310.4c39.5 0 75.8-20.3 94.9-53.4l8.4-14.6H436c6.4 0 12.5-1.4 18-4l80-36c13.2-5.9 22-18.7 22-32V76c0-24.3-19.7-44-44-44zM40.4 48C50.2 48 56 57.1 56 64v192c0 6.9-5.8 16-15.6 16H44c-2.2 0-4-1.8-4-4V76c0-15.5 12.5-28 28-28H40.4zM532 272l-80 36c-2.3 1-4.8 1.6-7.3 1.6H436c-13.2 0-25.4-8.1-30.8-20.3l-9.9-22.1c-2.4-5.3-7.5-8.8-13.2-8.8H192c-5.8 0-10.8 3.5-13.2 8.8l-9.9 22.1C163.4 303.9 151.2 312 138 312H112c-4.1 0-7.8-1.2-11-3.4L80 297.8V64c0-4.4 3.6-8 8-8h416c4.4 0 8 3.6 8 8V272z"/>
  </svg>
);
const FaPaperPlaneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="currentColor">
    <path d="M16.1 260.2c-22.6 12.9-20.5 47.3 3.6 57.3L160 376V479.3c0 18.1 14.6 32.7 32.7 32.7c9.7 0 18.9-4.3 25.1-11.8l62-74.3 123.9 51.6c18.9 7.9 40.8-4.5 43.9-24.7l64-416c1.9-12.1-3.4-24.3-13.1-31.2s-23.1-7.1-34.4-1.3L16.1 260.2zM224 432V345.8l-111.3-46.4L432.2 65.2 224 432z"/>
  </svg>
);
const FaSpinnerIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="40" height="40" fill="currentColor" className={className}>
    <path d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm416 0a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z"/>
  </svg>
);
// --- End SVG Icons ---

// --- Chat Message Components ---
const UserMessage = ({ text }) => (
  <div className="flex justify-end mb-3">
    <div 
      className="p-3 rounded-lg max-w-[80%]"
      style={{ backgroundColor: 'var(--accent-purple)', color: 'white' }}
    >
      <p className="text-sm">{text}</p>
    </div>
  </div>
);

const ModelMessage = ({ text }) => {
  const { isDark } = useOutletContext();
  return (
    <div className="flex justify-start mb-3">
      <div 
        className="p-3 rounded-lg max-w-[80%]"
        style={{ backgroundColor: `var(${isDark ? "--bg-dark" : "rgba(0,0,0,0.05)"})` }}
      >
        <p className="text-sm">{text}</p>
      </div>
    </div>
  );
};
// --- End Chat Message Components ---

// --- Functional Chatbox Component ---
const AIChatBox = ({ isDark, threadId }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const chatContainerRef = useRef(null);

  // Scroll to bottom when chat history changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Load chat history on component mount
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoadingHistory(true);
      // Use the new GENERAL history loader
      const historyRes = await loadGeneralChatHistory();
      
      if (historyRes.success) {
        const reversedHistory = historyRes.data.reverse(); 
        const formattedHistory = [];
        for (const item of reversedHistory) {
          formattedHistory.push({ role: 'user', content: item.prompt });
          if (item.isBadPrompt || !item.response) {
            formattedHistory.push({ role: 'model', content: "I am unable to respond to that prompt. Please ask another question." });
          } else {
            formattedHistory.push({ role: 'model', content: item.response });
          }
        }
        setChatHistory(formattedHistory);
      } else {
        alert(historyRes.message);
      }
      setIsLoadingHistory(false);
    };

    loadHistory();
  }, []); // No dependency, just loads once

  // Handle sending a new message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || !threadId || isResponding) return;

    const userMessage = currentMessage;
    setCurrentMessage(""); 
    setIsResponding(true);

    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Use the new GENERAL question function
      const response = await askGeneralQuestion(threadId, userMessage);
      
      let modelAnswer = "I'm sorry, I couldn't find an answer.";
      if (response.success) {
        modelAnswer = response.data.answer || "I am unable to respond to that prompt. Please ask another question.";
      } else {
        modelAnswer = response.message;
      }
      
      setChatHistory(prev => [...prev, { role: 'model', content: modelAnswer }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'model', content: "A network error occurred. Please try again." }]);
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <>
      {/* Chat History */}
      <div 
        ref={chatContainerRef}
        className="flex-grow min-h-0 overflow-y-auto pr-2"
      >
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <FaSpinnerIcon className="animate-spin text-3xl text-[var(--accent-purple)]" />
            <span className="ml-3" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
              Loading history...
            </span>
          </div>
        ) : (
          <>
            {chatHistory.map((msg, index) => 
              msg.role === 'user' 
                ? <UserMessage key={index} text={msg.content} />
                : <ModelMessage key={index} text={msg.content} />
            )}
            {isResponding && (
              <div className="flex justify-start mb-3">
                <div 
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: `var(${isDark ? "--bg-dark" : "rgba(0,0,0,0.05)"})` }}
                >
                  <FaSpinnerIcon className="animate-spin text-lg" />
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2 flex-shrink-0">
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder={isLoadingHistory || isResponding ? "Please wait..." : "Ask a general question..."}
          disabled={isLoadingHistory || isResponding}
          className="w-full px-4 py-3 rounded-lg border bg-transparent transition"
          style={{
            borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
            color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
          }}
        />
        <button
          type="submit"
          disabled={isLoadingHistory || isResponding}
          className="p-3 rounded-lg text-white transition"
          style={{
            background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))",
            opacity: (isLoadingHistory || isResponding) ? 0.5 : 1
          }}
        >
          <FaPaperPlaneIcon />
        </button>
      </form>
    </>
  );
};

// --- Main Page Component ---
const StudentAskToAIPage = () => {
  const { isDark } = useOutletContext();
  
  const [isChatActive, setIsChatActive] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);

  // Chat activation handler
const handleActivateChat = async () => {
  setIsChatLoading(true);
  try {
    const setupRes = await setupGeneralChatThread();

    // If backend says no credit → show nice UI message
    if (!setupRes.success) {
      if (setupRes.message.includes("credit")) {
        alert("Not enough credit to start the chat."); 
      } else {
        alert(setupRes.message);
      }
      setIsChatLoading(false);
      return;
    }

    // Success → open chat
    setThreadId(setupRes.data.thread_id);
    setIsChatActive(true);

  } catch (error) {
    alert("An error occurred while setting up the chat.");
  }
  setIsChatLoading(false);
};


  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Ask AI (General Doubts)</h1>
      
      {/* --- AI Chat Box --- */}
      <div 
        className="h-[75vh] p-6 rounded-2xl border flex flex-col relative"
        style={{
          backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        }}
      >
        <h3 className="text-xl font-bold mb-4 flex items-center gap-3 flex-shrink-0">
          <FaCommentsIcon className="text-[var(--accent-teal)]" />
          AI Assistant
        </h3>

        {!isChatActive ? (
          // 1. "Ask AI" Button (Blurry Box)
          <div 
            className="absolute inset-0 top-16 backdrop-filter backdrop-blur-md flex items-center justify-center"
            style={{
              margin: '1.5rem', // Match parent padding
              borderRadius: '0.75rem',
              backgroundColor: `var(${isDark ? "rgba(11, 12, 27, 0.5)" : "rgba(248, 249, 250, 0.5)"})`
            }}
          >
            <button
              onClick={handleActivateChat}
              disabled={isChatLoading}
              className="px-6 py-3 rounded-xl font-bold text-lg text-white flex items-center gap-3 transition"
              style={{
                background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))",
                opacity: isChatLoading ? 0.7 : 1
              }}
            >
              {isChatLoading ? (
                <FaSpinnerIcon className="animate-spin text-xl" />
              ) : (
                <FaCommentsIcon className="text-xl" />
              )}
              {isChatLoading ? "Initializing..." : "Start Chat"}
            </button>
          </div>
        ) : (
          // 2. Functional Chat Box
          <AIChatBox 
            isDark={isDark} 
            threadId={threadId} 
            // We don't pass worksheetId because this is a general chat
          />
        )}
      </div>
    </div>
  );
};

export default StudentAskToAIPage;