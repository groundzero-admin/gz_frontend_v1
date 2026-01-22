import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaBookOpen, 
  FaExternalLinkAlt, 
  FaRocket
} from 'react-icons/fa';
import { fetchMyAssignments } from '../api.js'; 

// --- ANIMATION VARIANTS ---
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
};

// --- BACKGROUND COMPONENT (Optimized: Static CSS) ---
const SpaceBackground = ({ isDark }) => {
  const bgStyle = isDark ? {
    backgroundColor: '#02040a', 
    backgroundImage: `
      radial-gradient(at 0% 0%, rgba(139, 92, 246, 0.25) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(56, 189, 248, 0.25) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.15) 0px, transparent 50%),
      radial-gradient(at 0% 100%, rgba(56, 189, 248, 0.15) 0px, transparent 50%)
    `
  } : {
    backgroundColor: '#ffffff',
    backgroundImage: `
      radial-gradient(at 0% 0%, rgba(167, 139, 250, 0.3) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(14, 165, 233, 0.25) 0px, transparent 50%),
      radial-gradient(at 50% 50%, rgba(255, 255, 255, 0.8) 0px, transparent 100%)
    `
  };

  return (
    <div 
      className="fixed inset-0 pointer-events-none" 
      style={{
        ...bgStyle,
        zIndex: 0, 
        backgroundAttachment: 'fixed', 
        backgroundSize: 'cover'
      }} 
    />
  );
};

// --- UPDATED: Assignment Card ---
// --- UPDATED: Assignment Card (Allows more text) ---
const AssignmentCard = ({ data, isDark, onClick }) => (
  <motion.div
    variants={cardVariants}
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onClick(data)}
    className={`
      cursor-pointer relative overflow-hidden rounded-3xl p-5 border shadow-lg transition-all flex flex-col h-full transform-gpu
      ${isDark 
        ? "bg-[#13111C] border-white/10 hover:border-violet-500/50 hover:bg-[#1A1625]" 
        : "bg-white border-white/60 shadow-indigo-500/5 hover:border-indigo-300 hover:shadow-indigo-500/10"
      }
    `}
  >
    {/* Decorative Blob (Static) */}
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-60 
      ${isDark ? "bg-violet-500/20" : "bg-indigo-400/20"}`} 
    />

    <div className="relative z-10 flex flex-col h-full">
      {/* --- ROW 1: Icon : Title --- */}
      <div className="flex justify-between items-start mb-3 gap-3">
        {/* Left Side: Icon & Title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`shrink-0 p-3 rounded-2xl ${isDark ? "bg-white/5 text-violet-400" : "bg-indigo-50 text-indigo-600"}`}>
            <FaBookOpen size={18} />
          </div>
          <h3 className={`text-lg font-bold truncate ${isDark ? "text-white" : "text-slate-800"}`}>
            {data.assignment_title}
          </h3>
        </div>

        {/* Right Side: Date */}
        <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full border whitespace-nowrap 
          ${isDark ? "bg-white/5 border-white/10 text-gray-400" : "bg-gray-50 border-indigo-100 text-gray-500"}`}>
          {new Date(data.createdAt).toLocaleDateString()}
        </span>
      </div>
      
      {/* --- ROW 2: Description (UPDATED HERE) --- */}
      {/* Changed 'line-clamp-2' to 'line-clamp-5' to allow ~50 words before truncating */}
      <p className={`text-sm mb-4 line-clamp-5 flex-grow ${isDark ? "text-gray-400" : "text-slate-600"}`}>
        {data.assignment_description}
      </p>

      {/* --- ROW 3: Open Assignment --- */}
      <div className={`mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${isDark ? "text-violet-400" : "text-indigo-600"}`}>
        <span>Open Assignment</span>
        <FaArrowLeft className="rotate-180" />
      </div>
    </div>
  </motion.div>
);

