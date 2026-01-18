import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  FaChalkboardTeacher, 
  FaSpinner, 
  FaExternalLinkAlt, 
  FaLightbulb,
  FaExclamationCircle,
  FaRedo
} from 'react-icons/fa';
import { getMyBoardLink } from '../api.js'; 

// --- 1. BACKGROUND COMPONENT (Matches Assignment Page) ---
const SpaceBackground = ({ isDark }) => {
  const bgStyle = isDark ? {
    backgroundColor: '#02040a', 
    backgroundImage: `
      radial-gradient(at 10% 10%, rgba(139, 92, 246, 0.2) 0px, transparent 50%),   /* Violet Top Left */
      radial-gradient(at 90% 10%, rgba(56, 189, 248, 0.2) 0px, transparent 50%),    /* Blue Top Right */
      radial-gradient(at 50% 80%, rgba(124, 58, 237, 0.15) 0px, transparent 60%)    /* Deep Purple Bottom */
    `
  } : {
    backgroundColor: '#f8fafc',
    backgroundImage: `
      radial-gradient(at 10% 10%, rgba(167, 139, 250, 0.3) 0px, transparent 50%),   /* Soft Violet */
      radial-gradient(at 90% 10%, rgba(14, 165, 233, 0.25) 0px, transparent 50%),   /* Sky Blue */
      radial-gradient(at 50% 90%, rgba(139, 92, 246, 0.1) 0px, transparent 50%)     /* Bottom wash */
    `
  };

  return (
    <div 
      className="fixed inset-0 pointer-events-none -z-10" 
      style={{
        ...bgStyle,
        backgroundAttachment: 'fixed', 
        backgroundSize: 'cover'
      }} 
    />
  );
};

// --- 2. MAIN COMPONENT ---
const StudentWhiteboardPage = () => {
  const context = useOutletContext();
  const isDark = context?.isDark ?? true;
  
  const [boardLink, setBoardLink] = useState(null);
  const [loading, setLoading] = useState(true); // API Fetching state
  const [iframeLoading, setIframeLoading] = useState(true); // Iframe loading state

  // Fetch Link
  useEffect(() => {
    const fetchLink = async () => {
      setLoading(true);
      const res = await getMyBoardLink();
      if (res.success && res.data && res.data.board_link) {
        setBoardLink(res.data.board_link);
      } else {
        setBoardLink(null); 
      }
      setLoading(false);
    };
    fetchLink();
  }, []);

  const handleRefresh = () => {
    setIframeLoading(true);
    const iframe = document.getElementById('whiteboard-frame');
    if (iframe) iframe.src = iframe.src; // Reload iframe
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      <SpaceBackground isDark={isDark} />

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 w-full h-full flex flex-col">
        
        {/* 1. Header Section */}
        <div className="flex items-center justify-between mb-4 shrink-0 px-1">
          <div>
            <h1 className={`text-3xl font-extrabold flex items-center gap-3 ${isDark ? "text-white" : "text-slate-800"}`}>
              <FaChalkboardTeacher className="text-violet-400" /> Your Board
            </h1>
            <p className={`mt-1 text-sm font-medium ${isDark ? "text-gray-400" : "text-slate-500"}`}>
              Collaborate and brainstorm in real-time.
            </p>
          </div>

          {/* Action Buttons (External Link / Refresh) */}
          {boardLink && (
            <div className="flex gap-3">
               <button 
                 onClick={handleRefresh}
                 title="Reload Board"
                 className={`p-3 rounded-xl transition-all shadow-sm ${isDark ? "bg-white/5 hover:bg-white/10 text-white border border-white/10" : "bg-white hover:bg-gray-50 text-slate-700 border border-gray-200"}`}
               >
                 <FaRedo className={`${iframeLoading ? 'animate-spin' : ''}`} />
               </button>
               <a 
                  href={boardLink} 
                  target="_blank" 
                  rel="noreferrer"
                  title="Open in Full Tab"
                  className={`p-3 rounded-xl transition-all shadow-sm ${isDark ? "bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 border border-violet-500/20" : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200 border border-indigo-200"}`}
              >
                  <FaExternalLinkAlt />
              </a>
            </div>
          )}
        </div>

        {/* 2. Main Area */}
        <div className="flex-1 relative w-full h-full min-h-[75vh]">
          
          {/* STATE A: API Loading */}
          {loading ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`p-8 rounded-3xl border border-dashed flex flex-col items-center gap-4 ${isDark ? "border-white/10 bg-white/5" : "border-gray-300 bg-white/50"}`}>
                   <FaSpinner className="animate-spin text-3xl text-violet-500" />
                   <span className={`text-sm font-bold ${isDark ? "text-gray-400" : "text-slate-500"}`}>Fetching board details...</span>
                </div>
             </div>
          ) : !boardLink ? (
             
             /* STATE B: No Board Found */
             <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <div className={`max-w-md w-full p-10 rounded-3xl border text-center shadow-xl backdrop-blur-md ${isDark ? "bg-[#13111C]/80 border-white/10" : "bg-white/80 border-white"}`}>
                   <div className="w-20 h-20 bg-gray-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FaExclamationCircle className="text-4xl text-gray-400" />
                   </div>
                   <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-800"}`}>No Board Assigned</h3>
                   <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                     You don't have a collaborative board link yet. Ask your teacher to assign one!
                   </p>
                </div>
             </div>

          ) : (
             
             /* STATE C: The Widget (Matches Assignments UI) */
             <div className={`
               w-full h-full rounded-3xl overflow-hidden border shadow-2xl relative transition-all duration-500
               ${isDark ? "bg-[#0f172a] border-white/10" : "bg-white border-slate-200 shadow-violet-500/10"}
             `}>
               
               {/* Loader Overlay (Matches Assignments) */}
               {iframeLoading && (
                 <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-inherit backdrop-blur-sm">
                    {/* Blue/Violet Circular Loader */}
                    <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4"></div>
                    <span className={`font-bold text-sm animate-pulse tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                       LOADING BOARD...
                    </span>
                 </div>
               )}

               <iframe 
                 id="whiteboard-frame"
                 src={boardLink} 
                 title="Student Board" 
                 className={`w-full h-full transition-opacity duration-700 ${iframeLoading ? 'opacity-0' : 'opacity-100'}`}
                 frameBorder="0"
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-modals allow-presentation"
                 loading="lazy"
                 onLoad={() => setIframeLoading(false)}
               />
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentWhiteboardPage;