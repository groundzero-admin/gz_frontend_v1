import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaArrowLeft, 
  FaHeadset, 
  FaEnvelope, 
  FaPhoneAlt,
  FaReceipt
} from "react-icons/fa";

const StudentPaymentStatusHandler = ({ isDark }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('payment'); // 'success' or 'cancelled'
  
  const [countdown, setCountdown] = useState(6);

  useEffect(() => {
    // Timer Logic
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // Auto-Redirect when timer hits 0
    if (countdown === 0) {
      // Navigate to dashboard cleanly (removing query params)
      navigate('/student/dashboard', { replace: true });
    }

    return () => clearInterval(timer);
  }, [countdown, navigate]);

  // --- Dynamic Styles & Content ---
  const isSuccess = status === 'success';

  // Theme Colors
  const themeColor = isSuccess ? 'text-green-500' : 'text-red-500';
  const bgColor = isSuccess 
    ? (isDark ? 'bg-green-900/20' : 'bg-green-50') 
    : (isDark ? 'bg-red-900/20' : 'bg-red-50');
  
  const Icon = isSuccess ? FaCheckCircle : FaTimesCircle;
  const title = isSuccess ? "Payment Successful!" : "Payment Cancelled";
  const message = isSuccess 
    ? "Your credits have been added successfully. You can now join your sessions."
    : "The transaction was cancelled or declined. No charges were deducted.";

  // Shared UI Styles
  const cardBg = isDark ? "var(--card-dark)" : "var(--bg-light)";
  const borderColor = isDark ? "var(--border-dark)" : "var(--border-light)";
  const textColor = isDark ? "var(--text-dark-primary)" : "var(--text-light-primary)";
  const textSecondary = isDark ? "var(--text-dark-secondary)" : "var(--text-light-secondary)";
  const supportBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40 p-4">
      <div 
        className="w-full max-w-lg rounded-2xl border shadow-2xl p-8 text-center relative overflow-hidden"
        style={{ backgroundColor: cardBg, borderColor: borderColor }}
      >
        {/* Progress Bar */}
        <div 
          className={`absolute top-0 left-0 h-1 transition-all duration-1000 ease-linear ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}
          style={{ width: `${(countdown / 6) * 100}%` }}
        ></div>

        {/* Main Icon */}
        <div className="mb-6 flex justify-center">
          <div className={`p-4 rounded-full ${bgColor} ${themeColor}`}>
            <Icon className="text-6xl" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-bold mb-2" style={{ color: textColor }}>
          {title}
        </h1>
        <p className="text-lg mb-8" style={{ color: textSecondary }}>
          {message}
        </p>

        {/* FAILURE SPECIFIC: Support Section */}
        {!isSuccess && (
          <div className="rounded-xl p-5 mb-8 text-left" style={{ backgroundColor: supportBg }}>
            <h3 className="font-bold flex items-center gap-2 mb-3" style={{ color: textColor }}>
              <FaHeadset className="text-[var(--accent-teal)]" /> 
              Payment Support
            </h3>
            <p className="text-sm mb-4" style={{ color: textSecondary }}>
              If you believe this is an error or money was deducted, please contact us immediately:
            </p>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-[var(--accent-teal)] text-white text-xs">
                  <FaPhoneAlt />
                </div>
                <span className="font-mono font-medium" style={{ color: textColor }}>+91 9618132923</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-[var(--accent-teal)] text-white text-xs">
                  <FaEnvelope />
                </div>
                <span className="font-mono font-medium" style={{ color: textColor }}>shivangi@groundzero.world</span>
                <span className="font-mono font-medium" style={{ color: textColor }}>saranya@groundzero.world </span>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS SPECIFIC: Action Hint */}
        {/* {isSuccess && (
          <div className="rounded-xl p-4 mb-8 flex items-center gap-3 text-left" style={{ backgroundColor: supportBg }}>
            <FaReceipt className="text-2xl text-[var(--accent-teal)]" />
            <div>
              <h4 className="font-bold text-sm" style={{ color: textColor }}>Receipt Sent</h4>
              <p className="text-xs" style={{ color: textSecondary }}>A confirmation email has been sent to your registered address.</p>
            </div>
          </div>
        )} */}

        {/* Footer / Navigation */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm animate-pulse" style={{ color: textSecondary }}>
            Redirecting to dashboard in {countdown}s...
          </p>
          
          <button
            onClick={() => navigate('/student/dashboard', { replace: true })}
            className="flex items-center gap-2 px-6 py-2 rounded-full border transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ borderColor: borderColor, color: textColor }}
          >
            <FaArrowLeft size={12} /> Return to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};

export default StudentPaymentStatusHandler;