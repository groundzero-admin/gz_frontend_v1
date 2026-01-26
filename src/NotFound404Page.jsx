import React, { useState, useEffect, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon, Home, Zap } from 'lucide-react';

// 1. Static CSS outside component
const ANIMATION_STYLES = `
  .gpu-accelerated { transform: translateZ(0); backface-visibility: hidden; }
  @keyframes float-slow {
    0%, 100% { transform: translate3d(0, 0, 0); }
    50% { transform: translate3d(20px, -30px, 0); }
  }
  .animate-float { animation: float-slow 18s ease-in-out infinite; }
`;

// 2. Memoized Background (Prevents lag across tabs)
const VisualBackground = memo(({ isDark }) => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 gpu-accelerated">
    <div className={`absolute top-[-5%] left-[-5%] w-[45vw] h-[45vw] blur-[80px] rounded-full animate-float transition-colors duration-1000 ${isDark ? 'bg-cyan-900/20' : 'bg-cyan-200/40'}`} />
    <div className={`absolute bottom-[-5%] right-[-5%] w-[40vw] h-[40vw] blur-[80px] rounded-full animate-float transition-colors duration-1000 ${isDark ? 'bg-blue-900/20' : 'bg-blue-200/40'}`} style={{ animationDelay: '-3s' }} />
    
    {[...Array(8)].map((_, i) => (
      <div 
        key={i}
        className={`absolute rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-400/30'}`}
        style={{ 
          top: `${(i * 17) % 100}%`, 
          left: `${(i * 23) % 100}%`, 
          width: '2px', height: '2px' 
        }}
      />
    ))}
  </div>
));

const NotFoundPage = () => {
  const [isDark, setIsDark] = useState(false); 
  const navigate = useNavigate();

  // --- INTERNAL TIMER LOGIC ---
  // Navigates to /spark after 5 seconds without updating any state
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/spark');
    }, 5000);

    return () => clearTimeout(timer); // Cleanup if component unmounts
  }, [navigate]);

  const theme = useMemo(() => ({
    container: isDark ? "bg-[#0B0C15] text-gray-100" : "bg-slate-50 text-slate-900",
    navbar: isDark ? "bg-[#13141F]/60 border-white/5" : "bg-white/70 border-slate-200",
    subtext: isDark ? "text-gray-400" : "text-slate-500",
    secondaryBtn: isDark ? "border-white/10 hover:bg-white/5 text-white" : "border-slate-300 hover:bg-slate-100 text-slate-800"
  }), [isDark]);

  return (
    <div className={`min-h-screen w-full font-sans selection:bg-cyan-500/30 overflow-hidden relative flex flex-col transition-colors duration-700 ${theme.container}`}>
      <style>{ANIMATION_STYLES}</style>
      
      <VisualBackground isDark={isDark} />

      <div className="relative z-10 flex flex-col h-screen">
        <nav className="flex items-center justify-center pt-8 px-6">
          <div className={`backdrop-blur-md border rounded-2xl px-6 py-3 flex items-center justify-between w-full max-w-4xl transition-all ${theme.navbar}`}>
            <div className="flex items-center gap-3">
              <div className="px-2 py-0.5 rounded bg-cyan-500 text-black text-xs font-black">404</div>
              <span className="font-bold tracking-tight">System <span className="text-cyan-400">Error</span></span>
            </div>
            
            <button 
              onClick={() => setIsDark(!isDark)} 
              className={`p-2 rounded-xl transition-all active:scale-95 ${isDark ? 'bg-white/5 text-yellow-300' : 'bg-slate-200 text-slate-600'}`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </nav>

        <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-8xl md:text-9xl font-black mb-2 tracking-tighter opacity-10 select-none">LOST</h1>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Houston, we have a problem.</h2>
            <p className={`text-lg max-w-md mb-10 mx-auto ${theme.subtext}`}>
              The page you are looking for has drifted out of orbit. Select your destination to return.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
              <button 
                onClick={() => navigate('/')} 
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold border transition-all active:scale-95 ${theme.secondaryBtn}`}
              >
                <Home size={18} /> Home Builders OS
              </button>

              <button 
                onClick={() => navigate('/spark')} 
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
              >
                <Zap size={18} /> Home Spark OS
              </button>
            </div>
          </motion.div>
        </main>

        <footer className={`pb-8 text-center text-xs font-medium tracking-widest uppercase opacity-40 ${theme.subtext}`}>
          Deep Space Protocol // 404
        </footer>
      </div>
    </div>
  );
};

export default NotFoundPage;