import React, { useState, useEffect, useRef, memo, useMemo } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import useThemeStore from "./store/useThemeStore";

// Register GSAP Plugin
gsap.registerPlugin(ScrollToPlugin);

// 1. HOISTED CONSTANTS (Created once in memory)
const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// 2. MEMOIZED BACKGROUND (Zero CPU usage on state changes)
const PageBackground = memo(({ isDark }) => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] blur-[110px] rounded-full opacity-30 transition-colors duration-1000 ${isDark ? "bg-cyan-900" : "bg-blue-300"}`} />
    <div className={`absolute bottom-0 right-1/4 w-[400px] h-[400px] blur-[100px] rounded-full opacity-20 transition-colors duration-1000 ${isDark ? "bg-purple-900" : "bg-indigo-300"}`} />
  </div>
));

const BookingPage_Spark = () => {
  const { isDark, toggleTheme } = useThemeStore();
  const [iframeLoading, setIframeLoading] = useState(true);
  const navigate = useNavigate();
  const widgetRef = useRef(null);

  const ZOHO_SRC = "https://groundzero2.zohobookings.in/portal-embed#/406562000000051598";

  /* -------------------------------------------------
     READING-WINDOW AUTO-SCROLL
     Clock starts only after the component mounts on screen.
  ------------------------------------------------- */
  useEffect(() => {
    const scrollTimer = setTimeout(() => {
      if (widgetRef.current) {
        gsap.to(window, {
          duration: 1.6,
          ease: "power3.inOut",
          scrollTo: {
            y: widgetRef.current,
            offsetY: 70,
          },
        });
      }
    }, 4000); // 4-Second Reading Window

    return () => clearTimeout(scrollTimer);
  }, []);

  // 3. MEMOIZED STYLES
  const themeStyles = useMemo(() => ({
    sectionHeader: `text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-2 ${isDark ? "text-cyan-300" : "text-cyan-800"}`,
    bodyText: `text-sm font-medium leading-snug ${isDark ? "text-gray-300" : "text-slate-600"}`,
    cardBase: `rounded-2xl border shadow-xl p-5 flex flex-col gap-2 transition-all duration-500 ${isDark ? "bg-[#13141F]/80 border-white/10" : "bg-white border-slate-200 shadow-slate-200/60"}`,
  }), [isDark]);

  return (
    <div className={`min-h-screen w-full font-sans transition-colors duration-700 relative ${isDark ? "bg-[#0B0C15] text-gray-100" : "bg-slate-50 text-slate-900"}`}>

      <PageBackground isDark={isDark} />

      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 pt-4 pb-10"
        variants={CONTAINER_VARIANTS}
        initial="hidden"
        animate="visible"
      >
        {/* HEADER */}
        <motion.div variants={ITEM_VARIANTS} className="flex justify-between mb-3">
          <button
            onClick={() => navigate("/")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${isDark ? "border-white/10 text-gray-400 hover:bg-white/5" : "bg-white border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50"}`}
          >
            <ArrowLeft size={14} /> Back to Home
          </button>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full border transition-all ${isDark ? "bg-white/5 border-white/10 text-yellow-400" : "bg-white border-slate-200 text-slate-600 shadow-sm"}`}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </motion.div>

        {/* HERO SECTION */}
        <motion.div variants={ITEM_VARIANTS} className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1">
            Book Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              Discovery Session
            </span>
          </h1>
          <p className={`text-xs md:text-sm max-w-lg mx-auto ${isDark ? "text-gray-400" : "text-slate-600"}`}>
            Analyze your current standing, identify blockers, and map out your next steps.
          </p>
        </motion.div>

        {/* INFO CARDS (Content Untouched) */}
        <motion.div variants={ITEM_VARIANTS} className="mb-6 flex flex-col md:flex-row gap-4">
          <div className={`flex-1 ${themeStyles.cardBase}`}>
            <div className={themeStyles.sectionHeader}>
              <Sparkles size={16} className={isDark ? "text-cyan-400" : "text-cyan-600"} />
              What you get
            </div>
            <div className="flex flex-col gap-3 mt-1">
              {[
                "Clarity on your current academic standing",
                "Identify hidden blocks slowing your progress",
                "Honest feedback on if we are the right fit"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`mt-0.5 shrink-0 ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>
                    <CheckCircle2 size={14} />
                  </div>
                  <span className={themeStyles.bodyText}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`md:w-[40%] ${themeStyles.cardBase}`}>
            <div className={themeStyles.sectionHeader}>
              <CreditCard size={16} className={isDark ? "text-purple-400" : "text-purple-600"} />
              Session Fee: ₹200
            </div>
            <div className="flex flex-col h-full gap-3">
              <div className="flex gap-2 items-start">
                <Info size={16} className={`mt-0.5 shrink-0 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                <p className={themeStyles.bodyText}>
                  To ensure sincerity. <strong className={isDark ? "text-green-400" : "text-green-600"}>Fully adjusted</strong> if you continue, or <strong className={isDark ? "text-green-400" : "text-green-600"}>refundable</strong> on request.
                </p>
              </div>
              <div className={`mt-auto pt-3 border-t flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isDark ? "border-white/5 text-green-400" : "border-slate-100 text-green-600"}`}>
                <ShieldCheck size={12} />
                <span>Secure Booking</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ZOHO WIDGET */}
        <motion.div ref={widgetRef} variants={ITEM_VARIANTS} className="relative">
          <button
            onClick={() => navigate(-1)}
            className={`absolute -left-2 md:-left-4 top-6 z-20 p-2 rounded-full border shadow active:scale-90 transition-transform ${isDark ? "bg-[#13141F] border-white/10 text-gray-400" : "bg-white border-slate-200 text-slate-400"}`}
          >
            <ChevronLeft size={18} />
          </button>

          <div className={`w-full h-[85vh] min-h-[600px] rounded-xl border overflow-hidden shadow-2xl relative transition-all ${isDark ? "bg-[#13141F] border-white/10" : "bg-white border-slate-200"}`}>
            {iframeLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-inherit">
                <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${isDark ? "border-cyan-500" : "border-cyan-600"}`} />
              </div>
            )}
            <iframe
              src={ZOHO_SRC}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="camera; microphone"
              title="Zoho Discovery Booking"
              onLoad={() => setIframeLoading(false)}
              className={`w-full h-full transition-opacity duration-1000 ${iframeLoading ? "opacity-0" : "opacity-100"}`}
            />
          </div>
        </motion.div>

        <motion.div variants={ITEM_VARIANTS} className="mt-6 text-center text-[10px] opacity-40 font-bold uppercase tracking-widest">
          © 2026 Ground Zero · Secure booking powered by Zoho
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BookingPage_Spark;