import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  FaEnvelope, 
  FaUser, 
  FaPhone, 
  FaLock, 
  FaKey, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaUserFriends, 
  FaMoon,
  FaSun
} from "react-icons/fa";

// Import API functions
import { validateParentInvite, completeParentOnboarding } from "../api.js";

// --- Reusable Input Component ---
const SignupInput = ({ id, label, icon, isDark, error, ...props }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium mb-2 opacity-80">
      {label}
    </label>
    <div className="relative group">
      <span 
        className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
        style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
      >
        {icon}
      </span>
      <input
        id={id}
        autoComplete="off"
        className={`w-full pl-12 pr-4 py-3 rounded-xl border bg-transparent transition-all outline-none focus:ring-2
          ${props.disabled ? 'opacity-60 cursor-not-allowed' : ''}
          ${error ? 'border-red-500 focus:ring-red-500/20' : isDark ? 'border-white/10 focus:border-[var(--accent-teal)] focus:ring-[var(--accent-teal)]/20' : 'border-black/10 focus:border-[var(--accent-teal)]'}
        `}
        style={{
          color: isDark ? "#fff" : "#000",
          backgroundColor: isDark ? "rgba(20, 20, 30, 0.6)" : "rgba(255,255,255,0.8)",
          boxShadow: isDark ? "inset 0 0 0 100px rgba(20, 20, 30, 0.6)" : "none" 
        }}
        {...props}
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1 ml-1 animate-pulse">{error}</p>}
  </div>
);

const ParentSignupPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // --- Theme State (Default to Dark) ---
  const [isDark, setIsDark] = useState(false ); 

  // --- Logic State ---
  const [step, setStep] = useState('VALIDATING'); // VALIDATING, FORM, SUCCESS, ERROR
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Form State ---
  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    otp: "",
    password: "",
    confirmPassword: ""
  });
  const [formErrors, setFormErrors] = useState({});

  // 1. Validate Token on Load
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setStep('ERROR');
        setErrorMessage("Missing invitation token.");
        return;
      }

      const response = await validateParentInvite(token);

      if (response.success) {
        // ✅ FIX: Use 'parentEmail' from the response
        setEmail(response.data.parentEmail); 
        setStep('FORM');
      } else {
        setStep('ERROR');
        setErrorMessage(response.message);
      }
    };

    checkToken();
  }, [token]);

  // 2. Form Handlers
  const handleChange = (e) => {
    const { id, value } = e.target;
    
    // Mobile Number Validation: Only allow integers
    if (id === 'mobile') {
        if (!/^\d*$/.test(value)) return; 
    }

    setFormData({ ...formData, [id]: value });
    
    if (formErrors[id]) {
      setFormErrors({ ...formErrors, [id]: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = "Full Name is required";
    if (!formData.mobile) errors.mobile = "Mobile number is required";
    if (formData.mobile.length < 10) errors.mobile = "Enter a valid 10-digit number";
    if (!formData.otp) errors.otp = "OTP is required";
    if (!formData.password) errors.password = "Password is required";
    if (formData.password.length < 6) errors.password = "Min 6 characters required";
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload = {
      token,
      otp: formData.otp,
      password: formData.password,
      name: formData.name,
      mobile: formData.mobile
    };

    const response = await completeParentOnboarding(payload);

    if (response.success) {
      setStep('SUCCESS');
    } else {
      alert(response.message);
    }
    
    setIsSubmitting(false);
  };

  // --- Styles ---
  const bgStyle = {
    background: isDark 
      ? "radial-gradient(circle at top left, #1a202c, #0d0f14)" 
      : "radial-gradient(circle at top left, #f7fafc, #edf2f7)",
    color: isDark ? "var(--text-dark-primary)" : "var(--text-light-primary)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    position: "relative"
  };

  const cardStyle = {
    backgroundColor: isDark ? "rgba(30, 30, 40, 0.7)" : "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(20px)",
    borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    boxShadow: isDark ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)" : "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
  };

  return (
    <div style={bgStyle}>
      
      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="absolute top-6 right-6 p-3 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
        style={{ 
          backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "white",
          color: isDark ? "yellow" : "orange"
        }}
        title="Toggle Theme"
      >
        {isDark ? <FaSun /> : <FaMoon />}
      </button>

      {/* Loading State */}
      {step === 'VALIDATING' && (
        <div className="animate-pulse flex flex-col items-center">
          <FaUserFriends className="text-6xl text-[var(--accent-teal)] mb-6" />
          <h2 className="text-xl font-bold tracking-wider uppercase">Verifying Invitation...</h2>
        </div>
      )}

      {/* Error State */}
      {step === 'ERROR' && (
        <div className="max-w-md w-full p-8 rounded-2xl border text-center" style={cardStyle}>
          <div className="mx-auto w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <FaExclamationTriangle className="text-3xl text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-red-500 mb-2">Invitation Invalid</h1>
          <p className="opacity-70 mb-8">{errorMessage}</p>
          <button 
             onClick={() => navigate('/login')}
             className="px-6 py-2 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-700 transition"
          >
            Go Home
          </button>
        </div>
      )}

      {/* Success State */}
      {step === 'SUCCESS' && (
        <div className="max-w-md w-full p-8 rounded-2xl border text-center" style={cardStyle}>
          <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
            <FaCheckCircle className="text-4xl text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-green-500 mb-2">Registration Complete!</h1>
          <p className="opacity-70 mb-8">
            Your parent account has been created and linked to your child.
          </p>
          <button 
             onClick={() => navigate('/login')}
             className="w-full py-3 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105"
             style={{ background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))" }}
          >
            Login to Dashboard
          </button>
        </div>
      )}

      {/* Main Form State */}
      {step === 'FORM' && (
        <div className="max-w-2xl w-full p-8 rounded-3xl border relative overflow-hidden" style={cardStyle}>
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 rounded-full bg-[var(--accent-teal)] bg-opacity-10 mb-4">
              <FaUserFriends className="text-4xl text-[var(--accent-teal)]" />
            </div>
            <p className="text-sm font-bold tracking-widest text-[var(--accent-teal)] uppercase mb-2">Parent Registration</p>
            <h1 className="text-3xl font-bold">Complete Profile</h1>
            <p className="opacity-60 mt-2 text-sm">Create your account to track your child's progress</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            
            {/* Left Column */}
            <div>
              <SignupInput
                id="email"
                label="Email Address"
                icon={<FaEnvelope />}
                isDark={isDark}
                value={email}
                disabled={true} 
                style={{
                    cursor: "not-allowed",
                    opacity: 0.7,
                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
                }}
              />
              
              <SignupInput
                id="name"
                label="Parent Name"
                icon={<FaUser />}
                isDark={isDark}
                value={formData.name}
                onChange={handleChange}
                error={formErrors.name}
                placeholder="e.g. Jane Doe"
              />

              <SignupInput
                id="mobile"
                label="Mobile Number"
                icon={<FaPhone />}
                isDark={isDark}
                value={formData.mobile}
                onChange={handleChange}
                error={formErrors.mobile}
                placeholder="9876543210"
                maxLength={10} 
                type="text"
                inputMode="numeric"
              />
            </div>

            {/* Right Column */}
            <div>
              <SignupInput
                id="otp"
                label="Invitation OTP"
                icon={<FaKey />}
                isDark={isDark}
                value={formData.otp}
                onChange={handleChange}
                error={formErrors.otp}
                placeholder="Enter OTP from email"
              />

              <SignupInput
                id="password"
                type="password"
                label="Create Password"
                icon={<FaLock />}
                isDark={isDark}
                value={formData.password}
                onChange={handleChange}
                error={formErrors.password}
                placeholder="••••••••"
              />

              <SignupInput
                id="confirmPassword"
                type="password"
                label="Confirm Password"
                icon={<FaLock />}
                isDark={isDark}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={formErrors.confirmPassword}
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <div className="col-span-full mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg text-lg transition-all
                  ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-110 active:scale-[0.99]'}
                `}
                style={{ 
                    background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))",
                    boxShadow: "0 10px 25px -5px rgba(var(--accent-teal-rgb), 0.4)" 
                }}
              >
                {isSubmitting ? "Activating Account..." : "Complete Registration"}
              </button>
              
              <p className="text-center text-xs opacity-40 mt-6">
                By registering, you agree to our Terms of Service & Privacy Policy.
              </p>
            </div>

          </form>
        </div>
      )}
    </div>
  );
};

export default ParentSignupPage;