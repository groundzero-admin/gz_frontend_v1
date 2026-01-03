import React, { useState } from "react";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Sun,
  Moon,
  Users,
  Info,
  ChevronLeft
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FormSquad_BuilderOS = () => {
  // Default to Light Mode
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  // --- CONFIGURATION ---
  const ZOHO_SRC = "https://groundzero1.zohobookings.in/portal-embed#/406542000000040340";

  const toggleTheme = () => setIsDark(!isDark);

  // --- ANIMATION VARIANTS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  // --- SHARED STYLES ---
  const styles = {
    sectionHeader: `text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-2 ${isDark ? "text-white" : "text-slate-900"}`,
    bodyText: `text-sm font-medium leading-snug ${isDark ? "text-gray-300" : "text-slate-600"}`,
    iconColor: isDark ? "text-blue-400" : "text-blue-600", // Blue theme for Squads
    cardBase: `rounded-2xl border shadow-xl transition-all p-5 flex flex-col justify-center gap-2
      ${isDark ? "bg-[#13141F]/80 border-white/10" : "bg-white border-slate-200 shadow-slate-200/60"}`
  };

  return (
    <div
      className={`h-screen w-full font-sans transition-colors duration-500 relative overflow-hidden flex flex-col
        ${isDark ? "bg-[#0B0C15] text-gray-100" : "bg-slate-50 text-slate-900"}
      `}
    >
      {/* --- Ambient Background Glows --- */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] blur-[120px] rounded-full opacity-30 ${isDark ? "bg-blue-600" : "bg-blue-200"}`} />
        <div className={`absolute bottom-0 right-1/4 w-[400px] h-[400px] blur-[100px] rounded-full opacity-20 ${isDark ? "bg-cyan-600" : "bg-cyan-200"}`} />
      </div>

      {/* --- MAIN ANIMATED CONTAINER --- */}
      <motion.div 
        className="relative z-10 max-w-5xl w-full mx-auto px-4 md:px-6 pt-4 pb-2 flex flex-col h-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* --- 1. Header (Navigation) --- */}
        <motion.div variants={itemVariants} className="flex items-center justify-between shrink-0 mb-2">
          
          {/* Left: Back to Home with Arrow */}
          <button
            onClick={() => navigate('/')} 
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border group
              ${isDark 
                ? "border-white/10 hover:bg-white/5 text-gray-400 hover:text-white" 
                : "bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 shadow-sm"
              }`}
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </button>

          {/* Right: Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-all duration-300 border
              ${isDark
                ? "bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10"
                : "bg-white border-slate-200 text-slate-600 hover:text-indigo-600 shadow-sm"
              }`}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </motion.div>

        {/* --- 2. Hero Text --- */}
        <motion.div variants={itemVariants} className="text-center mb-4 shrink-0 space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Form a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600">Squad</span>
          </h1>
          <p className={`text-xs md:text-sm font-medium w-full mx-auto leading-relaxed ${isDark ? "text-gray-400" : "text-slate-600"}`}>
            Bring your people together and begin your journey as a team.
          </p>
        </motion.div>

        {/* --- 3. Separate Info & Price Cards --- */}
        <motion.div variants={itemVariants} className="shrink-0 mb-4 flex flex-col md:flex-row gap-4">
            
            {/* Card 1: What This Squad Session Will Do */}
            <div className={`flex-1 ${styles.cardBase}`}>
                <div className={styles.sectionHeader}>
                    <Users size={16} className={styles.iconColor} />
                    <span className="text-base">What This Squad Session Will Do</span>
                </div>
                
                <div className="flex flex-col gap-1.5"> 
                    {[
                        "Help your group come together with clarity and shared purpose",
                        "Guide you on forming a proper squad (Min 2 members to register)",
                        "Align the squad on how you want to move through the program together"
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 px-1">
                            <div className={`mt-1 p-0.5 rounded-full shrink-0 ${isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"}`}>
                                <Check size={10} strokeWidth={3} />
                            </div>
                            <span className={styles.bodyText}>
                                {item}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Card 2: Fee & Disclaimer */}
            <div className={`md:w-[40%] relative overflow-hidden ${styles.cardBase}`}>
                <CreditCard className={`absolute -right-6 -bottom-6 w-24 h-24 opacity-3 pointer-events-none ${isDark ? "text-white" : "text-slate-900"}`} />

                <div className={`${styles.sectionHeader} relative z-10`}>
                      <CreditCard size={16} className={styles.iconColor} />
                      <span className="text-base">Session Fee: ₹200</span>
                </div>
                
                <div className="flex gap-3 items-start relative z-10 px-1">
                    <Info size={16} className={`mt-0.5 shrink-0 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                    <p className={styles.bodyText}>
                        This small fee ensures sincerity and attendance. It's <strong className={isDark ? "text-green-400" : "text-green-600"}>fully adjusted</strong> if you continue, or <strong className={isDark ? "text-green-400" : "text-green-600"}>refundable</strong> on request.
                    </p>
                </div>
            </div>

        </motion.div>

        {/* --- 4. Main Content: Zoho Calendar with Side Arrow --- */}
        {/* CHANGED: items-start to allow top positioning */}
        <motion.div variants={itemVariants} className="flex-1 relative flex items-start">
            
          {/* CAROUSEL-STYLE BACK BUTTON */}
          {/* CHANGED: Added 'top-6' to move it up */}
          <button
            onClick={() => navigate(-1)}
            className={`absolute -left-3 md:-left-5 top-6 z-20 p-2 rounded-full border shadow-lg transition-all duration-300 group
              ${isDark 
                ? "bg-[#13141F] border-white/10 text-gray-400 hover:text-white hover:border-blue-500/50" 
                : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-blue-500/50"
              }`}
            aria-label="Go back"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* Widget Container */}
          <div className={`w-full h-full relative rounded-xl border overflow-hidden shadow-xl transition-all duration-500
              ${isDark 
                ? "bg-[#13141F] border-white/10 shadow-black/20" 
                : "bg-white border-slate-200 shadow-slate-200"
              }
            `}
          >
            <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 shrink-0 absolute top-0 left-0 right-0 z-20" />
            
            <iframe
              src={ZOHO_SRC}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="camera; microphone"
              title="Zoho Squad Session"
              className="w-full h-full relative z-10"
              style={{ backgroundColor: 'transparent' }} 
            />
          </div>
        </motion.div>

        {/* --- Footer --- */}
        <motion.div variants={itemVariants} className={`mt-2 text-center text-[10px] font-medium opacity-40 shrink-0 ${isDark ? "text-gray-500" : "text-slate-400"}`}>
          © 2025 Ground Zero · Secure booking powered by Zoho
        </motion.div>

      </motion.div>
    </div>
  );
};

export default FormSquad_BuilderOS;