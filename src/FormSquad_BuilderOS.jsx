import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Sun,
  Moon,
  Users,
  Info,
  ChevronLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

const FormSquad_BuilderOS = () => {
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  const widgetRef = useRef(null);
  const hasAutoScrolled = useRef(false);
  const lastScrollY = useRef(0);

  const ZOHO_SRC =
    "https://groundzero1.zohobookings.in/portal-embed#/406542000000040340";

  const toggleTheme = () => setIsDark(!isDark);

  /* -------------------------------------------------
     GSAP AUTO SCROLL
     - Trigger on scroll DOWN from top
     - Reset when user comes back near top
  ------------------------------------------------- */
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const scrollingDown = currentY > lastScrollY.current;
      lastScrollY.current = currentY;

      // Reset when user is near top again
      if (currentY < 40) {
        hasAutoScrolled.current = false;
        return;
      }

      if (
        scrollingDown &&
        !hasAutoScrolled.current &&
        widgetRef.current
      ) {
        hasAutoScrolled.current = true;

        gsap.to(window, {
          duration: 1.1,
          ease: "power3.out",
          scrollTo: {
            y: widgetRef.current,
            offsetY:
              window.innerHeight / 2 -
              widgetRef.current.offsetHeight / 2,
          },
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- ANIMATION VARIANTS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  // --- SHARED STYLES ---
  const styles = {
    sectionHeader: `text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-2 ${
      isDark ? "text-white" : "text-slate-900"
    }`,
    bodyText: `text-sm font-medium leading-snug ${
      isDark ? "text-gray-300" : "text-slate-600"
    }`,
    iconColor: isDark ? "text-blue-400" : "text-blue-600",
    cardBase: `rounded-2xl border shadow-xl transition-all p-5 flex flex-col justify-center gap-2
      ${
        isDark
          ? "bg-[#13141F]/80 border-white/10"
          : "bg-white border-slate-200 shadow-slate-200/60"
      }`,
  };

  return (
    <div
      className={`min-h-screen w-full font-sans transition-colors duration-500
        ${isDark ? "bg-[#0B0C15] text-gray-100" : "bg-slate-50 text-slate-900"}
      `}
    >
      {/* BACKGROUND GLOWS */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className={`absolute top-0 left-1/4 w-[500px] h-[500px] blur-[120px] rounded-full opacity-30 ${
            isDark ? "bg-blue-600" : "bg-blue-200"
          }`}
        />
        <div
          className={`absolute bottom-0 right-1/4 w-[400px] h-[400px] blur-[100px] rounded-full opacity-20 ${
            isDark ? "bg-cyan-600" : "bg-cyan-200"
          }`}
        />
      </div>

      <motion.div
        className="relative z-10 max-w-5xl w-full mx-auto px-4 md:px-6 pt-4 pb-2 flex flex-col"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* HEADER */}
        <motion.div variants={itemVariants} className="flex justify-between mb-2">
          <button
            onClick={() => navigate("/")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border
              ${isDark
                ? "border-white/10 text-gray-400"
                : "bg-white border-slate-200 text-slate-600 shadow-sm"
              }`}
          >
            <ArrowLeft size={14} />
            Back to Home
          </button>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full border
              ${isDark
                ? "bg-white/5 border-white/10 text-yellow-400"
                : "bg-white border-slate-200 text-slate-600 shadow-sm"
              }`}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </motion.div>

        {/* HERO */}
        <motion.div variants={itemVariants} className="text-center mb-4">
          <h1 className="text-2xl md:text-3xl font-extrabold">
            Form a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600">
              Squad
            </span>
          </h1>
          <p
            className={`text-xs md:text-sm ${
              isDark ? "text-gray-400" : "text-slate-600"
            }`}
          >
            Bring your people together and begin your journey as a team.
          </p>
        </motion.div>

        {/* INFO CARDS */}
        <motion.div variants={itemVariants} className="mb-4 flex flex-col md:flex-row gap-4">
          <div className={`flex-1 ${styles.cardBase}`}>
            <div className={styles.sectionHeader}>
              <Users size={16} className={styles.iconColor} />
              What This Squad Session Will Do
            </div>
            {[
              "Help your group come together with clarity",
              "Guide you on forming a proper squad",
              "Align the squad on how you move together",
            ].map((t, i) => (
              <div key={i} className="flex gap-2">
                <Check size={12} className="text-green-500 mt-1" />
                <span className={styles.bodyText}>{t}</span>
              </div>
            ))}
          </div>

          <div className={`md:w-[40%] ${styles.cardBase}`}>
            <div className={styles.sectionHeader}>
              <CreditCard size={16} className={styles.iconColor} />
              Session Fee: ₹200
            </div>
            <div className="flex gap-2">
              <Info size={14} className="text-blue-500 mt-1" />
              <p className={styles.bodyText}>
                Fully adjusted or refundable on request.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ZOHO WIDGET */}
        <motion.div
          ref={widgetRef}
          variants={itemVariants}
          className="relative"
        >
          <button
            onClick={() => navigate(-1)}
            className={`absolute -left-3 top-6 z-20 p-2 rounded-full border shadow
              ${isDark
                ? "bg-[#13141F] border-white/10"
                : "bg-white border-slate-200"
              }`}
          >
            <ChevronLeft size={18} />
          </button>

          {/* ⭐ 90% VIEWPORT HEIGHT */}
          <div
            className={`w-full h-[90vh] min-h-[600px] rounded-xl border overflow-hidden shadow-xl
              ${isDark
                ? "bg-[#13141F] border-white/10"
                : "bg-white border-slate-200"
              }`}
          >
            <iframe
              src={ZOHO_SRC}
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              title="Zoho Squad Session"
              className="w-full h-full"
            />
          </div>
        </motion.div>

        {/* FOOTER */}
        <motion.div
          variants={itemVariants}
          className={`mt-2 text-center text-[10px] opacity-40 ${
            isDark ? "text-gray-500" : "text-slate-400"
          }`}
        >
          © 2025 Ground Zero · Secure booking powered by Zoho
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FormSquad_BuilderOS;
