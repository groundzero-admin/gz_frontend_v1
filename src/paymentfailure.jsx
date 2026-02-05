import React, { useState, useEffect, memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, XCircle, Mail, Phone, Home, ArrowRight } from "lucide-react";
import useThemeStore from "./store/useThemeStore";

// 1. HOISTED CONSTANTS (Created once, saves memory across tabs)
const THEME_STYLES = `
  .theme-light {
    --bg-main: #F8F9FA;
    --text-primary: #2B2A4C;
    --text-secondary: #555;
    --border-color: rgba(0, 0, 0, 0.08);
    --card-bg: rgba(255, 255, 255, 0.6);
    --input-bg: rgba(255, 255, 255, 0.5);
  }
  .theme-dark {
    --bg-main: #0B0C1B;
    --text-primary: #ffffff;
    --text-secondary: #B0B0B0;
    --border-color: rgba(255, 255, 255, 0.1);
    --card-bg: rgba(255, 255, 255, 0.03);
    --input-bg: rgba(0, 0, 0, 0.3);
  }
  .animate-shake { animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both; }
  @keyframes shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
    40%, 60% { transform: translate3d(4px, 0, 0); }
  }
`;

// 2. MEMOIZED DECORATION (Prevents GPU redraws)
const BackgroundDecor = memo(() => (
  <div className="fixed inset-0 pointer-events-none -z-10">
    <div className="absolute top-0 left-0 w-full h-full opacity-10"
      style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(239, 68, 68, 0.1) 0%, transparent 40%)' }} />
  </div>
));

const PaymentFailure = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useThemeStore();

  // 3. SILENT REDIRECT (Zero State Updates)
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 60000); // 60 Seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  const theme = useMemo(() => ({
    container: isDark ? "theme-dark bg-[#0B0C1B]" : "theme-light bg-[#F8F9FA]",
    nav: isDark ? "bg-[#0B0C1B]/80 border-white/5" : "bg-white/80 border-black/5",
  }), [isDark]);

  return (
    <div className={`min-h-screen transition-colors duration-700 font-sans ${theme.container}`}>
      <style>{THEME_STYLES}</style>
      <BackgroundDecor />

      {/* HEADER */}
      <nav className={`w-full backdrop-blur-md sticky top-0 z-50 border-b transition-all duration-300 ${theme.nav}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <XCircle size={24} className="text-red-500" />
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Payment Failed</h1>
              <p className="text-[10px] uppercase tracking-widest opacity-60" style={{ color: 'var(--text-secondary)' }}>Status: Incomplete</p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-white/10 shadow-lg transition-transform active:scale-90"
            style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)' }}
          >
            {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-indigo-600" />}
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto p-6 flex flex-col items-center justify-center min-h-[85vh]">
        <div className="w-full p-8 md:p-12 rounded-[2.5rem] border shadow-2xl relative overflow-hidden text-center transition-all"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>

          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-orange-500" />

          <div className="mb-8 animate-shake inline-block p-5 rounded-full bg-red-500/10">
            <XCircle size={60} className="text-red-500" />
          </div>

          <h2 className="text-3xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-red-500">
            Transaction Declined
          </h2>

          <p className="text-base md:text-lg mb-10 max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Your bank couldn't complete the process. Please check your network or try a different method.
          </p>

          {/* CONTACTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <div className="p-4 rounded-2xl border flex items-center gap-4 text-left transition-all hover:translate-y-[-2px]"
              style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
              <Mail size={18} className="text-blue-500" />
              <div>
                <p className="text-[10px] font-bold uppercase opacity-50" style={{ color: 'var(--text-secondary)' }}>Support</p>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>shivangi@groundzero.world</p>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>saranya@groundzero.world</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border flex items-center gap-4 text-left transition-all hover:translate-y-[-2px]"
              style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
              <Phone size={18} className="text-purple-500" />
              <div>
                <p className="text-[10px] font-bold uppercase opacity-50" style={{ color: 'var(--text-secondary)' }}>Call</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>+91 9618132923</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-95 bg-gradient-to-r from-[#00C4CC] to-[#8A2BE2]"
            >
              <Home size={20} /> Return to Home <ArrowRight size={20} />
            </button>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--text-secondary)' }}>
              Auto-Redirect Active
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentFailure;