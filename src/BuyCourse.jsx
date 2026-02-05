import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  CreditCard, User, Sparkles, Wifi, MapPin,
  AlertTriangle, CheckCircle2, Loader2, ArrowLeft,
  Mail, Phone, GraduationCap, School, Layers, Sun, Moon, Rocket
} from "lucide-react";
import { motion } from "framer-motion";
import useThemeStore from "./store/useThemeStore";

// --- CONFIGURATION VARIABLES ---
const PRICE_ONLINE_SESSION = 1500;
const PRICE_OFFLINE_SESSION = 1500;
const FULL_BATCH_SESSIONS = 12;

// --- API LOGIC ---
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

const BuyCourse = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // --- TYPE VALIDATION ---
  const rawCourseType = params.get("coursetype");
  const normalizedType = rawCourseType?.toUpperCase();
  const isValidType = normalizedType === "ONLINE" || normalizedType === "OFFLINE";
  const BATCH_TYPE = normalizedType === "OFFLINE" ? "OFFLINE" : "ONLINE";

  // --- STATE ---
  const { isDark: isDarkMode, toggleTheme } = useThemeStore();
  const [purchaseType, setPurchaseType] = useState("FULL_BUNDLE");
  const [isProcessing, setIsProcessing] = useState(false);
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

  // --- PRICING CALCULATION ---
  const pricePerSession = BATCH_TYPE === "OFFLINE" ? PRICE_OFFLINE_SESSION : PRICE_ONLINE_SESSION;
  const totalPrice = purchaseType === "FULL_BUNDLE"
    ? pricePerSession * FULL_BATCH_SESSIONS
    : pricePerSession;

  // --- REDIRECT INVALID URL ---
  useEffect(() => {
    if (!isValidType) {
      setRedirecting(true);
      const timer = setTimeout(() => navigate("/"), 3000);
      return () => clearTimeout(timer);
    }
  }, [isValidType, navigate]);

  // --- PAYMENT HANDLER ---
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);

    const result = await createCheckoutSession(
      parentDetails,
      studentDetails,
      BATCH_TYPE,
      purchaseType
    );

    if (!result.success) {
      alert(result.message);
      setIsProcessing(false);
      return;
    }

    const options = {
      key: result.key,
      amount: result.order.amount,
      currency: "INR",
      name: "GroundZero",
      description: `Spark ${BATCH_TYPE} Enrollment`,
      order_id: result.order.id,
      handler: function (response) {
        window.location.href = "/payment-success";
      },
      prefill: {
        name: parentDetails.parentName,
        email: parentDetails.parentEmail,
        contact: parentDetails.parentPhone,
      },
      theme: { color: "#06b6d4" }, // Cyan-500
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  // --- DYNAMIC STYLES ---
  const theme = {
    bg: isDarkMode ? "bg-[#0B0C15]" : "bg-slate-50",
    text: isDarkMode ? "text-gray-100" : "text-slate-900",
    textMuted: isDarkMode ? "text-gray-400" : "text-slate-500",
    cardBg: isDarkMode ? "bg-[#13141F]/60 backdrop-blur-md" : "bg-white",
    cardBorder: isDarkMode ? "border-white/10" : "border-slate-200 shadow-xl shadow-slate-200/50",
    inputBg: isDarkMode ? "bg-[#13141F]" : "bg-slate-50",
    inputBorder: isDarkMode ? "border-white/10" : "border-slate-300",
    inputText: isDarkMode ? "text-gray-200" : "text-slate-900",
    inputPlaceholder: isDarkMode ? "placeholder-gray-500" : "placeholder-slate-400",
    sectionHeaderBorder: isDarkMode ? "border-white/5" : "border-slate-100",
    highlightBg: isDarkMode ? "bg-[#13141F]" : "bg-white",
    highlightShadow: isDarkMode ? "shadow-[0_0_30px_-10px_rgba(6,182,212,0.15)]" : "shadow-xl shadow-cyan-100",
  };

  const inputStyle = `w-full ${theme.inputBg} border ${theme.inputBorder} rounded-xl px-4 py-3 pl-11 text-sm ${theme.inputText} ${theme.inputPlaceholder} focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300`;
  const labelStyle = `block text-xs font-bold uppercase tracking-wider ${theme.textMuted} mb-2 ml-1`;

  // --- BACKGROUND EFFECTS SETUP ---
  // Generate stars only once
  // const stars = useMemo(() => {
  //   return Array.from({ length: 30 }).map((_, i) => ({
  //     id: i,
  //     left: `${Math.random() * 100}%`,
  //     top: `${Math.random() * 100}%`,
  //     size: Math.random() * 3 + 1 + 'px', // 1px to 4px
  //     delay: `${Math.random() * 5}s`,
  //     duration: `${Math.random() * 3 + 2}s`,
  //   }));
  // }, []);

  // const rocketVariants = {
  //   animate: {
  //     x: ["-10vw", "110vw"],
  //     y: ["110vh", "-10vh"],
  //     rotate: 0 ,
  //     transition: {
  //       duration: 35,
  //       ease: "linear",
  //       repeat: Infinity,
  //     }
  //   }
  // };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // --- ERROR STATE RENDER ---
  if (redirecting || !isValidType) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-6 transition-colors duration-500`}>
        <div className={`max-w-md w-full p-8 rounded-2xl border border-red-500/20 ${theme.cardBg} text-center space-y-4`}>
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <AlertTriangle size={32} />
          </div>
          <h2 className={`text-xl font-bold ${theme.text}`}>Invalid Course Type</h2>
          <p className={`${theme.textMuted} text-sm`}>Redirecting you to the home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans ${theme.bg} ${theme.text} selection:bg-cyan-500/30 overflow-hidden relative transition-colors duration-500`}>

      {/* --- CSS Styles for Animations --- */}
      {/* <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes drift {
          0% { transform: translate(0, 0); }
          50% { transform: translate(15px, -15px); }
          100% { transform: translate(0, 0); }
        }
        .bg-drift { animation: drift 20s linear infinite; }
      `}</style> */}

      {/* --- Background Ambience & Effects --- */}
      <div className="fixed inset-0 pointer-events-none transition-opacity duration-500 overflow-hidden">

        {/* Stars */}
        {/* <div className="absolute inset-0 bg-drift">
            {stars.map(star => (
              <div
                key={star.id}
                className={`absolute rounded-full ${isDarkMode ? 'bg-white' : 'bg-slate-400'}`}
                style={{
                  left: star.left,
                  top: star.top,
                  width: star.size,
                  height: star.size,
                  animation: `twinkle ${star.duration} ease-in-out infinite ${star.delay}`,
                  opacity: isDarkMode ? 0.8 : 0.5
                }}
              />
            ))}
        </div> */}

        {/* Rocket */}
        {/* <motion.div
          variants={rocketVariants}
          animate="animate"
          initial={{ x: "-10vw", y: "110vh", rotate: 45 }}
          className={`absolute z-0 opacity-40 ${isDarkMode ? 'text-cyan-500' : 'text-slate-400'}`}
        >
          <Rocket size={48} />
        </motion.div> */}

        {/* Glowing Orbs */}
        <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] blur-[120px] rounded-full opacity-20 mix-blend-screen ${isDarkMode ? "bg-cyan-600/30" : "bg-cyan-300/50"}`} />
        <div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] blur-[100px] rounded-full opacity-20 mix-blend-screen ${isDarkMode ? "bg-purple-600/30" : "bg-blue-300/50"}`} />
      </div>

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* --- Header --- */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 transition-colors ${theme.textMuted} hover:${theme.text}`}
          >
            <ArrowLeft size={20} /> <span className="text-sm font-medium">Back</span>
          </button>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold tracking-wider uppercase transition-colors
              ${BATCH_TYPE === 'ONLINE'
                ? (isDarkMode ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-700')
                : (isDarkMode ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700')}`}
            >
              {BATCH_TYPE === 'ONLINE' ? <Wifi size={12} /> : <MapPin size={12} />}
              {BATCH_TYPE} SPARK BATCH
            </div>

            {/* THEME TOGGLE BUTTON */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full border transition-all duration-300
                ${isDarkMode
                  ? "bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10"
                  : "bg-white border-slate-200 text-slate-600 hover:text-cyan-600 shadow-sm"
                }`}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
            Secure Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600">Spot</span>
          </h1>
          <p className={`${theme.textMuted} text-sm md:text-base max-w-lg mx-auto`}>
            Complete your enrollment for the GroundZero Spark {BATCH_TYPE.toLowerCase()} experience.
          </p>
        </motion.div>

        <form onSubmit={handlePaymentSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* --- LEFT COLUMN: DETAILS FORM --- */}
            <motion.div variants={itemVariants} className="lg:col-span-7 space-y-8">

              {/* Parent Section */}
              <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 md:p-8 transition-colors duration-300`}>
                <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${theme.sectionHeaderBorder}`}>
                  <div className={`p-2 rounded-lg ${isDarkMode ? "bg-cyan-500/10 text-cyan-400" : "bg-cyan-50 text-cyan-600"}`}><User size={20} /></div>
                  <h3 className={`text-lg font-bold ${theme.text}`}>Parent Details</h3>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className={labelStyle}>Full Name</label>
                    <div className="relative">
                      <User size={16} className={`absolute left-4 top-3.5 ${theme.textMuted}`} />
                      <input required type="text" placeholder="Enter parent's name" className={inputStyle}
                        value={parentDetails.parentName} onChange={(e) => setParentDetails({ ...parentDetails, parentName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelStyle}>Phone Number</label>
                      <div className="relative">
                        <Phone size={16} className={`absolute left-4 top-3.5 ${theme.textMuted}`} />
                        <input required type="text" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} placeholder="10-digit number" className={inputStyle}
                          value={parentDetails.parentPhone} onChange={(e) => setParentDetails({ ...parentDetails, parentPhone: e.target.value.replace(/\D/g, '') })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelStyle}>Email Address</label>
                      <div className="relative">
                        <Mail size={16} className={`absolute left-4 top-3.5 ${theme.textMuted}`} />
                        <input required type="email" placeholder="parent@example.com" className={inputStyle}
                          value={parentDetails.parentEmail} onChange={(e) => setParentDetails({ ...parentDetails, parentEmail: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Section */}
              <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 md:p-8 transition-colors duration-300`}>
                <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${theme.sectionHeaderBorder}`}>
                  <div className={`p-2 rounded-lg ${isDarkMode ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600"}`}><GraduationCap size={20} /></div>
                  <h3 className={`text-lg font-bold ${theme.text}`}>Student Details</h3>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelStyle}>Student Name</label>
                      <div className="relative">
                        <User size={16} className={`absolute left-4 top-3.5 ${theme.textMuted}`} />
                        <input required type="text" placeholder="Enter student's name" className={inputStyle}
                          value={studentDetails.studentName} onChange={(e) => setStudentDetails({ ...studentDetails, studentName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelStyle}>Student Email</label>
                      <div className="relative">
                        <Mail size={16} className={`absolute left-4 top-3.5 ${theme.textMuted}`} />
                        <input required type="email" placeholder="student@example.com" className={inputStyle}
                          value={studentDetails.studentEmail} onChange={(e) => setStudentDetails({ ...studentDetails, studentEmail: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className={labelStyle}>Board</label>
                      <div className="relative">
                        <Layers size={16} className={`absolute left-4 top-3.5 ${theme.textMuted}`} />
                        <input required type="text" placeholder="CBSE/ICSE" className={inputStyle}
                          value={studentDetails.board} onChange={(e) => setStudentDetails({ ...studentDetails, board: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelStyle}>Grade</label>
                      <div className="relative">
                        <Sparkles size={16} className={`absolute left-4 top-3.5 ${theme.textMuted}`} />
                        <input required type="text" inputMode="numeric" placeholder="Class (e.g. 8)" className={inputStyle}
                          value={studentDetails.classGrade} onChange={(e) => setStudentDetails({ ...studentDetails, classGrade: e.target.value.replace(/\D/g, '') })}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelStyle}>School Name</label>
                    <div className="relative">
                      <School size={16} className={`absolute left-4 top-3.5 ${theme.textMuted}`} />
                      <input required type="text" placeholder="Enter school name" className={inputStyle}
                        value={studentDetails.schoolName} onChange={(e) => setStudentDetails({ ...studentDetails, schoolName: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>

            {/* --- RIGHT COLUMN: PRICING & SUMMARY --- */}
            <motion.div variants={itemVariants} className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">

              {/* Plan Selection */}
              <div className="grid gap-4">
                {/* Full Bundle Option */}
                <div
                  onClick={() => setPurchaseType("FULL_BUNDLE")}
                  className={`relative group cursor-pointer p-6 rounded-2xl border transition-all duration-300
                    ${purchaseType === "FULL_BUNDLE"
                      ? `${theme.highlightBg} border-cyan-500 ${theme.highlightShadow}`
                      : `${theme.cardBg} ${theme.cardBorder} hover:border-slate-300`}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${purchaseType === "FULL_BUNDLE" ? "border-cyan-500 bg-cyan-500" : "border-gray-400"}`}>
                        {purchaseType === "FULL_BUNDLE" && <CheckCircle2 size={14} className="text-white" />}
                      </div>
                      <span className={`font-bold text-lg ${purchaseType === "FULL_BUNDLE" ? theme.text : theme.textMuted}`}>Complete Batch</span>
                    </div>
                    {purchaseType === "FULL_BUNDLE" && (
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${isDarkMode ? "bg-cyan-500/10 text-cyan-400" : "bg-cyan-100 text-cyan-700"}`}>Best Value</span>
                    )}
                  </div>

                  <div className="pl-8">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className={`text-3xl font-bold ${theme.text}`}>₹{pricePerSession * FULL_BATCH_SESSIONS}</span>
                      <span className={`text-sm ${theme.textMuted}`}>for {FULL_BATCH_SESSIONS} sessions</span>
                    </div>
                    <p className={`text-xs ${theme.textMuted}`}>Guaranteed slot reservation for the entire batch.</p>
                  </div>
                </div>

                {/* Single Session Option */}
                <div
                  onClick={() => setPurchaseType("SINGLE_SESSION")}
                  className={`relative group cursor-pointer p-6 rounded-2xl border transition-all duration-300
                    ${purchaseType === "SINGLE_SESSION"
                      ? `${theme.highlightBg} border-cyan-500 ${theme.highlightShadow}`
                      : `${theme.cardBg} ${theme.cardBorder} hover:border-slate-300`}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${purchaseType === "SINGLE_SESSION" ? "border-cyan-500 bg-cyan-500" : "border-gray-400"}`}>
                        {purchaseType === "SINGLE_SESSION" && <CheckCircle2 size={14} className="text-white" />}
                      </div>
                      <span className={`font-bold text-lg ${purchaseType === "SINGLE_SESSION" ? theme.text : theme.textMuted}`}>Pay As You Go</span>
                    </div>
                  </div>

                  <div className="pl-8">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className={`text-3xl font-bold ${theme.text}`}>₹{pricePerSession}</span>
                      <span className={`text-sm ${theme.textMuted}`}>/ session</span>
                    </div>
                    <p className={`text-xs ${theme.textMuted}`}>Book a single session to try it out.</p>
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              <div className={`${theme.highlightBg} border ${theme.cardBorder} rounded-2xl p-6 ${isDarkMode ? "shadow-xl" : "shadow-2xl shadow-slate-200"}`}>
                <div className={`flex items-center gap-2 mb-6 ${isDarkMode ? "text-gray-300" : "text-slate-600"}`}>
                  <CreditCard size={18} />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Payment Summary</h3>
                </div>

                <div className={`space-y-3 pb-6 border-b ${theme.sectionHeaderBorder} text-sm`}>
                  <div className={`flex justify-between ${theme.textMuted}`}>
                    <span>Batch Type</span>
                    <span className={`font-medium ${theme.text}`}>{BATCH_TYPE}</span>
                  </div>
                  <div className={`flex justify-between ${theme.textMuted}`}>
                    <span>Selected Plan</span>
                    <span className={`font-medium ${theme.text}`}>{purchaseType === 'FULL_BUNDLE' ? 'Full Bundle' : 'Single Session'}</span>
                  </div>
                  {purchaseType === 'FULL_BUNDLE' && (
                    <div className={`flex justify-between text-xs ${isDarkMode ? "text-cyan-400/80" : "text-cyan-600"}`}>
                      <span>Sessions included</span>
                      <span>{FULL_BATCH_SESSIONS}x Sessions</span>
                    </div>
                  )}
                </div>

                <div className="pt-6">
                  <div className="flex justify-between items-end mb-6">
                    <span className={`text-sm ${theme.textMuted}`}>Total Payable</span>
                    <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className={`w-full py-4 rounded-xl font-bold text-base shadow-lg transition-all duration-300 flex items-center justify-center gap-2
                      ${isProcessing
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-cyan-500/30 hover:-translate-y-0.5'}`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <>
                        <span>Proceed to Pay</span>
                        <ArrowLeft size={18} className="rotate-180" />
                      </>
                    )}
                  </button>

                  <div className={`mt-4 flex justify-center gap-4 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 ${theme.textMuted}`}>
                    <p className="text-[10px]">Secured by Razorpay · UPI / Cards / NetBanking</p>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default BuyCourse;