import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Moon, Sun, CreditCard, User, Sparkles, 
  Wifi, MapPin, AlertTriangle, CheckCircle, Loader2 
} from "lucide-react";

// Import the API function (or define it above if in the same file)
// import { createCheckoutSession } from './api'; 

// --- Paste the API function here if keeping in one file ---
const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const createCheckoutPath = `${BASE_URL}/create-checkout-session`;

export const createCheckoutSession = async (parentDetails, studentDetails, batchType, purchaseType) => {
  try {
    const response = await fetch(createCheckoutPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...parentDetails, ...studentDetails, batchType, purchaseType }),
    });
    const data = await response.json();
    if (!response.ok || !data.success || !data.order) {
      return { success: false, message: data.message || "Failed to generate order." };
    }
    return { success: true, ...data };
  } catch (error) {
    console.error("Payment API Error:", error);
    return { success: false, message: "Network connection failed." };
  }
};
// ---------------------------------------------------------

const BuyCourse = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  
  const rawCourseType = params.get("coursetype");
  const normalizedType = rawCourseType?.toUpperCase();
  const isValidType = normalizedType === "ONLINE" || normalizedType === "OFFLINE";
  const BATCH_TYPE = normalizedType === "OFFLINE" ? "OFFLINE" : "ONLINE";

  // --- State ---
  const [isDarkMode, setIsDarkMode] = useState(true); 
  const [purchaseType, setPurchaseType] = useState("FULL_BUNDLE"); 
  const [redirecting, setRedirecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // NEW: Loading state

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

  // Redirect logic
  useEffect(() => {
    if (!isValidType) {
      setRedirecting(true);
      const timer = setTimeout(() => navigate("/spark"), 3000);
      return () => clearTimeout(timer);
    }
  }, [isValidType, navigate]);

  // Pricing
  const pricePerSession = BATCH_TYPE === "OFFLINE" ? 1500 : 1000;
  const totalPrice = purchaseType === "FULL_BUNDLE" ? pricePerSession * 12 : pricePerSession;

  // --- Payment Handler ---
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (isProcessing) return; // Prevent double clicks
    setIsProcessing(true);    // Start loading animation

    // 1. Call the separated API function
    const result = await createCheckoutSession(
      parentDetails, 
      studentDetails, 
      BATCH_TYPE, 
      purchaseType
    );

    if (!result.success) {
      alert(result.message);
      setIsProcessing(false); // Stop loading on error
      return;
    }

    // 2. Initialize Razorpay
    const options = {
      key: result.key,
      amount: result.order.amount,
      currency: "INR",
      name: "GroundZero",
      description: `Course Enrollment - ${BATCH_TYPE}`,
      order_id: result.order.id,
      handler: function (response) {
        // success logic
        window.location.href = "/payment-success";
      },
      prefill: {
        name: parentDetails.parentName,
        email: parentDetails.parentEmail,
        contact: parentDetails.parentPhone,
      },
      theme: { color: "#6366f1" },
      // Handle modal close by user
      modal: {
        ondismiss: function() {
          setIsProcessing(false); // Stop loading if user closes modal
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
    
    // Note: We keep isProcessing(true) until the modal opens. 
    // The ondismiss handler above handles reset if they cancel.
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // --- Render: Invalid URL Error ---
  if (redirecting || !isValidType) {
    return (
      <div className={`app-container ${isDarkMode ? "theme-dark" : "theme-light"} min-h-screen flex items-center justify-center p-6`}>
         <div className="max-w-md w-full p-8 rounded-3xl border backdrop-blur-xl shadow-2xl text-center space-y-6"
               style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Invalid Course Type</h2>
            <div className="p-3 rounded-lg bg-black/5 text-sm font-mono opacity-60">Redirecting...</div>
         </div>
      </div>
    );
  }

  // --- Render: Main UI ---
  return (
    <div className={`app-container ${isDarkMode ? "theme-dark" : "theme-light"} min-h-screen transition-colors duration-500`}>
      
      {/* Navbar */}
      <nav className="w-full backdrop-blur-md sticky top-0 z-50 border-b transition-colors duration-300" 
           style={{ backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-tr from-purple-500 to-teal-400 text-white"><Sparkles size={24} /></div>
            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>GroundZero</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold tracking-wider
              ${BATCH_TYPE === 'ONLINE' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'}`}>
              {BATCH_TYPE === 'ONLINE' ? <Wifi size={14} /> : <MapPin size={14} />} {BATCH_TYPE} BATCH
            </div>
            <button onClick={toggleTheme} className="p-2 rounded-full shadow-lg" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)' }}>
              {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-indigo-600" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        <header className="mb-12 text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-purple-500 to-teal-400 animate-gradient-x">Secure Your Spot</h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Booking for <span className="font-bold mx-1" style={{ color: 'var(--accent-color)' }}>{BATCH_TYPE}</span> experience.
          </p>
        </header>

        <form onSubmit={handlePaymentSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Form */}
            <div className="lg:col-span-4 p-8 rounded-3xl backdrop-blur-xl border shadow-xl transition-all duration-300"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2 mb-6">
                <User className="text-purple-500" />
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Details</h3>
              </div>
              <div className="space-y-5">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-70" style={{ color: 'var(--text-secondary)' }}>Parent</label>
                  <input required type="text" placeholder="Parent Name" className="custom-input" value={parentDetails.parentName} onChange={(e) => setParentDetails({ ...parentDetails, parentName: e.target.value })} />
                  <input required type="text" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} placeholder="Phone (10 digits)" className="custom-input" value={parentDetails.parentPhone} onChange={(e) => setParentDetails({ ...parentDetails, parentPhone: e.target.value.replace(/\D/g, '') })} />
                  <input required type="email" placeholder="Parent Email" className="custom-input" value={parentDetails.parentEmail} onChange={(e) => setParentDetails({ ...parentDetails, parentEmail: e.target.value })} />
                </div>
                <div className="space-y-3 mt-6">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-70" style={{ color: 'var(--text-secondary)' }}>Student</label>
                  <input required type="text" placeholder="Student Name" className="custom-input" value={studentDetails.studentName} onChange={(e) => setStudentDetails({ ...studentDetails, studentName: e.target.value })} />
                  <input required type="email" placeholder="Student Email" className="custom-input" value={studentDetails.studentEmail} onChange={(e) => setStudentDetails({ ...studentDetails, studentEmail: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <input required type="text" placeholder="Board" className="custom-input" value={studentDetails.board} onChange={(e) => setStudentDetails({ ...studentDetails, board: e.target.value })} />
                    <input required type="text" inputMode="numeric" placeholder="Grade" className="custom-input" value={studentDetails.classGrade} onChange={(e) => setStudentDetails({ ...studentDetails, classGrade: e.target.value.replace(/\D/g, '') })} />
                  </div>
                  <input required type="text" placeholder="School Name" className="custom-input" value={studentDetails.schoolName} onChange={(e) => setStudentDetails({ ...studentDetails, schoolName: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Middle: Selection */}
            <div className="lg:col-span-5 space-y-6">
              {/* Bundle Option */}
              <div onClick={() => setPurchaseType("FULL_BUNDLE")} className={`relative p-1 rounded-3xl cursor-pointer hover:scale-[1.02] transition-transform ${purchaseType === "FULL_BUNDLE" ? "border-gradient shadow-2xl shadow-purple-500/20" : ""}`} style={{ backgroundColor: purchaseType === "FULL_BUNDLE" ? "transparent" : "var(--card-bg)" }}>
                <div className="p-6 rounded-[20px] h-full" style={{ backgroundColor: 'var(--card-inner-bg)' }}>
                  <div className="flex justify-between">
                    <div><h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Mastery Bundle</h3><p className="text-sm opacity-70" style={{ color: 'var(--text-secondary)' }}>12 Sessions</p></div>
                    {purchaseType === "FULL_BUNDLE" && <CheckCircle className="text-teal-400" />}
                  </div>
                  <div className="my-4"><span className="text-4xl font-bold" style={{ color: 'var(--accent-color)' }}>₹{pricePerSession * 12}</span></div>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex gap-2 items-center"><Sparkles size={14} className="text-yellow-500"/> Guaranteed slot reservation</li>
                  </ul>
                </div>
              </div>
              {/* Single Option */}
              <div onClick={() => setPurchaseType("SINGLE_SESSION")} className={`relative p-1 rounded-3xl cursor-pointer hover:scale-[1.02] transition-transform ${purchaseType === "SINGLE_SESSION" ? "border-gradient shadow-2xl shadow-purple-500/20" : ""}`} style={{ backgroundColor: purchaseType === "SINGLE_SESSION" ? "transparent" : "var(--card-bg)" }}>
                <div className="p-6 rounded-[20px] h-full" style={{ backgroundColor: 'var(--card-inner-bg)' }}>
                  <div className="flex justify-between">
                    <div><h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Pay As You Go</h3><p className="text-sm opacity-70" style={{ color: 'var(--text-secondary)' }}>Single Session</p></div>
                    {purchaseType === "SINGLE_SESSION" && <CheckCircle className="text-teal-400" />}
                  </div>
                  <div className="my-4"><span className="text-4xl font-bold" style={{ color: 'var(--accent-color)' }}>₹{pricePerSession}</span></div>
                </div>
              </div>
            </div>

            {/* Right: Summary & Action */}
            <div className="lg:col-span-3">
              <div className="sticky top-24 p-8 rounded-3xl border backdrop-blur-xl shadow-xl" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><CreditCard size={20}/> Summary</h3>
                  <div className="space-y-4 text-sm pb-6 border-b" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                    <div className="flex justify-between"><span>Mode</span><span className="font-bold">{BATCH_TYPE}</span></div>
                    <div className="flex justify-between"><span>Plan</span><span className="font-bold">{purchaseType === 'FULL_BUNDLE' ? 'Full Bundle' : 'Single Session'}</span></div>
                  </div>
                  <div className="pt-6">
                    <div className="flex justify-between items-end mb-6">
                      <span className="text-sm opacity-70" style={{ color: 'var(--text-secondary)' }}>Total</span>
                      <span className="text-3xl font-bold" style={{ color: 'var(--accent-color)' }}>₹{totalPrice}</span>
                    </div>

                    {/* BUTTON WITH LOADING STATE */}
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2
                        ${isProcessing ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl hover:-translate-y-1'}`}
                      style={{ 
                        background: 'linear-gradient(90deg, var(--accent-teal), var(--accent-purple))',
                        color: '#fff' 
                      }}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          <span>Processing...</span>
                        </>
                      ) : (
                        "Proceed to Pay"
                      )}
                    </button>
                    
                    <p className="text-center text-xs mt-4 opacity-50" style={{ color: 'var(--text-secondary)' }}>Secure payment by Razorpay</p>
                  </div>
              </div>
            </div>

          </div>
        </form>
      </main>

      {/* Global CSS */}
      <style>{`
        .theme-light { --bg-main: #F8F9FA; --bg-glass: rgba(255, 255, 255, 0.85); --text-primary: #2B2A4C; --text-secondary: #555; --border-color: rgba(0, 0, 0, 0.08); --card-bg: rgba(255, 255, 255, 0.6); --card-inner-bg: rgba(255, 255, 255, 0.9); --input-bg: rgba(255, 255, 255, 0.8); --accent-purple: #8A2BE2; --accent-teal: #00C4CC; --accent-color: #2B2A4C; }
        .theme-dark { --bg-main: #0B0C1B; --bg-glass: rgba(11, 12, 27, 0.85); --text-primary: #ffffff; --text-secondary: #B0B0B0; --border-color: rgba(255, 255, 255, 0.1); --card-bg: rgba(255, 255, 255, 0.03); --card-inner-bg: #15162e; --input-bg: rgba(0, 0, 0, 0.3); --accent-purple: #8A2BE2; --accent-teal: #00C4CC; --accent-color: #ffffff; }
        .app-container { background-color: var(--bg-main); background-image: radial-gradient(circle at 10% 20%, rgba(138, 43, 226, 0.05) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(0, 196, 204, 0.05) 0%, transparent 20%); font-family: 'Inter', sans-serif; }
        .border-gradient { position: relative; background-image: linear-gradient(var(--card-inner-bg), var(--card-inner-bg)), linear-gradient(90deg, var(--accent-teal), var(--accent-purple), var(--accent-teal)); background-origin: border-box; background-clip: content-box, border-box; animation: borderFlow 3s linear infinite; }
        @keyframes borderFlow { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        .animate-gradient-x { background-size: 200% auto; animation: textShine 3s linear infinite; }
        @keyframes textShine { to { background-position: 200% center; } }
        .custom-input { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-color); background-color: var(--input-bg); color: var(--text-primary); transition: all 0.2s ease; outline: none; }
        .custom-input:focus { border-color: var(--accent-teal); box-shadow: 0 0 0 2px rgba(0, 196, 204, 0.2); }
        .custom-input:invalid:not(:placeholder-shown) { border-color: #ef4444; }
      `}</style>
    </div>
  );
};

export default BuyCourse;