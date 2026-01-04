import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; 
import ReactMarkdown from 'react-markdown'; // Import Markdown
import remarkGfm from 'remark-gfm'; // Import GFM plugin
import { 
  FaPaperPlane, 
  FaRegLightbulb, 
  FaStar, 
  FaMagic, 
  FaQuestionCircle, 
  FaCompass 
} from 'react-icons/fa';
import { MdAutoAwesome } from "react-icons/md";
import { setupGeneralChatThread, loadGeneralChatHistory, askGeneralQuestion } from '../api.js';

// --- Animation Variants ---
const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 50, damping: 20 }
  }
};

const contentVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 } 
  }
};

const footerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { delay: 0.2, type: "spring", stiffness: 50, damping: 20 }
  }
};

// --- Components ---

const BigSuggestionChip = ({ icon, text, onClick, isDark }) => (
  <motion.button 
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 rounded-full border transition-all duration-300 group backdrop-blur-sm
      ${isDark 
        ? "border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-400/50" 
        : "border-gray-200 bg-white/60 hover:bg-white hover:border-cyan-400/50 shadow-sm"
      }
    `}
  >
    <span className="text-cyan-400 group-hover:text-cyan-300 transition-colors">{icon}</span>
    <span 
      className={`text-sm font-medium transition-colors
        ${isDark 
           ? "text-gray-400 group-hover:text-white" 
           : "text-gray-600 group-hover:text-black font-semibold"
        }
      `}
    >
      {text}
    </span>
  </motion.button>
);

const QuickSuggestionChip = ({ text, onClick, isDark }) => (
  <motion.button 
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-300 whitespace-nowrap backdrop-blur-md
      ${isDark
        ? "border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/15 text-cyan-400 hover:text-cyan-200"
        : "border-cyan-500/20 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 hover:text-black font-semibold"
      }
    `}
  >
    {text}
  </motion.button>
);