// --- SUB-COMPONENT: Iframe Viewer (With Blue Loader) ---
const AssignmentViewer = ({ assignment, isDark, onBack }) => {
  // Local state to track iframe loading status
  const [iframeLoading, setIframeLoading] = useState(true);

  return (
    <div className="flex flex-col w-full h-[calc(100vh-5rem)] relative z-10"> 
      
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <button 
          onClick={onBack}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-md backdrop-blur-md
            ${isDark 
              ? "bg-white/10 text-white hover:bg-white/20 border border-white/10" 
              : "bg-white/80 text-slate-700 hover:bg-white border border-gray-200"
            }
          `}
        >
          <FaArrowLeft /> Back to Assignments
        </button>

        <div className="flex items-center gap-3 overflow-hidden">
            <h2 className={`text-lg font-bold truncate hidden md:block ${isDark ? "text-white" : "text-slate-800"}`}>
              Goal : {assignment.assignment_title}
            </h2>
            <a 
                href={assignment.link} 
                target="_blank" 
                rel="noreferrer"
                title="Open in new tab (Safety Fallback)"
                className={`p-2.5 rounded-full transition-colors ${isDark ? "bg-violet-500/20 text-violet-400 hover:bg-violet-500/30" : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"}`}
            >
                <FaExternalLinkAlt />
            </a>
        </div>
      </div>

      {/* Iframe Container */}
      <div className={`
        flex-1 w-full rounded-3xl overflow-hidden border shadow-2xl relative
        ${isDark ? "bg-[#0f172a] border-white/10" : "bg-white border-slate-200"}
      `}>
        
        {/* --- LOADER (Visible until onLoad fires) --- */}
        {iframeLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-inherit">
             {/* Small Blue Circular Loader */}
             <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-3"></div>
             <span className={`font-bold text-sm animate-pulse ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Loading Mission...
             </span>
          </div>
        )}
        
        <iframe 
          src={assignment.link}
          title="Assignment Content"
          className={`w-full h-full transition-opacity duration-700 ${iframeLoading ? 'opacity-0' : 'opacity-100'}`}
          frameBorder="0"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-modals allow-presentation"
          loading="lazy"
          onLoad={() => setIframeLoading(false)} // Hide loader when content is ready
        />
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const StudentAssignments = () => {
  const context = useOutletContext();
  const isDark = context?.isDark ?? true;
  
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const res = await fetchMyAssignments();
      if (res.success && Array.isArray(res.data)) {
        setAssignments(res.data);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* 1. Background Layer (z-index: 0) */}
      <SpaceBackground isDark={isDark} />

      {/* 2. Content Layer (z-index: 10) */}
      <div className="relative z-10 w-full h-full">
        <AnimatePresence mode="wait">
          
          {/* VIEW 1: VIEWER MODE */}
          {selectedAssignment ? (
            <motion.div 
              key="viewer"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full w-full"
            >
              <AssignmentViewer 
                assignment={selectedAssignment} 
                isDark={isDark} 
                onBack={() => setSelectedAssignment(null)} 
              />
            </motion.div>
          ) : (
            
            /* VIEW 2: LIST MODE */
            <motion.div 
              key="list"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full mx-auto"
            >
              {/* Header Area */}
              <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                <div>
                  <h1 className={`text-3xl font-extrabold flex items-center gap-3 ${isDark ? "text-white" : "text-slate-900"}`}>
                      <FaRocket className="text-yellow-400" /> Your Missions
                  </h1>
                  <p className={`mt-1 text-sm font-medium ${isDark ? "text-gray-300" : "text-slate-500"}`}>
                    Complete your tasks to level up!
                  </p>
                </div>
              </div>

              {/* Content Area */}
              {loading ? (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1,2,3].map(i => (
                      <div key={i} className={`h-48 rounded-3xl animate-pulse ${isDark ? "bg-white/5" : "bg-white/40"}`} />
                    ))}
                 </div>
              ) : assignments.length === 0 ? (
                 <div className={`text-center py-20 rounded-3xl border border-dashed backdrop-blur-sm ${isDark ? "bg-white/5 border-white/10 text-gray-400" : "bg-white/40 border-gray-300 text-gray-500"}`}>
                    <p className="font-bold text-lg">No missions found yet!</p>
                    <p className="text-sm">Check back later for new assignments.</p>
                 </div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10"
                  initial="hidden"
                  animate="visible"
                  variants={{
                      visible: { transition: { staggerChildren: 0.05 } }
                  }}
                >
                  {assignments.map((assignment) => (
                    <AssignmentCard 
                      key={assignment._id} 
                      data={assignment} 
                      isDark={isDark}
                      onClick={setSelectedAssignment}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentAssignments;