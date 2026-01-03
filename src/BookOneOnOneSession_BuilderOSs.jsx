import React, { useState } from "react";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Sun,
  Moon,
  Zap,
  ChevronLeft
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

const BookOneOnOneSession_BuilderOSs = () => {
  // Default to Light Mode
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  // --- CONFIGURATION ---
  const ZOHO_SRC = "https://groundzero2.zohobookings.in/portal-embed#/406562000000048026";

  const toggleTheme = () => setIsDark(!isDark);

  // --- SHARED STYLES FOR CONSISTENCY ---
  const styles = {
    // Header Style
    sectionHeader: `text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-2 ${isDark ? "text-white" : "text-slate-900"}`,
    
    // Body Text style
    bodyText: `text-sm font-medium leading-snug ${isDark ? "text-gray-300" : "text-slate-600"}`,
    
    // Card Background Style
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
        <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] blur-[120px] rounded-full opacity-30 ${isDark ? "bg-indigo-600" : "bg-indigo-200"}`} />
        <div className={`absolute bottom-0 right-1/4 w-[400px] h-[400px] blur-[100px] rounded-full opacity-20 ${isDark ? "bg-blue-600" : "bg-blue-200"}`} />
      </div>

      <div className="relative z-10 max-w-5xl w-full mx-auto px-4 md:px-6 pt-4 pb-2 flex flex-col h-full">

        {/* --- 1. Header (Navigation) --- */}
        <div className="flex items-center justify-between shrink-0 mb-2">
          
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
                ? "bg-white/5 border-white/10 text-white-400 hover:bg-white/10"
                : "bg-white border-slate-200 text-slate-600 hover:text-indigo-600 shadow-sm"
              }`}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>

        {/* --- 2. Hero Text --- */}
        <div className="text-center mb-4 shrink-0 space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Book Your <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-blue-600 to-violet-600">
              Session
            </span>
          </h1>
          <p className={`text-xs md:text-sm font-medium w-full mx-auto leading-relaxed ${isDark ? "text-gray-400" : "text-slate-600"}`}>
            Rapid, specific acceleration and private guidance to unblock specific hurdles.
          </p>
        </div>

        {/* --- 3. Separate Info & Price Cards (Symmetrical Layout) --- */}
        <div className="shrink-0 mb-4 flex flex-col md:flex-row gap-4 items-stretch">
            
            {/* Card 1: What's Included */}
            <div className={`flex-1 ${styles.cardBase}`}>
                <div className={styles.sectionHeader}>
                    <Zap size={16} className={isDark ? "text-indigo-400" : "text-indigo-600"} />
                    <span className="text-base">What's included</span>
                </div>
                
                <div className="flex flex-col gap-1.5"> 
                    {[
                        "1:1 Live Sessions",
                        "Unblocking specific hurdles",
                        "Fully self-paced",
                        "Lock in sessions as you need them"
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

            {/* Card 2: Fee & Benefits (Symmetrical Structure) */}
            <div className={`md:w-[45%] relative overflow-hidden ${styles.cardBase}`}>
                <CreditCard className={`absolute -right-6 -bottom-6 w-24 h-24 opacity-3 pointer-events-none ${isDark ? "text-white" : "text-slate-900"}`} />

                <div className={`${styles.sectionHeader} relative z-10`}>
                      <CreditCard size={16} className={isDark ? "text-indigo-400" : "text-indigo-600"} />
                      <span className="text-base">Session Fee: ₹3,000</span>
                </div>
                
                <div className="flex flex-col gap-1.5 relative z-10"> 
                    {[
                        "Pay per session model",
                        "Book only what you need",
                        "Total flexibility, no lock-ins"
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

        </div>

        {/* --- 4. Main Content: Zoho Calendar with Side Arrow --- */}
        <div className="flex-1 relative flex items-start"> {/* Changed items-center to items-start for top alignment control */}
            
          {/* CAROUSEL-STYLE BACK BUTTON - MOVED UP */}
          {/* Added 'top-10' class to position it near the top of the widget */}
          <button
            onClick={() => navigate(-1)}
            className={`absolute -left-3 md:-left-5 top-6 z-20 p-2 rounded-full border shadow-lg transition-all duration-300 group
              ${isDark 
                ? "bg-[#13141F] border-white/10 text-gray-400 hover:text-white hover:border-indigo-500/50" 
                : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-indigo-500/50"
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
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-violet-500 shrink-0 absolute top-0 left-0 right-0 z-20" />
            
            <iframe
              src={ZOHO_SRC}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="camera; microphone"
              title="Zoho 1:1 Session"
              className="w-full h-full relative z-10"
              style={{ backgroundColor: 'transparent' }} 
            />
          </div>
        </div>

        {/* --- Footer --- */}
        <div className={`mt-2 text-center text-[10px] font-medium opacity-40 shrink-0 ${isDark ? "text-gray-500" : "text-slate-400"}`}>
          © 2025 Ground Zero · Secure booking
        </div>

      </div>
    </div>
  );
};

export default BookOneOnOneSession_BuilderOSs;