// --- UPDATED CHAT MESSAGE WITH MARKDOWN SUPPORT ---
const ChatMessage = ({ role, text, isDark }) => {
  const isUser = role === 'user';
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} px-4`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0 mr-3 shadow-lg shadow-cyan-500/20 mt-1">
           <MdAutoAwesome className="text-white text-sm" />
        </div>
      )}
      <div 
        className={`relative px-5 py-3.5 max-w-[85%] md:max-w-[75%] text-sm leading-relaxed shadow-md backdrop-blur-sm
          ${isUser 
            ? 'bg-cyan-600/90 text-white rounded-2xl rounded-tr-sm' 
            : isDark 
              ? 'bg-[#1e293b]/80 text-gray-100 rounded-2xl rounded-tl-sm border border-white/5' 
              : 'bg-white/80 text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100'
          }
        `}
      >
        {/* Render Markdown Here */}
        <ReactMarkdown 
          children={text} 
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom styling for specific Markdown elements to fit the chat theme
            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
            li: ({node, ...props}) => <li className="" {...props} />,
            strong: ({node, ...props}) => <span className="font-bold opacity-100" {...props} />,
            a: ({node, ...props}) => <a className="text-cyan-300 underline hover:text-cyan-200" target="_blank" rel="noopener noreferrer" {...props} />,
            code: ({node, inline, className, children, ...props}) => {
                return inline ? (
                  <code className="bg-black/20 px-1 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>
                ) : (
                  <div className="bg-black/30 p-3 rounded-lg my-2 overflow-x-auto border border-white/10">
                     <code className="text-xs font-mono" {...props}>{children}</code>
                  </div>
                )
            }
          }}
        />
      </div>
    </motion.div>
  );
};

const StudentAskToAIPage = () => {
  const context = useOutletContext();
  const isDark = context?.isDark ?? true;
  const userData = context?.userData || { username: "Explorer" };
  const userName = userData.username;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [threadId, setThreadId] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const threadRes = await setupGeneralChatThread();
        if (!threadRes.success) {
           setMessages([{ role: 'model', text: "I'm having trouble connecting. " + threadRes.message }]);
           setIsLoading(false);
           return;
        }
        setThreadId(threadRes.data.thread_id);

        const historyRes = await loadGeneralChatHistory();
        if (historyRes.success && historyRes.data.length > 0) {
          const reversedHistory = [...historyRes.data].reverse();
          const formattedHistory = [];
          reversedHistory.forEach(item => {
            formattedHistory.push({ role: 'user', text: item.prompt });
            if (item.isBadPrompt) {
              formattedHistory.push({ role: 'model', text: "I cannot answer that as it violates safety guidelines." });
            } else if (item.response) {
              formattedHistory.push({ role: 'model', text: item.response });
            }
          });
          setMessages(formattedHistory);
        }
      } catch (error) {
        console.error("Chat Init Error", error);
      } finally {
        setIsLoading(false);
      }
    };
    initializeChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSend = async () => {
    if (!inputText.trim() || !threadId || isSending) return;
    const textToSend = inputText;
    setInputText("");
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsSending(true);

    try {
      const response = await askGeneralQuestion(threadId, textToSend);
      let botReply = "Communication interrupted.";
      if (response.success) {
        botReply = response.data.answer || "I received your message but couldn't generate a response.";
      } else {
        botReply = response.message;
      }
      setMessages(prev => [...prev, { role: 'model', text: botReply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "System error. Please try again." }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSuggestionClick = (text) => {
    setInputText(text + " "); 
    inputRef.current?.focus(); 
  };

  const suggestions = [
    { icon: <FaQuestionCircle />, text: "What should I learn today?" },
    { icon: <FaStar />, text: "Tell me something cool!" },
    { icon: <FaMagic />, text: "Help me understand..." },
    { icon: <FaCompass />, text: "I'm curious about..." },
  ];

  return (
    <div className="flex flex-col h-screen relative overflow-hidden">
      
      {/* Global Background Nebula Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[150px]"
          />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 2 }}
            className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[150px]"
          />
          <motion.div 
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[30%] left-[20%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]"
          />
      </div>

      {/* Header */}
      <motion.div 
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className={`flex items-center justify-between m-4 px-6 py-4 rounded-2xl z-20 backdrop-blur-xl border border-white/5 transition-colors shadow-lg
          ${isDark ? "bg-[#0f172a]/60" : "bg-white/60"}
        `}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <MdAutoAwesome className="text-white text-lg" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Spark <span className="text-cyan-400 text-sm align-top">✨</span>
            </h2>
            <p className="text-xs text-gray-500 font-medium">Friendly & Curious • Here to help you explore!</p>
          </div>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto px-2 custom-scrollbar relative z-10 pt-2 pb-4">
        <AnimatePresence mode="wait">
          
          {/* 1. LOADING STATE */}
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            </motion.div>
          ) 
          
          /* 2. EMPTY STATE */
          : messages.length === 0 ? (
            <motion.div 
              key="empty"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto px-4"
            >
              <div className={`p-8 rounded-3xl border mb-10 text-left w-full relative overflow-hidden shadow-2xl backdrop-blur-md
                 ${isDark ? "bg-[#111827]/60 border-white/10" : "bg-white/60 border-gray-200"}`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 blur-[50px] rounded-full"></div>
                
                <div className="flex items-start gap-5 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
                    <MdAutoAwesome className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-2xl mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                      Hey {userName}! 👋
                    </h3>
                    <p className={`text-base leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                      I'm Spark, your personal learning companion. Ask me anything, explore new topics, or let's solve a problem together!
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full">
                 <p className="text-gray-500 text-sm mb-4 flex items-center gap-2 font-medium">
                   <FaRegLightbulb className="text-yellow-500" /> Not sure where to start?
                 </p>
                 <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                   {suggestions.map((s, idx) => (
                      <BigSuggestionChip 
                        key={idx}
                        icon={s.icon} 
                        text={s.text} 
                        onClick={() => handleSuggestionClick(s.text)}
                        isDark={isDark} 
                      />
                   ))}
                 </div>
              </div>
            </motion.div>
          ) 
          
          /* 3. CHAT HISTORY STATE */
          : (
            <motion.div 
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pb-4 pt-2"
            >
              {messages.map((msg, idx) => (
                <ChatMessage 
                  key={idx} 
                  role={msg.role} 
                  text={msg.text} 
                  isDark={isDark} 
                />
              ))}
              {isSending && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start mb-6 px-4"
                >
                   <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0 mr-3 mt-1 opacity-50">
                      <MdAutoAwesome className="text-white text-sm animate-pulse" />
                   </div>
                   <div className={`px-5 py-3.5 rounded-2xl rounded-tl-sm text-sm ${isDark ? 'bg-[#1e293b]/50 text-gray-400' : 'bg-gray-100/50 text-gray-500'}`}>
                      Thinking...
                   </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <motion.div 
        variants={footerVariants}
        initial="hidden"
        animate="visible"
        className="m-4 mt-0 relative z-20"
      >
        
        {messages.length > 0 && (
          <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar px-1 py-1 mask-linear-fade">
             {suggestions.map((s, idx) => (
                <QuickSuggestionChip 
                  key={idx}
                  text={s.text}
                  onClick={() => handleSuggestionClick(s.text)}
                  isDark={isDark} 
                />
             ))}
          </div>
        )}

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className={`flex items-center gap-2 p-2 rounded-2xl border transition-all duration-300 backdrop-blur-xl
            ${isDark 
              ? "bg-[#0f172a]/80 border-white/10 focus-within:border-cyan-500/50 shadow-lg shadow-black/20" 
              : "bg-white/80 border-gray-200 focus-within:border-cyan-500/50 shadow-lg shadow-gray-200/50"
            }
          `}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Spark anything..."
            disabled={isLoading || isSending}
            className={`flex-1 bg-transparent px-4 py-3 outline-none text-sm placeholder-gray-500
              ${isDark ? "text-white" : "text-gray-900"}
            `}
          />
          <button
            type="submit"
            disabled={isLoading || isSending || !inputText.trim()}
            className={`p-3 rounded-xl transition-all duration-300
              ${!inputText.trim() 
                ? "text-gray-500 bg-transparent" 
                : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transform hover:scale-105 active:scale-95"
              }
            `}
          >
            <FaPaperPlane className="text-sm" />
          </button>
        </form>
        
        <p className="text-center text-[10px] text-gray-500 mt-2 opacity-60">
          Spark is friendly and ready to help!
        </p>
      </motion.div>

    </div>
  );
};

export default StudentAskToAIPage;