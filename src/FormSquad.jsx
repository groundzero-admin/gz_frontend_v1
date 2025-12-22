import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Calendar, 
  CreditCard, 
  Sun, 
  Moon, 
  Loader2, 
  AlertCircle,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FormSquad = () => {
  // --- State Management ---
  const [isDark, setIsDark] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    squadSize: '',
    squadGoals: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // --- Theme Toggler ---
  const toggleTheme = () => setIsDark(!isDark);

  // --- Navigation Logic ---
  const handleBackToHome = () => {
    navigate("/"); // Always redirect to login

  };

  // --- Form Handling ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // --- Validation & Reveal Logic ---
  const handleShowSlots = () => {
    // 1. Basic Validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 2. Simulate Processing / Loading
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowCalendar(true);
    }, 800); 
  };

  // --- Dynamic Styles based on Theme ---
  const styles = {
    bg: isDark ? "bg-[#0B0C15]" : "bg-slate-50",
    text: isDark ? "text-gray-100" : "text-slate-900",
    subtext: isDark ? "text-gray-400" : "text-slate-500",
    card: isDark 
      ? "bg-[#13141F]/80 border-white/10" 
      : "bg-white border-slate-200 shadow-xl shadow-slate-200/50",
    input: isDark 
      ? "bg-[#0F1019] border-white/10 text-white focus:border-cyan-500/50 focus:bg-[#151621]" 
      : "bg-white border-slate-200 text-slate-900 focus:border-cyan-500/50 focus:bg-slate-50",
    label: isDark ? "text-gray-300" : "text-slate-700",
    button: isDark 
      ? "bg-[#8EE6F6] text-black hover:bg-[#7AD3E3]" 
      : "bg-slate-900 text-white hover:bg-slate-800",
    feeCard: isDark 
      ? "bg-[#13141F] border-white/10" 
      : "bg-slate-100 border-slate-200",
    glow: isDark ? "bg-cyan-500/20" : "bg-cyan-400/10",
  };

  // --- Calendly URL Construction ---
  // Using 'a1' to pass the "Tell us a bit about your squad" answer
  const themeParams = isDark 
    ? "&background_color=13141F&text_color=ffffff&primary_color=22d3ee" 
    : "&background_color=ffffff&text_color=0f172a&primary_color=06b6d4";

  // We combine squad size and goals into the custom answer if needed, or just send goals
  const customAnswer = `Size: ${formData.squadSize} students | Goals: ${formData.squadGoals}`;
  
  const calendlyUrl = `https://calendly.com/adarshtech251/30min?embed_domain=groundzero&embed_type=Inline&name=${encodeURIComponent(formData.name)}&email=${encodeURIComponent(formData.email)}&a1=${encodeURIComponent(customAnswer)}${themeParams}`;

  return (
    <div className={`min-h-screen font-sans selection:bg-cyan-500/30 transition-colors duration-500 ${styles.bg} ${styles.text}`}>
      
      {/* --- Background Effects --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] blur-[120px] rounded-full transition-colors duration-500 ${styles.glow}`} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12">
        
        {/* --- Header / Nav --- */}
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={handleBackToHome}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${styles.subtext} hover:text-cyan-400`} 
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-all duration-300 ${isDark ? 'bg-white/10 text-white-300 hover:bg-white/20' : 'bg-white shadow-md text-slate-600 hover:bg-slate-100'}`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* --- Title Section --- */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Form a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Squad</span>
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${styles.subtext}`}>
            Bring your people and begin your journey together.
          </p>
        </div>

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* === LEFT COLUMN: FORM === */}
          <div className="space-y-6">
            
            {/* Form Card */}
            <div className={`backdrop-blur-xl border rounded-2xl p-6 md:p-8 transition-all duration-300 ${styles.card}`}>
              <h2 className="text-xl font-bold mb-6">Your Details</h2>
              
              <div className="space-y-5">
                {/* Name Input */}
                <div className="space-y-1.5">
                  <label className={`text-sm font-medium ml-1 flex gap-1 ${styles.label}`}>
                    Name <span className="text-cyan-400">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all placeholder:text-gray-500 ${styles.input} ${errors.name ? 'border-red-500/50' : ''}`}
                  />
                  {errors.name && <p className="text-red-400 text-xs ml-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.name}</p>}
                </div>

                {/* Phone Input */}
                <div className="space-y-1.5">
                  <label className={`text-sm font-medium ml-1 flex gap-1 ${styles.label}`}>
                    Phone Number <span className="text-cyan-400">*</span>
                  </label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all placeholder:text-gray-500 ${styles.input} ${errors.phone ? 'border-red-500/50' : ''}`}
                  />
                  {errors.phone && <p className="text-red-400 text-xs ml-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.phone}</p>}
                </div>

                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className={`text-sm font-medium ml-1 flex gap-1 ${styles.label}`}>
                    Email <span className="text-cyan-400">*</span>
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all placeholder:text-gray-500 ${styles.input} ${errors.email ? 'border-red-500/50' : ''}`}
                  />
                   {errors.email && <p className="text-red-400 text-xs ml-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.email}</p>}
                </div>

                {/* Number of Squad Members */}
                <div className="space-y-1.5">
                  <label className={`text-sm font-medium ml-1 ${styles.label}`}>
                    Number of squad members <span className={`text-xs ${styles.subtext}`}>(Optional)</span>
                  </label>
                  <input 
                    type="text" 
                    name="squadSize"
                    value={formData.squadSize}
                    onChange={handleInputChange}
                    placeholder="e.g., 4"
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all placeholder:text-gray-500 ${styles.input}`}
                  />
                </div>

                {/* Squad Goals */}
                <div className="space-y-1.5">
                  <label className={`text-sm font-medium ml-1 ${styles.label}`}>
                    Tell us a bit about your squad <span className={`text-xs ${styles.subtext}`}>(Optional)</span>
                  </label>
                  <textarea 
                    name="squadGoals"
                    value={formData.squadGoals}
                    onChange={handleInputChange}
                    placeholder="Helps us tailor the session to your group..."
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all placeholder:text-gray-500 resize-none ${styles.input}`}
                  />
                </div>
              </div>
            </div>

            {/* Fee Card - Updated to be FREE */}
            <div className={`rounded-2xl p-6 border flex items-start gap-4 transition-all duration-300 ${styles.feeCard}`}>
              <div className={`p-3 rounded-full shrink-0 ${isDark ? 'bg-slate-800 text-cyan-400' : 'bg-white text-slate-900 shadow-sm'}`}>
                {/* Changed icon to represent currency/free */}
                <span className="font-bold text-lg">₹</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                  Session Fee: <span className="line-through text-gray-500 text-sm">₹200</span> <span className="text-cyan-400">₹0 (Free)</span>
                </h3>
                <p className={`text-sm leading-relaxed ${styles.subtext}`}>
                  The Discovery Session has been made free for your squad, please ensure everyone attends.
                </p>
              </div>
            </div>

          </div>

          {/* === RIGHT COLUMN: INFO & CALENDAR === */}
          <div className="space-y-6">
            
            {/* Info Card - Specific Squad Content */}
            <div className={`backdrop-blur-xl border rounded-2xl p-6 md:p-8 transition-all duration-300 ${styles.card}`}>
              <h2 className="text-xl font-bold mb-6">What This Squad Session Will Do</h2>
              <ul className="space-y-4">
                {[
                  "Help your group come together with clarity and shared purpose",
                  "Guide you on forming a proper squad - you need a minimum of 2 members to register, and all members should join the call",
                  "Align the squad on how you want to move through the program together"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-cyan-400 mt-0.5 shrink-0" />
                    <span className={`text-sm md:text-base ${styles.subtext}`}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Calendar Slot Selection */}
            <div className={`backdrop-blur-xl border rounded-2xl p-1 transition-all duration-300 overflow-hidden relative min-h-[400px] flex flex-col ${styles.card}`}>
              
              <div className="p-6 md:p-8 pb-0">
                <h2 className="text-xl font-bold mb-2">Choose Your Slot</h2>
                {!showCalendar && (
                  <p className={`text-sm ${styles.subtext}`}>Select a time that works for your entire squad.</p>
                )}
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                
                {/* State 1: Calendar Hidden (Initial) */}
                {!showCalendar ? (
                  <div className="text-center w-full max-w-xs animate-in fade-in zoom-in duration-300">
                    <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                      <Calendar size={32} className={isDark ? "text-gray-500" : "text-slate-400"} />
                    </div>
                    <p className={`text-sm mb-6 ${styles.subtext}`}>
                      Please fill in your details on the left to unlock available time slots.
                    </p>
                    
                    <button 
                      onClick={handleShowSlots}
                      disabled={loading}
                      className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${styles.button}`}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" /> Verifying...
                        </>
                      ) : (
                        "Confirm Your Squad Session"
                      )}
                    </button>
                  </div>
                ) : (
                  /* State 2: Calendar Revealed (Iframe) */
                  <div className="w-full h-full min-h-[600px] animate-in slide-in-from-bottom-4 duration-500">
                    <div className={`p-3 mb-2 rounded-lg text-xs text-center border ${isDark ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-200' : 'bg-cyan-50 border-cyan-200 text-cyan-800'}`}>
                       Slots Unlocked for <strong>{formData.name}</strong>'s Squad
                    </div>
                    
                    {/* Standard Calendly Inline Iframe */}
                    <iframe
                      src={calendlyUrl}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      title="Select a Date & Time - Calendly"
                      className="min-h-[600px]"
                    ></iframe>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Footer Note */}
        <div className={`mt-12 text-center text-xs ${styles.subtext} opacity-60`}>
          © 2025 Ground Zero. All rights reserved. • Secure booking via Calendly
        </div>

      </div>
    </div>
  );
};

export default FormSquad;