import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, CheckCircle, Mail, Phone, Sparkles, Home, ArrowRight } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [countdown, setCountdown] = useState(60);

  // Auto-redirect logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirectTimeout = setTimeout(() => {
      navigate("/");
    }, 60000); // 60 seconds

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimeout);
    };
  }, [navigate]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`app-container ${isDarkMode ? "theme-dark" : "theme-light"} min-h-screen transition-colors duration-500`}>
      
      {/* ======================= HEADER ======================= */}
      <nav className="w-full backdrop-blur-md sticky top-0 z-50 border-b transition-colors duration-300" 
           style={{ backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20 text-green-500">
              <CheckCircle size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Payment Successful
              </h1>
              <p className="text-xs font-medium tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                THANK YOU FOR YOUR ORDER
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full transition-all hover:scale-110 active:scale-95 shadow-lg"
              style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)' }}
            >
              {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-indigo-600" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ======================= MAIN CONTENT ======================= */}
      <main className="max-w-4xl mx-auto p-6 lg:p-10 min-h-[80vh] flex flex-col items-center justify-center text-center">
        
        {/* Success Card */}
        <div className="w-full p-10 rounded-3xl backdrop-blur-xl border shadow-2xl relative overflow-hidden"
             style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-teal-500"></div>
            
            <div className="mb-8 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center animate-bounce-slow">
                    <CheckCircle size={48} className="text-green-500" />
                </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-teal-500 to-green-400">
              Payment Received!
            </h2>
            
            <p className="text-lg mb-8 max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
              We have successfully received your payment. A confirmation email has been sent to your registered email address.
            </p>

            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
                <div className="p-4 rounded-2xl border flex items-center gap-4 text-left transition-transform hover:scale-105"
                     style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                    <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                        <Mail size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase opacity-60" style={{ color: 'var(--text-secondary)' }}>Email Support</p>
                        <p className="font-semibold break-all" style={{ color: 'var(--text-primary)' }}>support@future-skills.com</p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl border flex items-center gap-4 text-left transition-transform hover:scale-105"
                     style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                    <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
                        <Phone size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase opacity-60" style={{ color: 'var(--text-secondary)' }}>Call Us</p>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>+91 98765 43210</p>
                    </div>
                </div>
            </div>

            {/* Redirect Info */}
            <div className="flex flex-col items-center gap-4">
                <p className="text-sm font-mono opacity-60" style={{ color: 'var(--text-secondary)' }}>
                    Redirecting to home page in {countdown} seconds...
                </p>
                
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'linear-gradient(90deg, var(--accent-teal), var(--accent-purple))' }}
                >
                    <Home size={18} /> Go Home Now <ArrowRight size={18} />
                </button>
            </div>

        </div>

      </main>

      {/* ======================= STYLES ======================= */}
      <style>{`
        /* --- THEME VARIABLES (MATCHING BUYCOURSE) --- */
        .theme-light {
          --bg-main: #F8F9FA;
          --bg-glass: rgba(255, 255, 255, 0.85);
          --text-primary: #2B2A4C;
          --text-secondary: #555;
          --border-color: rgba(0, 0, 0, 0.08);
          --card-bg: rgba(255, 255, 255, 0.6);
          --card-inner-bg: rgba(255, 255, 255, 0.9);
          --input-bg: rgba(255, 255, 255, 0.5);
          --accent-purple: #8A2BE2;
          --accent-teal: #00C4CC;
          --accent-color: #2B2A4C;
        }

        .theme-dark {
          --bg-main: #0B0C1B;
          --bg-glass: rgba(11, 12, 27, 0.85);
          --text-primary: #ffffff;
          --text-secondary: #B0B0B0;
          --border-color: rgba(255, 255, 255, 0.1);
          --card-bg: rgba(255, 255, 255, 0.03);
          --card-inner-bg: #15162e;
          --input-bg: rgba(0, 0, 0, 0.3);
          --accent-purple: #8A2BE2;
          --accent-teal: #00C4CC;
          --accent-color: #ffffff;
        }

        /* --- BACKGROUND & BASE --- */
        .app-container {
          background-color: var(--bg-main);
          background-image: 
            radial-gradient(circle at 10% 20%, rgba(138, 43, 226, 0.05) 0%, transparent 20%),
            radial-gradient(circle at 90% 80%, rgba(0, 196, 204, 0.05) 0%, transparent 20%);
          font-family: 'Inter', sans-serif;
        }

        .animate-bounce-slow {
            animation: bounce 3s infinite;
        }

        @keyframes bounce {
            0%, 100% { transform: translateY(-5%); }
            50% { transform: translateY(5%); }
        }
      `}</style>
    </div>
  );
};

export default PaymentSuccess;