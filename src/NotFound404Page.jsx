import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Rocket, Sun, Moon, ArrowRight, Home, Zap, Timer
} from 'lucide-react';

// --- CSS for Animations ---
const animationStyles = `
  @keyframes float-slow {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  
  @keyframes hover-space {
    0% { transform: translate(0, 0) rotate(var(--r)); }
    50% { transform: translate(20px, -20px) rotate(calc(var(--r) + 5deg)); }
    100% { transform: translate(0, 0) rotate(var(--r)); }
  }

  .animate-float-slow { animation: float-slow 15s ease-in-out infinite; }
  .animate-hover-space { animation: hover-space 30s ease-in-out infinite; }
`;

// --- Components ---

// Background Orbs (Works in both modes)
const BackgroundOrbs = ({ isDark }) => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0">
    <div className={`absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] blur-[120px] rounded-full animate-float-slow transition-colors duration-500 ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-400/20'}`} />
    <div className={`absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] blur-[100px] rounded-full animate-float-slow transition-colors duration-500 ${isDark ? 'bg-blue-600/10' : 'bg-blue-400/20'}`} style={{ animationDelay: '-2s' }} />
  </div>
);

// Space Elements (Stars & Rockets)
const SpaceElements = ({ isDark }) => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Random Stars */}
      {[...Array(15)].map((_, i) => (
        <div 
          key={i}
          className={`absolute rounded-full transition-colors duration-500 ${isDark ? 'bg-white/30' : 'bg-slate-400/30'}`}
          style={{ 
            top: `${Math.random() * 100}%`, 
            left: `${Math.random() * 100}%`, 
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            animation: `twinkle ${Math.random() * 5 + 3}s ease-in-out infinite`
          }}
        />
      ))}
      
      {/* Floating Rocket */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}
        className={`absolute top-[15%] left-[10%] animate-hover-space ${isDark ? 'text-white/5' : 'text-slate-900/5'}`} 
        style={{ '--r': '15deg' }}
      >
        {/* <Rocket size={56} className={isDark ? "text-cyan-500/10" : "text-cyan-600/10"} /> */}
      </motion.div>
    </div>
  );
};

const NotFoundPage = () => {
  // 1. Default Light Mode
  const [isDark, setIsDark] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const navigate = useNavigate();

  const toggleTheme = () => setIsDark(!isDark);

  // 2. Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // Redirect when countdown hits 0
    if (countdown === 0) {
      navigate('/spark');
    }

    return () => clearInterval(timer);
  }, [countdown, navigate]);

  // Styles Config
  const styles = {
    bg: isDark ? "bg-[#0B0C15]" : "bg-slate-50",
    text: isDark ? "text-gray-100" : "text-slate-900",
    subtext: isDark ? "text-gray-400" : "text-slate-600",
    navbar: isDark ? "bg-[#13141F]/80 border-white/10" : "bg-white/80 border-slate-200",
    card: isDark ? "bg-[#13141F]/60 border-white/5" : "bg-white border-slate-200 shadow-xl",
    buttonPrimary: "bg-cyan-400 hover:bg-cyan-300 text-black font-bold shadow-[0_0_30px_rgba(34,211,238,0.4)]",
    buttonSecondary: isDark ? "border-white/20 hover:bg-white/10 text-white" : "border-slate-300 hover:bg-slate-100 text-slate-800"
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-cyan-500/50 selection:text-white overflow-hidden relative transition-colors duration-500 flex flex-col ${styles.bg} ${styles.text}`}>
      <style>{animationStyles}</style>
      
      <BackgroundOrbs isDark={isDark} />
      <SpaceElements isDark={isDark} />

      <div className="relative z-10 flex flex-col h-screen">
        
        {/* ================= NAVBAR ================= */}
        <nav className="flex items-center justify-center pt-6 px-4">
          <div className={`backdrop-blur-xl border rounded-[5px] px-6 py-3 flex items-center justify-between w-full max-w-5xl shadow-lg transition-all duration-300 ${styles.navbar}`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-[5px] flex items-center justify-center text-xs font-extrabold border shadow-sm ${isDark ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-cyan-400 border-cyan-500/20' : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-transparent'}`}>
                404
              </div>
              <span className="font-bold text-lg tracking-tight">Seems you are <span className="text-cyan-400">Confused !!!</span></span>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme} 
              className={`p-2 rounded-full transition-all ${isDark ? 'bg-white/10 text-yellow-300' : 'bg-slate-200 text-slate-600'}`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>
          </div>
        </nav>

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 relative"
          >
            <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-600 opacity-20 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
               {/* <Rocket size={80} className={`animate-bounce ${isDark ? 'text-white' : 'text-slate-800'}`} /> */}
            </div>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Houston, we have a problem.
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-lg md:text-xl max-w-lg mb-8 ${styles.subtext}`}
          >
            The page you are looking for seems to be lost in deep space.
            <br />
            Returning to base in <span className="text-cyan-400 font-bold font-mono text-2xl mx-1">{countdown}</span> seconds...
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
          >
            {/* Button 1: Go to Builders */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold border transition-all ${styles.buttonSecondary}`}
            >
              <Home size={18} />
              Home Builders OS
            </motion.button>

            {/* Button 2: Go to Spark OS */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/spark')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-transform ${styles.buttonPrimary}`}
            >
              <Zap size={18} />
              Home Spark OS
            </motion.button>
          </motion.div>

          {/* Loader Indicator */}
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 10, ease: "linear" }}
            className="h-1 bg-cyan-400 rounded-full mt-12 w-64 opacity-50"
          />
          <p className={`text-xs mt-2 ${styles.subtext}`}>Auto-redirecting...</p>

        </main>

      </div>
    </div>
  );
};

export default NotFoundPage;