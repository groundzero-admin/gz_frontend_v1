import React, { useEffect, useState, useMemo } from "react";
import {
  Loader2, CheckCircle2, AlertTriangle, Lock, KeyRound,
  User, Mail, Phone, School, GraduationCap, Layers,
  ArrowRight, Sparkles, Rocket, Sun, Moon, Eye, EyeOff
} from "lucide-react";
import { motion } from "framer-motion";
import { validateInvitation, completeRegistration } from "./api";
import useThemeStore from "./store/useThemeStore";

export default function StudentRegistration() {
  const token = new URLSearchParams(window.location.search).get("token");

  // --- STATE ---
  const { isDark: isDarkMode, toggleTheme } = useThemeStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Password Visibility State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form State
  const [form, setForm] = useState({
    studentName: "",
    studentEmail: "",
    parentName: "",
    parentPhone: "",
    schoolName: "",
    classGrade: "",
    board: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  // --- BACKGROUND ANIMATION ---
  const stars = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1 + 'px',
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 3 + 2}s`,
    }));
  }, []);

  const rocketVariants = {
    animate: {
      x: ["-10vw", "110vw"],
      y: ["110vh", "-10vh"],
      rotate: 45,
      transition: { duration: 35, ease: "linear", repeat: Infinity }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  // --- LOAD & VALIDATE TOKEN ---
  useEffect(() => {
    const load = async () => {
      try {
        const res = await validateInvitation(token);
        if (res.success) {
          setForm(prev => ({
            ...prev,
            studentName: res.data.studentName || "",
            studentEmail: res.data.studentEmail || "",
            parentName: res.data.parentName || "",
            parentPhone: res.data.parentPhone || "",
            schoolName: res.data.schoolName || "",
            classGrade: res.data.classGrade || "",
            board: res.data.board || "",
          }));
        } else {
          setError(res.message);
        }
      } catch (e) {
        setError(e.message || "Failed to validate invitation");
      }
      setLoading(false);
    };
    if (token) load();
    else {
      setError("No token provided");
      setLoading(false);
    }
  }, [token]);

  // --- HANDLERS ---
  const handleNumericInput = (e, field) => {
    const value = e.target.value.replace(/\D/g, "");
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation Check
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setSubmitting(true);
    try {
      // 2. Prepare Payload with EXACT Backend Keys
      // Backend expects: { token, otp, password, name, mobile, schoolName, board }
      const payload = {
        token,
        otp: form.otp,
        password: form.password,

        // Mapped Fields
        name: form.studentName,      // studentName -> name
        mobile: form.parentPhone,    // parentPhone -> mobile
        schoolName: form.schoolName, // Matches
        board: form.board,           // Matches

        // Optional Extras (if backend needs them later)
        classGrade: form.classGrade,
        parentName: form.parentName
      };

      const res = await completeRegistration(payload);

      if (res.success) setSuccess(true);
      else alert(res.message);
    } catch (e) {
      alert(e.message || "Registration failed");
    }
    setSubmitting(false);
  };

  // --- DYNAMIC STYLES ---
  const theme = {
    bg: isDarkMode ? "bg-[#0B0C1B]" : "bg-slate-50",
    text: isDarkMode ? "text-gray-100" : "text-slate-900",
    textMuted: isDarkMode ? "text-gray-400" : "text-slate-500",
    cardBg: isDarkMode ? "bg-[#13141F]/70 backdrop-blur-xl" : "bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/50",
    cardBorder: isDarkMode ? "border-white/10" : "border-slate-200",
    inputBg: isDarkMode ? "bg-[#0B0C1B]/80" : "bg-white",
    inputBorder: isDarkMode ? "border-white/10" : "border-slate-300",
    inputText: isDarkMode ? "text-gray-200" : "text-slate-900",
    inputPlaceholder: isDarkMode ? "placeholder-gray-600" : "placeholder-slate-400",
    label: isDarkMode ? "text-cyan-200/70" : "text-slate-500",
    icon: isDarkMode ? "text-cyan-500/50" : "text-slate-400",
    rocketColor: isDarkMode ? "text-cyan-500" : "text-blue-300",
    starColor: isDarkMode ? "bg-white" : "bg-slate-400",
  };

  const inputGroupStyle = "space-y-1.5";
  const labelStyle = `text-xs font-bold uppercase tracking-wider ml-1 ${theme.label}`;
  const inputWrapperStyle = "relative group";
  const iconStyle = `absolute left-3 top-3.5 transition-colors group-focus-within:text-cyan-500 ${theme.icon}`;
  const inputStyle = `
    w-full ${theme.inputBg} border ${theme.inputBorder} rounded-xl px-4 py-3 pl-10 
    text-sm ${theme.inputText} ${theme.inputPlaceholder} outline-none transition-all duration-300
    focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500
  `;
  const eyeIconStyle = `absolute right-3 top-3.5 cursor-pointer hover:text-cyan-500 transition-colors ${theme.icon}`;

  return (
    <div className={`min-h-screen font-sans ${theme.bg} ${theme.text} selection:bg-cyan-500/30 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-500`}>

      {/* --- BACKGROUND ANIMATIONS --- */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none transition-opacity duration-500">
        {stars.map(star => (
          <div key={star.id} className={`absolute rounded-full ${theme.starColor}`}
            style={{
              left: star.left, top: star.top, width: star.size, height: star.size,
              animation: `twinkle ${star.duration} ease-in-out infinite ${star.delay}`,
              opacity: isDarkMode ? 0.6 : 0.4
            }}
          />
        ))}
        <motion.div variants={rocketVariants} animate="animate" initial={{ x: "-10vw", y: "110vh", rotate: 45 }}
          className={`absolute z-0 opacity-20 ${theme.rocketColor}`}>
          <Rocket size={60} />
        </motion.div>
        <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] blur-[120px] rounded-full opacity-20 mix-blend-screen ${isDarkMode ? "bg-cyan-600/30" : "bg-cyan-200/60"}`} />
        <div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] blur-[100px] rounded-full opacity-20 mix-blend-screen ${isDarkMode ? "bg-purple-600/30" : "bg-blue-200/60"}`} />
      </div>

      {/* --- TOP RIGHT THEME TOGGLE --- */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full border transition-all duration-300 backdrop-blur-md
            ${isDarkMode ? "bg-white/10 border-white/20 text-yellow-400" : "bg-white/50 border-slate-200 text-slate-600 shadow-sm"}`}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* --- HEADER --- */}
      <div className="relative z-10 text-center mb-8 max-w-2xl mx-auto">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider mb-4
          ${isDarkMode ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-cyan-50 border-cyan-200 text-cyan-700"}`}>
          <Sparkles size={14} /> Student Onboarding
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
          Complete Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600">Profile</span>
        </h1>
        <p className={`${theme.textMuted} text-lg max-w-lg mx-auto`}>
          Review your details and set up your secure access.
        </p>
      </div>

      {/* --- MAIN WIDE CARD --- */}
      <motion.div
        className="w-full max-w-6xl relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-3xl p-8 md:p-12 transition-colors duration-300`}>

          {/* LOADING STATE */}
          {loading && (
            <div className="text-center py-20 space-y-4">
              <Loader2 size={48} className="animate-spin mx-auto text-cyan-500" />
              <p className={`${theme.textMuted} animate-pulse`}>Validating your invitation...</p>
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div className="text-center py-16 space-y-6">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20">
                <AlertTriangle size={40} className="text-red-500" />
              </div>
              <h2 className={`text-2xl font-bold ${theme.text}`}>Invalid Invitation</h2>
              <p className={theme.textMuted}>{error}</p>
            </div>
          )}

          {/* SUCCESS STATE */}
          {!loading && !error && success && (
            <div className="text-center py-16 space-y-6">
              <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 size={50} className="text-emerald-500" />
              </div>
              <h2 className={`text-3xl font-bold ${theme.text}`}>Welcome Aboard!</h2>
              <p className={theme.textMuted}>Your student account has been successfully created.</p>
              <button onClick={() => (window.location.href = "/login")}
                className="mt-4 px-10 py-4 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-cyan-500/40 transition-all">
                Go to Login
              </button>
            </div>
          )}

          {/* FORM STATE */}
          {!loading && !error && !success && (
            <form onSubmit={handleSubmit} className="space-y-10">

              {/* SECTION 1: PERSONAL & ACADEMIC (3 Columns Grid) */}
              <div className="space-y-6">
                <div className={`flex items-center gap-2 ${theme.text} border-b ${theme.cardBorder} pb-2`}>
                  <User size={20} className="text-cyan-500" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Student & Parent Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Row 1 */}
                  <div className={inputGroupStyle}>
                    <label className={labelStyle}>Student Name</label>
                    <div className={inputWrapperStyle}>
                      <User size={18} className={iconStyle} />
                      <input required type="text" placeholder="Full Name" className={inputStyle}
                        value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={inputGroupStyle}>
                    <label className={labelStyle}>Email (Read Only)</label>
                    <div className={inputWrapperStyle}>
                      <Mail size={18} className={iconStyle} />
                      <input disabled type="email" className={`${inputStyle} opacity-60 cursor-not-allowed`}
                        value={form.studentEmail}
                      />
                    </div>
                  </div>

                  <div className={inputGroupStyle}>
                    <label className={labelStyle}>Parent Name</label>
                    <div className={inputWrapperStyle}>
                      <User size={18} className={iconStyle} />
                      <input required type="text" placeholder="Parent Name" className={inputStyle}
                        value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className={inputGroupStyle}>
                    <label className={labelStyle}>Parent Phone</label>
                    <div className={inputWrapperStyle}>
                      <Phone size={18} className={iconStyle} />
                      <input required type="text" inputMode="numeric" pattern="[0-9]*" maxLength={10} placeholder="Mobile Number" className={inputStyle}
                        value={form.parentPhone} onChange={(e) => handleNumericInput(e, 'parentPhone')}
                      />
                    </div>
                  </div>

                  <div className={inputGroupStyle}>
                    <label className={labelStyle}>School Name</label>
                    <div className={inputWrapperStyle}>
                      <School size={18} className={iconStyle} />
                      <input required type="text" placeholder="School Name" className={inputStyle}
                        value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className={inputGroupStyle}>
                      <label className={labelStyle}>Grade</label>
                      <div className={inputWrapperStyle}>
                        <GraduationCap size={18} className={iconStyle} />
                        <input required type="text" inputMode="numeric" pattern="[0-9]*" placeholder="Class" className={inputStyle}
                          value={form.classGrade} onChange={(e) => handleNumericInput(e, 'classGrade')}
                        />
                      </div>
                    </div>
                    <div className={inputGroupStyle}>
                      <label className={labelStyle}>Board</label>
                      <div className={inputWrapperStyle}>
                        <Layers size={18} className={iconStyle} />
                        <input required type="text" placeholder="CBSE/ICSE" className={inputStyle}
                          value={form.board} onChange={(e) => setForm({ ...form, board: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: SECURITY (3 Columns Grid) */}
              <div className="space-y-6">
                <div className={`flex items-center gap-2 ${theme.text} border-b ${theme.cardBorder} pb-2`}>
                  <Lock size={20} className="text-purple-500" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Security Setup</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className={inputGroupStyle}>
                    <label className={labelStyle}>OTP (From Email)</label>
                    <div className={inputWrapperStyle}>
                      <KeyRound size={18} className={iconStyle} />
                      <input required type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} placeholder="6-digit OTP" className={`${inputStyle} tracking-widest font-mono`}
                        value={form.otp} onChange={(e) => handleNumericInput(e, 'otp')}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className={inputGroupStyle}>
                    <label className={labelStyle}>Password</label>
                    <div className={inputWrapperStyle}>
                      <Lock size={18} className={iconStyle} />
                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        placeholder="Create Password"
                        className={inputStyle}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                      />
                      <div className={eyeIconStyle} onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className={inputGroupStyle}>
                    <label className={labelStyle}>Confirm Password</label>
                    <div className={inputWrapperStyle}>
                      <Lock size={18} className={iconStyle} />
                      <input
                        required
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        className={inputStyle}
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      />
                      <div className={eyeIconStyle} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full py-4 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2
                  ${submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white hover:shadow-cyan-500/25'}`}
              >
                {submitting ? (
                  <> <Loader2 size={20} className="animate-spin" /> Creating Account... </>
                ) : (
                  <> Complete Registration <ArrowRight size={20} /> </>
                )}
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}