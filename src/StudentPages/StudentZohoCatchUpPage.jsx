import React, { useState, useMemo, useRef, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdOutlineRocketLaunch } from "react-icons/md";
import { FaGlobeAmericas, FaArrowLeft } from 'react-icons/fa';
import { Star, Loader2 } from 'lucide-react';

// --- COMPONENT: Fixed Space Background ---
const SpaceBackground = ({ isDark }) => {
  const stars = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 10 + 8,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 3 
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Nebula Clouds */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} 
        className={`absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full blur-[120px] 
          ${isDark ? "bg-indigo-900/40" : "bg-sky-200/60"}
      `}></motion.div>
      <motion.div 
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }} 
        className={`absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[120px] 
          ${isDark ? "bg-purple-900/40" : "bg-violet-200/60"}
      `}></motion.div>

      {/* Twinkling Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          initial={{ opacity: 0.3, scale: 0.8 }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
          className={`absolute ${isDark ? "text-white" : "text-slate-400"}`}
          style={{ left: `${star.left}%`, top: `${star.top}%` }}
        >
          <Star size={star.size} fill="currentColor" strokeWidth={0} />
        </motion.div>
      ))}

      {/* Floating Rocket */}
      <motion.div
        initial={{ x: -100, y: "100vh", opacity: 0 }}
        animate={{ x: "120vw", y: "-20vh", opacity: [0, 1, 1, 0] }}
        transition={{ duration: 100, repeat: Infinity, ease: "linear", delay: 1 }}
        className={`absolute top-0 left-0 ${isDark ? "text-gray-200" : "text-slate-600"}`}
        style={{ zIndex: 10 }}
      >
        <MdOutlineRocketLaunch size={60} style={{ transform: "rotate(0deg)", filter: "drop-shadow(0 0 10px rgba(255,255,255,0.3))" }} />
      </motion.div>

      {/* Floating Earth */}
      <motion.div
        initial={{ x: "110vw", y: 100, rotate: 0, opacity: 0 }}
        animate={{ x: -200, y: 300, rotate: -45, opacity: isDark ? 0.4 : 0.2 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear", delay: 0 }}
        className={`absolute top-20 left-0 ${isDark ? "text-purple-300" : "text-indigo-400"}`}
        style={{ zIndex: 5 }}
      >
        <FaGlobeAmericas size={120} />
      </motion.div>
    </div>
  );
};

// --- MAIN PAGE ---
const BookCatchUpSession = () => {
  const context = useOutletContext();
  const isDark = context?.isDark ?? true; 
  const navigate = useNavigate();

  const [iframeLoading, setIframeLoading] = useState(true);
  const widgetRef = useRef(null);

  const ZOHO_SRC = "https://groundzero2.zohobookings.in/portal-embed#/406562000000048816";

  // --- PREFETCHING LOGIC ---
  useEffect(() => {
    const preconnectLink = document.createElement("link");
    preconnectLink.rel = "preconnect";
    preconnectLink.href = "https://groundzero2.zohobookings.in";
    
    const prefetchLink = document.createElement("link");
    prefetchLink.rel = "prefetch";
    prefetchLink.href = ZOHO_SRC;

    document.head.appendChild(preconnectLink);
    document.head.appendChild(prefetchLink);

    return () => {
      document.head.removeChild(preconnectLink);
      document.head.removeChild(prefetchLink);
    };
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 50, damping: 20 }
    }
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      className="relative min-h-[85vh] max-w-5xl mx-auto"
    >
      <SpaceBackground isDark={isDark} />

      <div className="relative z-10 flex flex-col gap-6 pb-10 pt-8 px-4">
        
        {/* --- HEADER SECTION --- */}
        <motion.div variants={cardVariants} className="text-center">
          <h1 className={`text-3xl md:text-5xl font-extrabold mb-1 tracking-tight ${isDark ? "text-white" : "text-slate-800"}`}>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Spark Session</span> Catch Up
          </h1>
          <p className={`text-sm md:text-base font-medium ${isDark ? "text-gray-400" : "text-slate-500"}`}>
            Missed a class? Book a catch-up slot below.
          </p>
        </motion.div>

        {/* --- WRAPPER FOR BUTTON + WIDGET --- */}
        <div className="relative w-full">
            
            {/* Circular Back Button (Desktop: Floating Left | Mobile: Top Left of card) */}
            <motion.div 
                variants={cardVariants}
                className="md:absolute md:-left-16 md:top-0 mb-4 md:mb-0 flex justify-start z-20"
            >
                <button 
                    onClick={() => navigate(-1)}
                    className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full transition-all shadow-lg
                    ${isDark 
                        ? "bg-white/10 hover:bg-white/20 text-white border border-white/10" 
                        : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
                    }`}
                    title="Go Back"
                >
                    <FaArrowLeft size={18} />
                </button>
            </motion.div>

            {/* --- ZOHO WIDGET CARD --- */}
            <motion.div 
            ref={widgetRef}
            variants={cardVariants}
            className={`relative w-full rounded-3xl border overflow-hidden transition-all duration-300 shadow-xl
                ${isDark 
                ? "bg-[#13111C]/60 border-yellow-500/20 backdrop-blur-md" 
                : "bg-white/40 border-yellow-400/50 backdrop-blur-md"
                }
            `}
            >
            {/* Header Bar decoration */}
            <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-yellow-400" />

            <div className="p-1 h-[80vh] min-h-[600px] relative">
                
                {/* Loading Spinner */}
                {iframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-3">
                    <Loader2 className={`w-10 h-10 animate-spin ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
                    <p className={`text-xs font-bold tracking-widest uppercase ${isDark ? "text-cyan-500/50" : "text-cyan-600/50"}`}>
                    Loading Calendar...
                    </p>
                </div>
                )}

                <iframe
                src={ZOHO_SRC}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="camera; microphone"
                title="Zoho Catch Up Booking"
                onLoad={() => setIframeLoading(false)}
                className={`w-full h-full rounded-2xl transition-opacity duration-700 ${
                    iframeLoading ? "opacity-0" : "opacity-100"
                }`}
                />
            </div>
            </motion.div>
        </div>

        {/* Footer Text */}
        <motion.div variants={cardVariants} className={`text-center text-[10px] font-medium opacity-40 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
          © 2025 Ground Zero · Secure booking powered by Zoho
        </motion.div>

      </div>
    </motion.div>
  );
};

export default BookCatchUpSession;