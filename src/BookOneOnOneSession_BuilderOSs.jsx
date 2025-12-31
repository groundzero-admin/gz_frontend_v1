import React, { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Sun,
  Moon,
  Zap,
  ShieldCheck,
  Clock
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

const BookOneOnOneSession_BuilderOSs = () => {
  const [isDark, setIsDark] = useState(true);
  const navigate = useNavigate();

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 relative overflow-hidden
        ${isDark ? "bg-[#0B0C15] text-gray-100" : "bg-slate-50 text-slate-900"}
      `}
    >
      {/* --- Ambient Background Glows (Updated to Blue/Indigo) --- */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] blur-[120px] rounded-full opacity-30 ${isDark ? "bg-indigo-600" : "bg-indigo-300"}`} />
        <div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] blur-[100px] rounded-full opacity-20 ${isDark ? "bg-blue-600" : "bg-blue-300"}`} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-4">

        {/* --- Header --- */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border
              ${isDark 
                ? "border-white/10 hover:bg-white/5 text-gray-400 hover:text-white" 
                : "border-slate-200 hover:bg-white text-slate-600 hover:text-slate-900 hover:shadow-sm"
              }`}
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </button>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-all duration-300 border
              ${isDark
                ? "bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10"
                : "bg-white border-slate-200 text-slate-600 hover:text-indigo-600 shadow-sm"
              }`}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* --- Hero Text (Updated Gradient) --- */}
        <div className="text-center mb-6 space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Book Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-violet-600">First Session</span>
          </h1>
          <p className={`text-sm md:text-base max-w-2xl mx-auto leading-relaxed ${isDark ? "text-gray-400" : "text-slate-600"}`}>
            For individuals who want rapid, specific acceleration.
          </p>
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: ZOHO WIDGET (Span 8) */}
          <div className="lg:col-span-8 w-full">
            <div 
              className={`w-full overflow-hidden rounded-2xl border shadow-2xl transition-all duration-500
                ${isDark 
                  ? "bg-[#13141F]/60 border-white/10 shadow-indigo-900/10 backdrop-blur-xl" 
                  : "bg-white border-slate-200 shadow-slate-200/50"
                }
              `}
            >
              {/* Widget Header Decoration (Blue/Indigo Gradient) */}
              <div className={`h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500`} />
              
              <div className="p-1 h-[600px] md:h-[750px]">
                {/* Updated Iframe Src */}
                <iframe
                  src="https://groundzero1.zohobookings.in/portal-embed#/406542000000040746"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="camera; microphone"
                  title="Zoho 1:1 Booking"
                  className="rounded-xl w-full h-full"
                  style={{ backgroundColor: 'transparent' }} 
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: INFO CARDS (Span 4) */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">

            {/* CARD 1: What's Included (Indigo Theme) */}
            <div 
              className={`p-5 md:p-6 rounded-2xl border transition-all duration-300
                ${isDark 
                  ? "bg-[#13141F]/80 border-white/10 backdrop-blur-md" 
                  : "bg-white border-slate-200 shadow-xl shadow-slate-100"
                }
              `}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
                  <Zap size={20} />
                </div>
                <h2 className="text-lg font-bold">What's included</h2>
              </div>

              <ul className="space-y-3">
                {[
                  "1:1 Live Sessions",
                  "Unblocking specific hurdles",
                  "Fully self-paced",
                  "Lock in sessions as you need them"
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 items-start group">
                    <div className={`mt-1 p-0.5 rounded-full ${isDark ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}>
                      <CheckCircle2 size={14} />
                    </div>
                    <span className={`text-xs md:text-sm font-medium leading-relaxed group-hover:opacity-100 transition-opacity ${isDark ? "text-gray-300 opacity-80" : "text-slate-600"}`}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CARD 2: Session Fee (Blue/Violet Theme) */}
            <div 
              className={`p-5 rounded-2xl border relative overflow-hidden transition-all duration-300
                ${isDark 
                  ? "bg-gradient-to-br from-slate-900 to-slate-800 border-white/10" 
                  : "bg-gradient-to-br from-slate-50 to-white border-slate-200 shadow-lg"
                }
              `}
            >
              <div className={`absolute -right-6 -top-6 w-20 h-20 rounded-full blur-xl opacity-20 ${isDark ? "bg-blue-500" : "bg-violet-400"}`} />

              <div className="flex flex-col items-center text-center relative z-10 py-2">
                <div className={`mb-3 p-3 rounded-full ${isDark ? "bg-blue-500/10 text-blue-400" : "bg-white shadow-sm text-indigo-600"}`}>
                  <CreditCard size={28} />
                </div>

                <h3 className="font-extrabold text-3xl mb-1">
                  ₹2,000 <span className={`text-sm font-medium ${isDark ? "text-gray-500" : "text-slate-400"}`}>/ session</span>
                </h3>
                
                <p className={`text-[11px] leading-relaxed mb-0 max-w-[200px] ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                  Pay per session. No commitments. Book only what you need.
                </p>
              </div>
              
              <div className={`mt-4 pt-3 border-t flex justify-center items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isDark ? "border-white/5 text-green-400" : "border-slate-200 text-green-600"}`}>
                <ShieldCheck size={12} />
                <span>Secure Booking</span>
              </div>
            </div>

            {/* CARD 3: Quick Tip */}
            <div className={`px-5 py-3 rounded-xl border flex items-center gap-3 ${isDark ? "bg-[#13141F]/40 border-white/5 text-gray-500" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                <Clock size={16} />
                <p className="text-[11px]">Duration: 1 Hour approx.</p>
            </div>

          </div>
        </div>

        {/* --- Footer --- */}
        <div className={`mt-8 text-center text-xs font-medium opacity-40 ${isDark ? "text-gray-500" : "text-slate-400"}`}>
          © 2025 Ground Zero · Secure booking powered by Zoho
        </div>

      </div>
    </div>
  );
};

export default BookOneOnOneSession_BuilderOSs;