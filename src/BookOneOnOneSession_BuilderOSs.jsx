import React, { useState, useEffect, useRef, memo, useMemo } from "react";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Sun,
  Moon,
  Zap,
  ChevronLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import useThemeStore from "./store/useThemeStore";

gsap.registerPlugin(ScrollToPlugin);

// 1. HOISTED CONSTANTS
const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const PageBackground = memo(({ isDark }) => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] blur-[110px] rounded-full opacity-30 transition-colors duration-1000 ${isDark ? "bg-indigo-900" : "bg-indigo-200"}`} />
    <div className={`absolute bottom-0 right-1/4 w-[400px] h-[400px] blur-[110px] rounded-full opacity-20 transition-colors duration-1000 ${isDark ? "bg-blue-900" : "bg-blue-200"}`} />
  </div>
));

const BookOneOnOneSession_BuilderOSs = () => {
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const widgetRef = useRef(null);

  const ZOHO_SRC = "https://groundzero2.zohobookings.in/portal-embed#/406562000000048026";

  useEffect(() => {
    const scrollTimer = setTimeout(() => {
      if (widgetRef.current) {
        gsap.to(window, {
          duration: 1.5,
          ease: "power3.inOut",
          scrollTo: { y: widgetRef.current, offsetY: 70 },
        });
      }
    }, 4000);
    return () => clearTimeout(scrollTimer);
  }, []);

  const themeStyles = useMemo(() => ({
    sectionHeader: `text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-3 ${isDark ? "text-white" : "text-slate-900"}`,
    bodyText: `text-sm font-medium leading-snug ${isDark ? "text-gray-300" : "text-slate-600"}`,
    cardBase: `flex-1 rounded-2xl border shadow-xl transition-all p-6 flex flex-col gap-3 ${isDark ? "bg-[#13141F]/80 border-white/10" : "bg-white border-slate-200 shadow-slate-200/60"}`,
  }), [isDark]);

  return (
    <div className={`min-h-screen w-full font-sans transition-colors duration-700 relative ${isDark ? "bg-[#0B0C15] text-gray-100" : "bg-slate-50 text-slate-900"}`}>
      <PageBackground isDark={isDark} />

      <motion.div
        className="relative z-10 max-w-5xl w-full mx-auto px-4 md:px-6 pt-4 pb-6"
        variants={CONTAINER_VARIANTS}
        initial="hidden"
        animate="visible"
      >
        {/* HEADER */}
        <motion.div variants={ITEM_VARIANTS} className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/builderos")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${isDark ? "border-white/10 text-gray-400 hover:bg-white/5" : "bg-white border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50"}`}
          >
            <ArrowLeft size={14} /> Back to BuilderOs
          </button>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full border transition-all ${isDark ? "bg-white/5 border-white/10 text-yellow-400" : "bg-white border-slate-200 text-slate-600 shadow-sm"}`}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </motion.div>

        {/* HERO */}
        <motion.div variants={ITEM_VARIANTS} className="text-center mb-8 space-y-2">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Book Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-blue-600 to-violet-600">1:1 Session</span>
          </h1>
          <p className={`text-xs md:text-sm max-w-md mx-auto ${isDark ? "text-gray-400" : "text-slate-600"}`}>
            For individuals who want rapid, specific acceleration and focused unblocking.
          </p>
        </motion.div>

        {/* SYMMETRICAL INFO CARDS */}
        <motion.div variants={ITEM_VARIANTS} className="mb-8 flex flex-col md:flex-row gap-5 items-stretch">
          {/* Card 1 */}
          <div className={themeStyles.cardBase}>
            <div className={themeStyles.sectionHeader}>
              <Zap size={16} className={isDark ? "text-indigo-400" : "text-indigo-600"} />
              What's included
            </div>
            <div className="space-y-3">
              {[
                "1:1 Live Sessions",
                "Unblocking specific hurdles",
                "Fully self-paced",
                "Lock in sessions as you need them",
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check size={14} className="text-green-500 mt-0.5 shrink-0" strokeWidth={3} />
                  <span className={themeStyles.bodyText}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2 */}
          <div className={themeStyles.cardBase}>
            <div className={themeStyles.sectionHeader}>
              <CreditCard size={16} className={isDark ? "text-indigo-400" : "text-indigo-600"} />
              Session Fee: ₹3,000
            </div>
            <div className="space-y-3">
              {[
                "Pay per session model",
                "Book only what you need",
                "Total flexibility, no lock-ins",
                "Direct acceleration focus"
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check size={14} className="text-green-500 mt-0.5 shrink-0" strokeWidth={3} />
                  <span className={themeStyles.bodyText}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ZOHO WIDGET */}
        <motion.div ref={widgetRef} variants={ITEM_VARIANTS} className="relative">
          <button
            onClick={() => navigate(-1)}
            className={`absolute -left-2 md:-left-4 top-6 z-20 p-2 rounded-full border shadow active:scale-90 transition-transform ${isDark ? "bg-[#13141F] border-white/10" : "bg-white border-slate-200"}`}
          >
            <ChevronLeft size={18} />
          </button>

          <div className={`w-full h-[85vh] min-h-[600px] rounded-2xl border overflow-hidden shadow-2xl relative transition-all ${isDark ? "bg-[#13141F] border-white/10" : "bg-white border-slate-200"}`}>
            <iframe
              src={ZOHO_SRC}
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              title="Zoho 1:1 Session"
              className="w-full h-full"
            />
          </div>
        </motion.div>

        <motion.div variants={ITEM_VARIANTS} className="mt-8 text-center text-[10px] opacity-40 font-bold uppercase tracking-widest">
          © 2026 Ground Zero · Secure booking
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BookOneOnOneSession_BuilderOSs;