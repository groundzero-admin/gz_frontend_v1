import React, { useState, useEffect, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon, Home, Zap } from 'lucide-react';

// --- Static Constants (Calculated once outside component) ---
const STAR_COORDINATES = [...Array(10)].map((_, i) => ({
  top: `${(i * 13) % 100}%`,
  left: `${(i * 17) % 100}%`,
}));

const ANIMATION_STYLES = `
  .gpu-layer { transform: translateZ(0); backface-visibility: hidden; will-change: transform; }
  
  @keyframes float-slow {
    0% { transform: translate3d(0, 0, 0) scale(1); }
    33% { transform: translate3d(30px, -50px, 0) scale(1.05); }
    66% { transform: translate3d(-20px, 20px, 0) scale(0.95); }
    100% { transform: translate3d(0, 0, 0) scale(1); }
  }
  
  .animate-float-slow { animation: float-slow 15s ease-in-out infinite; }
`;

// --- Memoized Background Components ---

const BackgroundOrbs = memo(({ isDark }) => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 gpu-layer">
    <div className={`absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] blur-[120px] rounded-full animate-float-slow transition-colors duration-700 ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-400/20'}`} />
    <div className={`absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] blur-[100px] rounded-full animate-float-slow transition-colors duration-700 ${isDark ? 'bg-blue-600/10' : 'bg-blue-400/20'}`} style={{ animationDelay: '-2s' }} />
  </div>
));

const SpaceElements = memo(({ isDark }) => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    {STAR_COORDINATES.map((pos, i) => (
      <div 
        key={i}
        className={`absolute rounded-full gpu-layer ${isDark ? 'bg-white/20' : 'bg-slate-400/20'}`}
        style={{ 
          top: pos.top, 
          left: pos.left, 
          width: '2px',
          height: '2px',
        }}
      />
    ))}
  </div>
));

const NotFoundPage = () => {
  const [isDark, setIsDark] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const navigate = useNavigate();

  // Optimized Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/spark');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  // Memoize styles to avoid object recreation on every render (timer tick)
  const styles = useMemo(() => ({
    bg: isDark ? "bg-[#0B0C15]" : "bg-slate-50",
    text: isDark ? "text-gray-100" : "text-slate-900",
    subtext: isDark ? "text-gray-400" : "text-slate-600",
    navbar: isDark ? "bg-[#13141F]/80 border-white/10" : "bg-white/80 border-slate-200",
    buttonPrimary: "bg-cyan-400 hover:bg-cyan-300 text-black font-bold shadow-lg shadow-cyan-500/20",
    buttonSecondary: isDark ? "border-white/20 hover:bg-white/10 text-white" : "border-slate-300 hover:bg-slate-100 text-slate-800"
  }), [isDark]);

  return (
    <div className={`min-h-screen font-sans selection:bg-cyan-500/50 overflow-hidden relative transition-colors duration-500 flex flex-col ${styles.bg} ${styles.text}`}>
      <style>{ANIMATION_STYLES}</style>
      
      {/* These will NOT re-render when countdown updates */}
      <BackgroundOrbs isDark={isDark} />
      <SpaceElements isDark={isDark} />

      <div className="relative z-10 flex flex-col h-screen">
        <nav className="flex items-center justify-center pt-6 px-4">
          <div className={`backdrop-blur-xl border rounded-lg px-6 py-3 flex items-center justify-between w-full max-w-5xl transition-all ${styles.navbar}`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-extrabold border ${isDark ? 'bg-slate-800 text-cyan-400 border-cyan-500/20' : 'bg-cyan-500 text-white border-transparent'}`}>
                404
              </div>
              <span className="font-bold text-lg tracking-tight">Seems you are <span className="text-cyan-400">Confused!</span></span>
            </div>
            
            <button 
              onClick={() => setIsDark(!isDark)} 
              className={`p-2 rounded-full transition-colors ${isDark ? 'bg-white/10 text-yellow-300' : 'bg-slate-200 text-slate-600'}`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </nav>

        <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="mb-8 relative">
            <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-600 opacity-20 select-none">
              404
            </h1>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4">Houston, we have a problem.</h2>
          
          <p className={`text-lg md:text-xl max-w-lg mb-8 ${styles.subtext}`}>
            The page you are looking for seems to be lost in deep space.
            <br />
            Returning to base in <span className="text-cyan-400 font-bold font-mono text-2xl mx-1">{countdown}</span> seconds...
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <button onClick={() => navigate('/')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold border transition-all ${styles.buttonSecondary}`}>
              <Home size={18} /> Home Builders OS
            </button>

            <button onClick={() => navigate('/spark')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${styles.buttonPrimary}`}>
              <Zap size={18} /> Home Spark OS
            </button>
          </div>

          {/* Optimized Progress Bar: Uses scaleX instead of width for GPU compositing */}
          <div className="mt-12 w-64 h-1 bg-white/10 rounded-full overflow-hidden">
             <motion.div 
               initial={{ scaleX: 0 }}
               animate={{ scaleX: 1 }}
               style={{ originX: 0 }}
               transition={{ duration: 10, ease: "linear" }}
               className="h-full bg-cyan-400 w-full"
             />
          </div>
          <p className={`text-xs mt-2 ${styles.subtext}`}>Auto-redirecting...</p>
        </main>
      </div>
    </div>
  );
};

export default NotFoundPage;