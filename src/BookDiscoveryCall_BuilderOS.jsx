import React, { useState, useEffect, useRef, memo, useMemo } from "react";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Sun,
  Moon,
  Target,
  Info,
  ChevronLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

// Static Variants (Hoisted to prevent re-renders)
const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// Optimized Background Component
const PageBackground = memo(({ isDark }) => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] blur-[100px] rounded-full opacity-20 transition-colors duration-1000 ${isDark ? "bg-cyan-900" : "bg-blue-200"}`} />
    <div className={`absolute bottom-0 right-1/4 w-[400px] h-[400px] blur-[100px] rounded-full opacity-15 transition-colors duration-1000 ${isDark ? "bg-purple-900" : "bg-indigo-200"}`} />
  </div>
));

const BookingPage_Builder_OS = () => {
  const [isDark, setIsDark] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const navigate = useNavigate();

  const widgetRef = useRef(null);
  const ZOHO_SRC = "https://groundzero2.zohobookings.in/portal-embed#/406562000000048002";

  /* -------------------------------------------------
     OPTIMIZED DELAYED AUTO-SCROLL
     Waits 4 seconds after mount, then scrolls once.
  ------------------------------------------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (widgetRef.current) {
        gsap.to(window, {
          duration: 1.5,
          ease: "power3.inOut",
          scrollTo: {
            y: widgetRef.current,
            offsetY: 70,
          },
        });
      }
    }, 4000); // 4-Second Delay

    return () => clearTimeout(timer);
  }, []);

  const styles = useMemo(() => ({
    sectionHeader: `text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-2 ${isDark ? "text-white" : "text-slate-900"}`,
    bodyText: `text-sm font-medium leading-snug ${isDark ? "text-gray-300" : "text-slate-600"}`,
    iconColor: isDark ? "text-cyan-400" : "text-cyan-600",
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
            onClick={() => navigate("/builderos")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${isDark ? "border-white/10 text-gray-400 hover:bg-white/5" : "bg-white border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50"}`}
          >
            <ArrowLeft size={14} /> Back to BuilderOs
          </button>

          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded-full border transition-all ${isDark ? "bg-white/5 border-white/10 text-yellow-400" : "bg-white border-slate-200 text-slate-600 shadow-sm"}`}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </motion.div>

        {/* HERO */}
        <motion.div variants={ITEM_VARIANTS} className="text-center mb-4">
          <h1 className="text-2xl md:text-3xl font-extrabold">
            Book Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600">
              Discovery Session
            </span>
          </h1>
          <p className={`text-xs md:text-sm ${isDark ? "text-gray-400" : "text-slate-600"}`}>
            A 30-minute clarity session designed to understand your goals.
          </p>
        </motion.div>

        {/* INFO CARDS */}
        <motion.div variants={ITEM_VARIANTS} className="mb-4 flex flex-col md:flex-row gap-4">
          <div className={styles.cardBase}>
            <div className={styles.sectionHeader}>
              <Target size={16} className={styles.iconColor} />
              What this session will do
            </div>
            {[
              "Help you gain clarity on where you currently stand",
              "Identify potential areas of work & what's blocking progress",
              "Explore how we can support you, if we're the right fit",
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className={`mt-1 shrink-0 ${isDark ? "text-green-400" : "text-green-500"}`}>
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className={styles.bodyText}>{t}</span>
              </div>
            ))}
          </div>

          <div className={`md:w-[40%] ${styles.cardBase}`}>
            <div className={styles.sectionHeader}>
              <CreditCard size={16} className={styles.iconColor} />
              Session Fee: ₹200
            </div>
            <div className="flex gap-2 items-start">
              <Info size={16} className={`mt-0.5 shrink-0 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
              <p className={styles.bodyText}>
                This small fee ensures sincerity and attendance. It's <strong className={isDark ? "text-green-400" : "text-green-600"}>fully adjusted</strong> if you continue, or <strong className={isDark ? "text-green-400" : "text-green-600"}>refundable</strong> on request.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ZOHO WIDGET */}
        <motion.div ref={widgetRef} variants={ITEM_VARIANTS} className="relative">
          <button
            onClick={() => navigate(-1)}
            className={`absolute -left-2 md:-left-4 top-6 z-20 p-2 rounded-full border shadow active:scale-90 transition-transform
              ${isDark ? "bg-[#13141F] border-white/10" : "bg-white border-slate-200"}`}
          >
            <ChevronLeft size={18} />
          </button>

          <div
            className={`w-full h-[85vh] min-h-[600px] rounded-2xl border overflow-hidden shadow-2xl transition-all
              ${isDark ? "bg-[#13141F] border-white/10" : "bg-white border-slate-200"}`}
          >
            {iframeLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-inherit">
                <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${isDark ? "border-cyan-400" : "border-blue-600"}`} />
              </div>
            )}

            <iframe
              src={ZOHO_SRC}
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              title="Zoho Booking"
              onLoad={() => setIframeLoading(false)}
              className={`w-full h-full transition-opacity duration-1000 ${iframeLoading ? "opacity-0" : "opacity-100"
                }`}
            />
          </div>
        </motion.div>

        <motion.div variants={ITEM_VARIANTS} className="mt-6 text-center text-[10px] opacity-40 tracking-widest uppercase">
          © 2026 Ground Zero · Secure booking powered by Zoho
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BookingPage_Builder_OS;