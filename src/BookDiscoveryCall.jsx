import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Calendar, 
  CreditCard, 
  Sun, 
  Moon, 
  Loader2,
  AlertCircle
} from 'lucide-react';

const BookingPage = () => {
  // --- State Management ---
  const [isDark, setIsDark] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    goals: ''
  });
  const [errors, setErrors] = useState({});

  // --- Theme Toggler ---
  const toggleTheme = () => setIsDark(!isDark);



  // --- Navigation Logic ---
  const handleBackToHome = () => {
    // Navigate to the root route ("/")
    window.location.href = '/'; 
  };




  // --- Form Handling ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
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
  // UPDATED: Added &a1= to prefill the custom question (Goals)
// --- Calendly URL Construction ---
  // We define colors based on the current theme (isDark)
  // Note: Calendly requires hex codes WITHOUT the '#' symbol
  const themeParams = isDark 
    ? "&background_color=13141F&text_color=ffffff&primary_color=22d3ee" 
    : "&background_color=ffffff&text_color=0f172a&primary_color=06b6d4";

  const calendlyUrl = `https://calendly.com/adarshtech251/30min?embed_domain=groundzero&embed_type=Inline&name=${encodeURIComponent(formData.name)}&email=${encodeURIComponent(formData.email)}&a1=${encodeURIComponent(formData.goals)}${themeParams}`;
  return (
    <div className={`min-h-screen font-sans selection:bg-cyan-500/30 transition-colors duration-500 ${styles.bg} ${styles.text}`}>
      
      {/* --- Background Effects --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] blur-[120px] rounded-full transition-colors duration-500 ${styles.glow}`} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12">
        
        {/* --- Header / Nav --- */}
        <div className="flex items-center justify-between mb-12">
          <button className={`flex items-center gap-2 text-sm font-medium transition-colors ${styles.subtext} hover:text-cyan-400`} onClick={handleBackToHome} >
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
            Book Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Discovery Session</span>
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${styles.subtext}`}>
            A 30-minute clarity session designed to understand your goals and see if we're the right fit.
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
                    // REMOVED: disabled={showCalendar} 
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
                    // REMOVED: disabled={showCalendar}
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
                    // REMOVED: disabled={showCalendar}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all placeholder:text-gray-500 ${styles.input} ${errors.email ? 'border-red-500/50' : ''}`}
                  />
                   {errors.email && <p className="text-red-400 text-xs ml-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.email}</p>}
                </div>

                {/* Goals Input (Optional) */}
                <div className="space-y-1.5">
                  <label className={`text-sm font-medium ml-1 ${styles.label}`}>
                    How can we help you? <span className={`text-xs ${styles.subtext}`}>(Optional)</span>
                  </label>
                  <textarea 
                    name="goals"
                    value={formData.goals}
                    onChange={handleInputChange}
                    placeholder="Share your goals or challenges..."
                    rows={3}
                    // REMOVED: disabled={showCalendar}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all placeholder:text-gray-500 resize-none ${styles.input}`}
                  />
                </div>
              </div>
            </div>

            {/* Fee Card */}
            <div className={`rounded-2xl p-6 border flex items-start gap-4 transition-all duration-300 ${styles.feeCard}`}>
              <div className={`p-3 rounded-full shrink-0 ${isDark ? 'bg-slate-800 text-cyan-400' : 'bg-white text-slate-900 shadow-sm'}`}>
                <CreditCard size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Session Fee: ₹200</h3>
                <p className={`text-sm leading-relaxed ${styles.subtext}`}>
                  This small fee ensures sincerity and attendance. It's <span className="text-cyan-500 font-medium">fully adjusted</span> if you continue, or refundable on request.
                </p>
              </div>
            </div>

          </div>

          {/* === RIGHT COLUMN: INFO & CALENDAR === */}
          <div className="space-y-6">
            
            {/* Info Card */}
            <div className={`backdrop-blur-xl border rounded-2xl p-6 md:p-8 transition-all duration-300 ${styles.card}`}>
              <h2 className="text-xl font-bold mb-6">What this session will do</h2>
              <ul className="space-y-4">
                {[
                  "Help you gain clarity on where you currently stand",
                  "Identify potential areas of work & what's blocking progress",
                  "Explore how we can support you, if we're the right fit"
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
                  <p className={`text-sm ${styles.subtext}`}>Select a 30-minute slot that works for you.</p>
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
                        "Confirm Details & View Slots"
                      )}
                    </button>
                  </div>
                ) : (
                  /* State 2: Calendar Revealed (Iframe) */
                  <div className="w-full h-full min-h-[600px] animate-in slide-in-from-bottom-4 duration-500">
                    <div className={`p-3 mb-2 rounded-lg text-xs text-center border ${isDark ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-200' : 'bg-cyan-50 border-cyan-200 text-cyan-800'}`}>
                       Slots Unlocked for <strong>{formData.name}</strong>
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

export default BookingPage;