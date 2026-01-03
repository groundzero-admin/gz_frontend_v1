import React, { useState, useRef, useEffect } from "react";
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

import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

const BookOneOnOneSession_BuilderOSs = () => {
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  const widgetRef = useRef(null);
  const hasAutoScrolled = useRef(false);
  const lastScrollY = useRef(0);

  const ZOHO_SRC =
    "https://groundzero2.zohobookings.in/portal-embed#/406562000000048052";

  const toggleTheme = () => setIsDark(!isDark);

  /* -------------------------------------------------
     GSAP AUTO SCROLL
     - Trigger on scroll DOWN from top
     - Reset when user scrolls back near top
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

  // --- SHARED STYLES ---
  const styles = {
    sectionHeader: `text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-2 ${
      isDark ? "text-white" : "text-slate-900"
    }`,
    bodyText: `text-sm font-medium leading-snug ${
      isDark ? "text-gray-300" : "text-slate-600"
    }`,
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
      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className={`absolute top-0 left-1/4 w-[500px] h-[500px] blur-[120px] rounded-full opacity-30 ${
            isDark ? "bg-indigo-600" : "bg-indigo-200"
          }`}
        />
        <div
          className={`absolute bottom-0 right-1/4 w-[400px] h-[400px] blur-[100px] rounded-full opacity-20 ${
            isDark ? "bg-blue-600" : "bg-blue-200"
          }`}
        />
      </div>

      <div className="relative z-10 max-w-5xl w-full mx-auto px-4 md:px-6 pt-4 pb-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-3">
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
        </div>

        {/* HERO */}
        <div className="text-center mb-4 space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold">
            Book Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-blue-600 to-violet-600">
              Session
            </span>
          </h1>
          <p
            className={`text-xs md:text-sm ${
              isDark ? "text-gray-400" : "text-slate-600"
            }`}
          >
            Rapid, specific acceleration and private guidance.
          </p>
        </div>

        {/* INFO CARDS */}
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <div className={`flex-1 ${styles.cardBase}`}>
            <div className={styles.sectionHeader}>
              <Zap size={16} className={isDark ? "text-indigo-400" : "text-indigo-600"} />
              What's included
            </div>
            {[
              "1:1 Live Sessions",
              "Unblocking specific hurdles",
              "Fully self-paced",
              "Lock in sessions as you need them",
            ].map((t, i) => (
              <div key={i} className="flex gap-2">
                <Check size={12} className="text-green-500 mt-1" />
                <span className={styles.bodyText}>{t}</span>
              </div>
            ))}
          </div>

          <div className={`md:w-[45%] ${styles.cardBase}`}>
            <div className={styles.sectionHeader}>
              <CreditCard size={16} className={isDark ? "text-indigo-400" : "text-indigo-600"} />
              Session Fee: ₹3,000
            </div>
            {[
              "Pay per session model",
              "Book only what you need",
              "Total flexibility, no lock-ins",
            ].map((t, i) => (
              <div key={i} className="flex gap-2">
                <Check size={12} className="text-green-500 mt-1" />
                <span className={styles.bodyText}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ZOHO WIDGET */}
        <div ref={widgetRef} className="relative">
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
              title="Zoho 1:1 Session"
              className="w-full h-full"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div
          className={`mt-2 text-center text-[10px] opacity-40 ${
            isDark ? "text-gray-500" : "text-slate-400"
          }`}
        >
          © 2025 Ground Zero · Secure booking
        </div>
      </div>
    </div>
  );
};

export default BookOneOnOneSession_BuilderOSs;
