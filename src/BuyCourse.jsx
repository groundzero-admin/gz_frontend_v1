import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Moon, Sun, CreditCard, User, School, CheckCircle, Sparkles, Wifi, MapPin, AlertTriangle } from "lucide-react";

// Replaced import.meta.env with a placeholder to prevent ES2015 compilation errors in this environment
const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL ; 

const BuyCourse = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  
  const rawCourseType = params.get("coursetype");
  const normalizedType = rawCourseType?.toUpperCase();
  const isValidType = normalizedType === "ONLINE" || normalizedType === "OFFLINE";
  
  // Default to ONLINE for safe rendering if invalid, but we will block rendering with the error state
  const BATCH_TYPE = normalizedType === "OFFLINE" ? "OFFLINE" : "ONLINE";

  // State
  const [isDarkMode, setIsDarkMode] = useState(true); 
  // Changed default to FULL_BUNDLE (High Value)
  const [purchaseType, setPurchaseType] = useState("FULL_BUNDLE"); 
  const [redirecting, setRedirecting] = useState(false);

  const [parentDetails, setParentDetails] = useState({
    parentName: "",
    parentPhone: "",
    parentEmail: "",
  });
  const [studentDetails, setStudentDetails] = useState({
    studentName: "",
    studentEmail: "",
    board: "",
    classGrade: "",
    schoolName: "",
  });

  // Redirect logic for invalid course type
  useEffect(() => {
    if (!isValidType) {
      setRedirecting(true);
      const timer = setTimeout(() => {
        navigate("/spark");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isValidType, navigate]);

  // Pricing Logic
  const pricePerSession = BATCH_TYPE === "OFFLINE" ? 1500 : 1000;
  const totalPrice = purchaseType === "FULL_BUNDLE" ? pricePerSession * 12 : pricePerSession;

  // Handlers
  const handleCreateSession = async (e) => {
    e.preventDefault(); // Prevent default HTML form submission behavior

    // HTML5 validation has already passed at this point because of the form onSubmit
    
    try {
      const response = await fetch(`${BASE_URL}/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parentDetails,
          ...studentDetails,
          batchType: BATCH_TYPE,
          purchaseType,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Error creating Stripe session.");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Payment failed.");
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // ------------------------------------------------------------------
  // ERROR VIEW FOR INVALID URL
  // ------------------------------------------------------------------
  if (redirecting || !isValidType) {
    return (
      <div className={`app-container ${isDarkMode ? "theme-dark" : "theme-light"} min-h-screen flex items-center justify-center p-6`}>
         <div className="max-w-md w-full p-8 rounded-3xl border backdrop-blur-xl shadow-2xl text-center space-y-6"
               style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Invalid Course Type</h2>
              <p className="mt-2 opacity-70" style={{ color: 'var(--text-secondary)' }}>
                We couldn't determine if you are looking for an <b>Online</b> or <b>Offline</b> course.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-black/5 text-sm font-mono opacity-60">
              Redirecting to home in 3 seconds...
            </div>
         </div>
         <style>{`
            .theme-light { --bg-main: #F8F9FA; --text-primary: #2B2A4C; --card-bg: rgba(255,255,255,0.9); }
            .theme-dark { --bg-main: #0B0C1B; --text-primary: #ffffff; --card-bg: rgba(255,255,255,0.05); }
            .app-container { background-color: var(--bg-main); font-family: 'Inter', sans-serif; transition: background-color 0.3s; }
         `}</style>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // MAIN VIEW
  // ------------------------------------------------------------------
  return (
    <div className={`app-container ${isDarkMode ? "theme-dark" : "theme-light"} min-h-screen transition-colors duration-500`}>
      
      {/* ======================= HEADER ======================= */}
      <nav className="w-full backdrop-blur-md sticky top-0 z-50 border-b transition-colors duration-300" 
           style={{ backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-tr from-purple-500 to-teal-400 text-white">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
               GroundZero
              </h1>
              <p className="text-xs font-medium tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                learn effortlessly...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Batch Type Badge */}
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold tracking-wider
              ${BATCH_TYPE === 'ONLINE' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'}`}>
              {BATCH_TYPE === 'ONLINE' ? <Wifi size={14} /> : <MapPin size={14} />}
              {BATCH_TYPE} BATCH
            </div>

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
      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        
        <header className="mb-12 text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-purple-500 to-teal-400 animate-gradient-x">
            Secure Your Spot
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Complete your registration below. You are currently booking a seat for the 
            <span className="font-bold mx-1" style={{ color: 'var(--accent-color)' }}>{BATCH_TYPE}</span> 
            learning experience.
          </p>
        </header>

        {/* Wrap everything in a form to use HTML5 validation features */}
        <form onSubmit={handleCreateSession}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT: Registration Form */}
            <div className="lg:col-span-4 p-8 rounded-3xl backdrop-blur-xl border shadow-xl transition-all duration-300"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
              
              <div className="flex items-center gap-2 mb-6">
                <User className="text-purple-500" />
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Student & Parent Details</h3>
              </div>

              <div className="space-y-5">
                {/* Parent Group */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-70" style={{ color: 'var(--text-secondary)' }}>
                    Parent Info <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    type="text"
                    placeholder="Parent Name" 
                    className="custom-input" 
                    value={parentDetails.parentName} 
                    onChange={(e) => setParentDetails({ ...parentDetails, parentName: e.target.value })} 
                  />
                 <input 
  required 
  type="text"
  inputMode="numeric"
  pattern="[0-9]{10}"
  maxLength={10}
  placeholder="Phone Number (10 digits)" 
  className="custom-input" 
  value={parentDetails.parentPhone} 
  onChange={(e) => {
    const val = e.target.value.replace(/\D/g, ''); // Only digits allowed
    setParentDetails({ ...parentDetails, parentPhone: val });
  }} 
/>

                 <input
  required
  type="email"
  placeholder="Parent Email"
  className="custom-input"
  value={parentDetails.parentEmail}
  onChange={(e) => {
    const val = e.target.value.replace(/[^a-zA-Z0-9@._-]/g, ""); // Block invalid chars
    setParentDetails({ ...parentDetails, parentEmail: val });
  }}
/>

                </div>

                {/* Student Group */}
                <div className="space-y-3 mt-6">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-70" style={{ color: 'var(--text-secondary)' }}>
                    Student Info <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    type="text"
                    placeholder="Student Name" 
                    className="custom-input" 
                    value={studentDetails.studentName} 
                    onChange={(e) => setStudentDetails({ ...studentDetails, studentName: e.target.value })} 
                  />
                <input
  required
  type="email"
  placeholder="Student Email"
  className="custom-input"
  value={studentDetails.studentEmail}
  onChange={(e) => {
    const val = e.target.value.replace(/[^a-zA-Z0-9@._-]/g, ""); 
    setStudentDetails({ ...studentDetails, studentEmail: val });
  }}
/>

                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      required 
                      type="text"
                      placeholder="Board" 
                      className="custom-input" 
                      value={studentDetails.board} 
                      onChange={(e) => setStudentDetails({ ...studentDetails, board: e.target.value })} 
                    />
                   <input 
  required 
  type="text"
  inputMode="numeric"
  placeholder="Grade/Class" 
  className="custom-input" 
  value={studentDetails.classGrade} 
  onChange={(e) => {
    const val = e.target.value.replace(/\D/g, ''); // Only digits
    setStudentDetails({ ...studentDetails, classGrade: val });
  }} 
/>

                  </div>
                  <input 
                    required 
                    type="text"
                    placeholder="School Name" 
                    className="custom-input" 
                    value={studentDetails.schoolName} 
                    onChange={(e) => setStudentDetails({ ...studentDetails, schoolName: e.target.value })} 
                  />
                </div>
              </div>
            </div>

            {/* MIDDLE: Bundle Selection */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Bundle 1 - Default Selected */}
              <div 
                onClick={() => setPurchaseType("FULL_BUNDLE")}
                className={`relative p-1 rounded-3xl transition-transform duration-300 cursor-pointer hover:scale-[1.02] ${purchaseType === "FULL_BUNDLE" ? "border-gradient shadow-2xl shadow-purple-500/20" : ""}`}
                style={{ backgroundColor: purchaseType === "FULL_BUNDLE" ? "transparent" : "var(--card-bg)" }}
              >
                <div className="p-6 rounded-[20px] h-full" style={{ backgroundColor: 'var(--card-inner-bg)' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Complete Mastery Bundle</h3>
                      <p className="text-sm opacity-70" style={{ color: 'var(--text-secondary)' }}>Best Value • 12 Sessions</p>
                    </div>
                    {purchaseType === "FULL_BUNDLE" && <CheckCircle className="text-teal-400" />}
                  </div>
                  
                  <div className="my-4">
                    <span className="text-4xl font-bold" style={{ color: 'var(--accent-color)' }}>₹{pricePerSession * 12}</span>
                  </div>

                  <ul className="space-y-2 text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex gap-2 items-center"><Sparkles size={14} className="text-yellow-500"/> Book all sessions at once</li>
                    <li className="flex gap-2 items-center"><Sparkles size={14} className="text-yellow-500"/> Guaranteed slot reservation</li>
                    <li className="flex gap-2 items-center"><Sparkles size={14} className="text-yellow-500"/> Free catch-up session included</li>
                  </ul>
                </div>
              </div>

              {/* Bundle 2 */}
              <div 
                onClick={() => setPurchaseType("SINGLE_SESSION")}
                className={`relative p-1 rounded-3xl transition-transform duration-300 cursor-pointer hover:scale-[1.02] ${purchaseType === "SINGLE_SESSION" ? "border-gradient shadow-2xl shadow-purple-500/20" : ""}`}
                style={{ backgroundColor: purchaseType === "SINGLE_SESSION" ? "transparent" : "var(--card-bg)" }}
              >
                <div className="p-6 rounded-[20px] h-full" style={{ backgroundColor: 'var(--card-inner-bg)' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Pay As You Go</h3>
                      <p className="text-sm opacity-70" style={{ color: 'var(--text-secondary)' }}>Flexible • Single Session</p>
                    </div>
                    {purchaseType === "SINGLE_SESSION" && <CheckCircle className="text-teal-400" />}
                  </div>
                  
                  <div className="my-4">
                    <span className="text-4xl font-bold" style={{ color: 'var(--accent-color)' }}>₹{pricePerSession}</span>
                    <span className="text-sm opacity-60" style={{ color: 'var(--text-secondary)' }}> / session</span>
                  </div>

                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex gap-2 items-center opacity-70">• Book one session at a time</li>
                    <li className="flex gap-2 items-center opacity-70">• Catch-up session costs extra</li>
                  </ul>
                </div>
              </div>

            </div>

            {/* RIGHT: Payment Summary */}
            <div className="lg:col-span-3">
              <div className="sticky top-24 p-8 rounded-3xl border backdrop-blur-xl shadow-xl"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                  
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <CreditCard size={20}/> Summary
                  </h3>

                  <div className="space-y-4 text-sm pb-6 border-b" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                    <div className="flex justify-between">
                      <span>Course Mode</span>
                      <span className="font-bold">{BATCH_TYPE}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Plan Type</span>
                      <span className="font-bold">{purchaseType === 'FULL_BUNDLE' ? 'Full Bundle' : 'Single Session'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price</span>
                      <span>₹{totalPrice}</span>
                    </div>
                  </div>

                  <div className="pt-6">
                    <div className="flex justify-between items-end mb-6">
                      <span className="text-sm opacity-70" style={{ color: 'var(--text-secondary)' }}>Total Pay</span>
                      <span className="text-3xl font-bold" style={{ color: 'var(--accent-color)' }}>₹{totalPrice}</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                      style={{ 
                        background: 'linear-gradient(90deg, var(--accent-teal), var(--accent-purple))',
                        color: '#fff' 
                      }}
                    >
                      Proceed to Pay
                    </button>
                    
                    <p className="text-center text-xs mt-4 opacity-50" style={{ color: 'var(--text-secondary)' }}>
                      Secure payment powered by Stripe
                    </p>
                  </div>
              </div>
            </div>

          </div>
        </form>
      </main>

      {/* ======================= STYLES ======================= */}
      <style>{`
        /* --- THEME VARIABLES --- */
        .theme-light {
          --bg-main: #F8F9FA;
          --bg-glass: rgba(255, 255, 255, 0.85);
          --text-primary: #2B2A4C;
          --text-secondary: #555;
          --border-color: rgba(0, 0, 0, 0.08);
          --card-bg: rgba(255, 255, 255, 0.6);
          --card-inner-bg: rgba(255, 255, 255, 0.9);
          --input-bg: rgba(255, 255, 255, 0.8);
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

        /* --- ANIMATED GRADIENT BORDER --- */
        .border-gradient {
          position: relative;
          background-image: 
            linear-gradient(var(--card-inner-bg), var(--card-inner-bg)),
            linear-gradient(90deg, var(--accent-teal), var(--accent-purple), var(--accent-teal));
          background-origin: border-box;
          background-clip: content-box, border-box;
          animation: borderFlow 3s linear infinite;
        }

        @keyframes borderFlow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        /* --- TEXT GRADIENT ANIMATION --- */
        .animate-gradient-x {
          background-size: 200% auto;
          animation: textShine 3s linear infinite;
        }
        @keyframes textShine {
          to { background-position: 200% center; }
        }

        /* --- CUSTOM INPUTS --- */
        .custom-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background-color: var(--input-bg);
          color: var(--text-primary);
          transition: all 0.2s ease;
          outline: none;
        }
        .custom-input:focus {
          border-color: var(--accent-teal);
          box-shadow: 0 0 0 2px rgba(0, 196, 204, 0.2);
        }
        .custom-input:invalid:not(:placeholder-shown) {
          border-color: #ef4444;
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
        }
        .custom-input::placeholder {
          color: var(--text-secondary);
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};

export default BuyCourse;