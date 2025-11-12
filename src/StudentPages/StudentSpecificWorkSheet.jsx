import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useParams, useNavigate, useLocation } from 'react-router-dom';
// 1. Import new API functions and Panel components
import { setupChatThread, loadChatOfSpecificWorksheet, askQ } from '../api.js';
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

// --- SVG Icons ---
const FaArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16" fill="currentColor">
    <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0 73.4-73.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
  </svg>
);
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
  // We need to get isDark, but AIChatBox is now separate.
  // We'll pass isDark as a prop.
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
const AIChatBox = ({ isDark, worksheetId, threadId }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const chatContainerRef = useRef(null);

  // Scroll to bottom (This is your overflow scroll feature)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Load chat history on component mount
  useEffect(() => {
    if (!worksheetId) return;

    const loadHistory = async () => {
      setIsLoadingHistory(true);
      const historyRes = await loadChatOfSpecificWorksheet(worksheetId);
      
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
  }, [worksheetId]);

  // Handle sending a new message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || !threadId || isResponding) return;

    const userMessage = currentMessage;
    setCurrentMessage(""); 
    setIsResponding(true);

    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await askQ(threadId, worksheetId, userMessage);
      
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
      {/* Chat History (overflow-y-auto enables scrolling) */}
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
          placeholder={isLoadingHistory || isResponding ? "Please wait..." : "Ask a question..."}
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
// --- End Chat Components ---


// --- Main Document Viewer Page ---
const StudentDocViewerPage = () => {
  const { isDark } = useOutletContext();
  const { courseId, worksheetId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { docxUrl, title } = location.state || {};

  const [isChatActive, setIsChatActive] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);

  // Error handling (Unchanged)
  if (!docxUrl) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="mb-6">No document link was provided. Please go back and select a worksheet.</p>
        <button
          onClick={() => navigate(`/student/dashboard/course/${courseId || ''}`)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white"
          style={{ background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))" }}
        >
          <FaArrowLeftIcon />
          <span className="ml-2">Go Back to Worksheets</span>
        </button>
      </div>
    );
  }

  const embedUrl = `https://docs.google.com/gview?url=${encodeURIComponent(docxUrl)}&embedded=true`;

  // Chat activation handler (Unchanged)
  const handleActivateChat = async () => {
    setIsChatLoading(true);
    try {
      const setupRes = await setupChatThread(worksheetId);
      if (setupRes.success) {
        setThreadId(setupRes.data.thread_id);
        setIsChatActive(true);
      } else {
        alert(setupRes.message);
      }
    } catch (error) {
      alert("An error occurred while setting up the chat.");
    }
    setIsChatLoading(false);
  };

  return (
    // Main layout container (Unchanged)
    <div className="flex flex-col h-[calc(100vh_-_theme('spacing.20'))] -mt-6 -ml-6 md:-mt-10 md:-ml-10"> 
      
      {/* Header (Unchanged) */}
      <div 
        className="flex items-center gap-4 p-4 flex-shrink-0"
        style={{
          backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
          borderBottomWidth: "1px"
        }}
      >
        <button
          onClick={() => navigate(`/student/dashboard/course/${courseId}`)} 
          className="p-3 rounded-full transition"
          style={{ backgroundColor: `var(${isDark ? "--bg-dark" : "--border-light"})`}}
        >
          <FaArrowLeftIcon />
        </button>
        <h1 className="text-xl font-bold truncate">{title || "Worksheet Viewer"}</h1>
      </div>

      {/* 2. --- UPDATED: Main Content Area with Resizable Panels --- */}
      {/* This PanelGroup replaces the old "flex-col lg:flex-row" div */}
      <PanelGroup direction="horizontal" className="flex-grow min-h-0 p-6 gap-2">
        
        {/* --- Left Panel: Document Viewer --- */}
        <Panel defaultSize={70} minSize={30}>
          <div 
            className="w-full h-full rounded-2xl border"
            style={{
              borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
              backgroundColor: `var(${isDark ? "--bg-dark" : "white"})`
            }}
          >
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              className="rounded-2xl"
            >
              <div className="flex items-center justify-center h-full">
                <FaSpinnerIcon className="animate-spin text-4xl" />
                <span className="ml-4 text-lg">Loading document...</span>
              </div>
            </iframe>
          </div>
        </Panel>
        
        {/* --- Vertical Resize Handle --- */}
        <PanelResizeHandle className="resize-handle-vertical" />

        {/* --- Right Panel: AI Chat & Doubts --- */}
        <Panel defaultSize={30} minSize={20}>
          {/* This panel is a vertical group */}
          <PanelGroup direction="vertical" className="h-full gap-2">

            {/* --- Top Panel: AI Chat Box --- */}
            <Panel defaultSize={75} minSize={30}>
              <div 
                className="h-full p-6 rounded-2xl border flex flex-col relative"
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
                  // "Ask AI" Button
                  <div 
                    className="absolute inset-0 top-16 backdrop-filter backdrop-blur-md flex items-center justify-center"
                    style={{
                      margin: '1.5rem',
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
                      {isChatLoading ? <FaSpinnerIcon className="animate-spin text-xl" /> : <FaCommentsIcon className="text-xl" />}
                      {isChatLoading ? "Initializing..." : "Ask AI"}
                    </button>
                  </div>
                ) : (
                  // Functional Chat Box
                  <AIChatBox 
                    isDark={isDark} 
                    worksheetId={worksheetId} 
                    threadId={threadId} 
                  />
                )}
              </div>
            </Panel>

            {/* --- Horizontal Resize Handle --- */}
            <PanelResizeHandle className="resize-handle-horizontal" />
            
            {/* --- Bottom Panel: Ask Doubt Box --- */}
            <Panel defaultSize={25} minSize={20}>
              <div 
                className="h-full p-6 rounded-2xl border flex flex-col justify-center"
                style={{
                  backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
                  borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
                }}
              >
                <h3 className="text-xl font-bold mb-3">Still Stuck?</h3>
                <button
                  onClick={() => alert("This will open a modal to ask your teacher!")}
                  className="w-full px-4 py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))"
                  }}
                >
                  <FaPaperPlaneIcon />
                  <span className="ml-2">Ask a Teacher</span>
                </button>
              </div>
            </Panel>

          </PanelGroup>
        </Panel>

      </PanelGroup>

      {/* 3. --- NEW STYLE BLOCK FOR RESIZE HANDLES --- */}
      <style>{`
        .resize-handle-vertical {
          width: 8px; /* Hit area */
          cursor: col-resize;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
        }
        .resize-handle-vertical > div {
          /* This creates the "two-line" look */
          width: 2px;
          height: 30px;
          background-color: transparent;
          border-left: 1px solid var(${isDark ? "--border-dark" : "--border-light"});
          border-right: 1px solid var(${isDark ? "--border-dark" : "--border-light"});
          opacity: 0.5;
        }
        .resize-handle-vertical[data-resize-handle-active] > div,
        .resize-handle-vertical:hover > div {
          /* On hover/drag, show a solid bar */
          background-color: var(--accent-teal);
          border: none;
          opacity: 1;
        }

        .resize-handle-horizontal {
          height: 8px; /* Hit area */
          cursor: row-resize;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
        }
        .resize-handle-horizontal > div {
          /* This creates the "two-line" look */
          height: 2px;
          width: 30px;
          background-color: transparent;
          border-top: 1px solid var(${isDark ? "--border-dark" : "--border-light"});
          border-bottom: 1px solid var(${isDark ? "--border-dark" : "--border-light"});
          opacity: 0.5;
        }
        .resize-handle-horizontal[data-resize-handle-active] > div,
        .resize-handle-horizontal:hover > div {
          /* On hover/drag, show a solid bar */
          background-color: var(--accent-teal);
          border: none;
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default StudentDocViewerPage;