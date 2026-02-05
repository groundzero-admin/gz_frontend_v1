import React, { useState, useEffect, memo } from 'react';
import { Rocket, Compass, BookOpen, Linkedin, Twitter, Check, Sun, Moon, X, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useThemeStore from './store/useThemeStore';

import logoFullBlack from './Logo/gz_logo_with_name_black.png';
import logoFullWhite from './Logo/gz_logo_with_name_white.png';

import { Helmet } from "react-helmet-async";





const globalStyles = `
  html { scroll-behavior: smooth; }
`;

// --- ANIMATIONS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

// --- OPTIMIZED BACKGROUND: GRADIENTS INSTEAD OF BLURS ---
// This renders instantly because it's just a background-image, not a heavy filter.
const BackgroundOrbs = memo(({ isDark }) => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0">
    <div
      className="absolute inset-0 w-full h-full transition-colors duration-500"
      style={{
        background: isDark
          ? `
             radial-gradient(circle at 15% 15%, rgba(6,182,212, 0.15) 0%, transparent 40%),
             radial-gradient(circle at 85% 85%, rgba(37,99,235, 0.15) 0%, transparent 40%),
             radial-gradient(circle at 50% 50%, rgba(168,85,247, 0.05) 0%, transparent 60%)
             `
          : `
             radial-gradient(circle at 15% 15%, rgba(34,211,238, 0.4) 0%, transparent 40%),
             radial-gradient(circle at 85% 85%, rgba(96,165,250, 0.4) 0%, transparent 40%),
             radial-gradient(circle at 50% 50%, rgba(192,132,252, 0.15) 0%, transparent 60%)
             `,
        backgroundColor: isDark ? '#0B0C15' : '#f8fafc' // Base color
      }}
    />
  </div>
));

// --- MEMOIZED COMPONENTS ---
const FlipWords = memo(({ isDark }) => {
  const words = ["think", "build", "learn"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-block h-[1.2em] overflow-hidden align-bottom relative w-[130px] md:w-[150px] text-left mx-2">
      {words.map((word, i) => (
        <span
          key={i}
          className={`absolute top-0 left-5 block w-full transition-all duration-700 ease-in-out transform ${i === index ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
        >
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isDark ? 'from-cyan-200 to-cyan-500' : 'from-cyan-600 to-blue-800'
            }`}>
            {word}
          </span>
        </span>
      ))}
      <span className="invisible font-bold">scale</span>
    </div>
  );
});

const HeroHeading = memo(({ isDark }) => {
  const phrases = [
    { first: "think", second: "build" },
    { first: "think better", second: "build better" },
  ];
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % phrases.length);
        setFade(true);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const gradientClass = isDark
    ? "bg-gradient-to-r from-cyan-200 to-cyan-400"
    : "bg-gradient-to-r from-cyan-600 to-blue-800";

  return (
    <h1 className={`text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] max-w-5xl mx-auto z-10 min-h-[3em] md:min-h-[2.5em] transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      We help you{' '}
      <span className={`inline-block transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
        <span className={`text-transparent bg-clip-text ${gradientClass}`}>
          {phrases[index].first}
        </span>
      </span>
      <br />
      and{' '}
      <span className={`inline-block transition-opacity duration-500 delay-100 ${fade ? 'opacity-100' : 'opacity-0'}`}>
        <span className={`text-transparent bg-clip-text ${gradientClass}`}>
          {phrases[index].second}
        </span>
      </span>{' '}
      with AI
    </h1>
  );
});

const FormModal = ({ isOpen, onClose, url, title, isDark }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) setIsLoading(true);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/80 cursor-pointer" />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`relative w-full max-w-3xl h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col ${isDark ? 'bg-[#13141F] border border-gray-800' : 'bg-white border border-gray-200'}`}
      >
        <div className={`flex justify-between items-center p-4 border-b ${isDark ? 'border-gray-800 bg-[#13141F]' : 'border-gray-100 bg-white'}`}>
          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100/10">
            <X size={20} className={isDark ? "text-white" : "text-black"} />
          </button>
        </div>
        <div className={`flex-1 relative ${isDark ? 'bg-black' : 'bg-white'}`}>
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <Loader2 className={`w-10 h-10 animate-spin mb-3 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Loading form...</p>
            </div>
          )}
          <iframe
            src={url}
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            className={`w-full h-full border-0 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            title="Form"
            style={{
              filter: isDark ? 'invert(1) hue-rotate(180deg) contrast(0.9)' : 'none',
              backgroundColor: isDark ? 'black' : 'white'
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

const LandingPageMain = () => {
  const { isDark, toggleTheme } = useThemeStore();
  const [activeModal, setActiveModal] = useState(null);
  const navigate = useNavigate();

  const handleScroll = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openWaitlist = (e) => { e.preventDefault(); setActiveModal('waitlist'); };
  const openWebinar = (e) => { e.preventDefault(); setActiveModal('webinar'); };
  const closeModal = () => setActiveModal(null);

  // --- STYLES: OPTIMIZED TRANSPARENCY ---
  // We use slightly transparent backgrounds (e.g., bg-white/90) 
  // This lets the background gradients shine through without needing backdrop-blur.
  const styles = {
    // We let BackgroundOrbs handle the main background color/gradient
    bg: "bg-transparent",

    text: isDark ? "text-gray-100" : "text-slate-900",
    subtext: isDark ? "text-gray-400" : "text-slate-600",

    // Navbar: 90% Opacity (No blur)
    navbar: isDark
      ? "bg-[#13141F]/90 border-gray-800 shadow-md"
      : "bg-white/90 border-gray-200 shadow-sm",
    navText: isDark ? "text-gray-300 hover:text-cyan-400" : "text-slate-600 hover:text-cyan-600",

    // Cards: 90% Opacity (No blur) - This creates a subtle "Glass" feel because you can see the color behind it
    card: isDark
      ? "bg-[#13141F]/90 border-gray-800"
      : "bg-white/90 border-gray-200 shadow-sm",

    cardHoverEffect: isDark
      ? "hover:border-cyan-500 transition-colors"
      : "hover:border-cyan-500 hover:shadow-md transition-all",

    iconBg: isDark ? "bg-slate-800" : "bg-slate-100",

    quoteBg: isDark
      ? "bg-[#13141F]/90 border-gray-800"
      : "bg-white/90 border-gray-200 shadow-md",

    footer: isDark
      ? "bg-[#0B0C15]/95 border-gray-800"
      : "bg-slate-50/95 border-gray-200",
    divider: isDark ? "border-gray-800" : "border-gray-200",
  };

  return (
    <>


      <Helmet>
        {/* Primary */}
        <title>Ground Zero — Think Better, Build Better with AI</title>
        <meta
          name="description"
          content="Ground Zero helps founders, builders, learners, and parents think better and build better with AI through structured programs, mentorship, and systems thinking."
        />
        <link rel="canonical" href="https://www.groundzero.world/" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Ground Zero — Think Better, Build Better with AI" />
        <meta
          property="og:description"
          content="Structured AI-first learning and mentorship for modern thinkers and builders."
        />
        <meta property="og:url" content="https://www.groundzero.world/" />
        <meta
          property="og:image"
          content="https://www.groundzero.world/assets/gz_logo_with_name_black-72a6nTtR.png"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ground Zero — Think Better, Build Better with AI" />
        <meta
          name="twitter:description"
          content="Learn how to think, build, and grow in the age of AI."
        />
        <meta
          name="twitter:image"
          content="https://www.groundzero.world/assets/gz_logo_with_name_black-72a6nTtR.png"
        />

        {/* Indexing */}
        <meta name="robots" content="index, follow" />
      </Helmet>




      <div className={`min-h-screen font-sans selection:bg-cyan-500/50 selection:text-white relative transition-colors duration-300 ${styles.bg} ${styles.text}`}>
        <style>{globalStyles}</style>

        {/* The Gradients sit here, behind everything */}
        <BackgroundOrbs isDark={isDark} />

        <div className="relative z-10">

          {/* ================= NAVBAR ================= */}
          <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pt-6 px-4"
          >
            <div className={`border rounded-[5px] px-6 py-3 flex items-center justify-between w-full max-w-5xl transition-colors duration-300 ${styles.navbar}`}>
              <div className="flex items-center">
                <img
                  src={isDark ? logoFullWhite : logoFullBlack}
                  alt="Ground Zero"
                  className="h-[20px] w-auto object-contain select-none"
                />
              </div>

              <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                {['What We Do', "Who It's For", 'Programs', 'About'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/ /g, '-').replace(/'/g, '')}`}
                    onClick={(e) => handleScroll(e, item.toLowerCase().replace(/ /g, '-').replace(/'/g, ''))}
                    className={`transition-colors cursor-pointer ${styles.navText}`}
                  >
                    {item}
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-full transition-colors duration-300 ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  aria-label="Toggle Theme"
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <button
                  onClick={() => navigate('/book-discovery-call-builderos')}
                  className={`border text-xs md:text-sm font-bold px-5 py-2 rounded-[5px] transition-all duration-300 ${isDark ? 'bg-slate-800 hover:bg-cyan-500 hover:text-black border-cyan-500/30 text-cyan-400' : 'bg-slate-900 text-white hover:bg-cyan-600 border-transparent'}`}
                >
                  Book a Call
                </button>
              </div>
            </div>
          </motion.nav>

          {/* ================= HERO SECTION ================= */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="relative pt-44 pb-24 px-4 flex flex-col items-center justify-center text-center min-h-[85vh]"
          >
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => navigate('/')}
              className={`
              mb-8 px-5 py-2 rounded-full text-sm font-semibold border flex items-center gap-2 transition-transform hover:scale-105 z-10
              ${isDark
                  ? 'bg-[#1A1033] border-purple-900 text-purple-300'
                  : 'bg-white border-purple-200 text-purple-700 shadow-sm'
                }
            `}
            >
              <Sparkles size={16} className={isDark ? "text-purple-400" : "text-purple-600"} />
              Make your kid's future ready
              <ArrowRight size={16} className={`${isDark ? "text-purple-400" : "text-purple-600"} ml-1`} />
            </motion.button>

            <HeroHeading isDark={isDark} />

            <motion.p variants={fadeInUp} className={`mt-8 text-lg md:text-xl max-w-3xl mx-auto z-10 font-medium leading-relaxed transition-colors duration-300 ${styles.subtext}`}>
              Self-paced guidance and assistance to help you realise your goals in the age of intelligence.
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-10 flex flex-col sm:flex-row gap-5 z-10">
              <button
                onClick={() => navigate('/book-discovery-call-builderos')}
                className={`font-bold px-8 py-3.5 rounded-lg transition-transform hover:scale-105 ${isDark ? 'bg-gradient-to-r from-[#8EE6F6] to-[#6DD5E8] text-black' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg'}`}
              >
                Book a Discovery Call
              </button>
              <button
                onClick={(e) => handleScroll(e, 'programs')}
                className={`font-bold px-8 py-3.5 rounded-lg transition-transform cursor-pointer border ${isDark ? 'bg-[#13141F]/80 border-gray-600 hover:border-cyan-400 hover:text-cyan-400 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-cyan-600 hover:text-cyan-600'}`}
              >
                Explore Programs
              </button>
            </motion.div>
          </motion.section>

          {/* ================= WHAT WE DO ================= */}
          <motion.section
            id="what-we-do"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="pt-32 pb-24 text-center relative z-10 scroll-mt-20"
          >
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>What we do?</h2>

            <div className={`text-3xl md:text-5xl font-bold flex flex-wrap items-center justify-center gap-y-3 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-slate-400'}`}>
              <span>We help you</span>
              <FlipWords isDark={isDark} />
              <span>better with AI.</span>
            </div>
          </motion.section>

          {/* ================= TARGET AUDIENCE ================= */}
          <section id="who-its-for" className="py-20 px-4 max-w-7xl mx-auto scroll-mt-20">
            <motion.h2
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-center mb-16"
            >
              People who find us most helpful
            </motion.h2>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                { Icon: Rocket, title: "Founders", desc: "We help you cut through the chaos- clarify priorities, structure your to-dos, plan actionable next steps, and stay accountable at a cadence that works for you." },
                { Icon: Compass, title: "Explorers & Builders", desc: "Whether you're breaking into a new domain or figuring out what to build next, we help you narrow your direction, break down problems, get early answers fast, and learn to build effectively with AI." },
                { Icon: BookOpen, title: "Learners", desc: "For anyone wanting to master AI-powered building and sharpen the core thinking pillars - creativity, critical thinking, systems thinking, and communication." }
              ].map((card, idx) => (
                <motion.div variants={fadeInUp} key={idx} className={`border rounded-2xl p-8 text-center transition-transform duration-300 group hover:-translate-y-1 ${styles.card} ${styles.cardHoverEffect}`}>
                  <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-6 transition-transform shadow-sm ${styles.iconBg} ${isDark ? 'group-hover:text-cyan-300' : 'text-slate-700 group-hover:text-cyan-600'} group-hover:scale-110`}>
                    <card.Icon size={28} />
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white group-hover:text-cyan-100' : 'text-slate-900 group-hover:text-cyan-700'}`}>{card.title}</h3>
                  <p className={`text-[15px] leading-relaxed font-medium ${styles.subtext}`}>{card.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* ================= PROGRAMS ================= */}
          <section id="programs" className="py-20 px-4 max-w-7xl mx-auto scroll-mt-20">
            <div className="text-center mb-16">
              <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4">Our Programs</motion.h2>
              <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className={`text-lg font-medium max-w-2xl mx-auto ${styles.subtext}`}>Choose the format that fits your learning style, timeline, and goals.</motion.p>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
            >
              {/* Solo Card */}
              <motion.div variants={fadeInUp} className={`border rounded-2xl p-7 flex flex-col h-full transition-transform duration-300 hover:-translate-y-1 ${styles.card} ${styles.cardHoverEffect}`}>
                <h3 className="text-2xl font-bold mb-1">Solo</h3>
                <p className={`text-xs font-bold mb-4 uppercase tracking-wider ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>Personalised Sessions</p>
                <p className={`text-sm mb-6 leading-relaxed font-medium ${styles.subtext}`}>For individuals who want rapid, specific acceleration and private guidance.</p>
                <div className={`mb-6 p-4 rounded-xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-slate-50 border-slate-100'}`}>
                  <span className="text-3xl font-bold">₹3,000</span>
                  <span className={`text-xs font-semibold ml-2 ${styles.subtext}`}>/ Session</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {["1:1 Live Sessions", "Unblocking specific hurdles", "Fully Self-paced", "Lock in sessions as you need them"].map((item, i) => (
                    <li key={i} className={`flex items-start gap-3 text-[15px] font-medium ${styles.subtext}`}>
                      <Check size={18} className={`${isDark ? 'text-cyan-400' : 'text-cyan-600'} mt-1 shrink-0`} /> {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/book-one-on-one-session-builderos')}
                  className={`w-full font-bold py-3 rounded-lg transition-transform hover:scale-[1.02] ${isDark ? 'bg-gradient-to-r from-[#8EE6F6] to-[#6DD5E8] text-black' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md'}`}
                >
                  Book your session
                </button>
              </motion.div>

              {/* Squad Card */}
              <motion.div variants={fadeInUp} className={`border rounded-2xl p-7 flex flex-col h-full transition-transform duration-300 hover:-translate-y-1 ${styles.card} ${isDark ? 'hover:border-blue-400' : 'hover:border-blue-400 hover:shadow-lg'}`}>
                <h3 className="text-2xl font-bold mb-1">Squad</h3>
                <p className={`text-xs font-bold mb-4 uppercase tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Group Sessions</p>
                <p className={`text-sm mb-6 leading-relaxed font-medium ${styles.subtext}`}>For peers who want to learn and build together using AI in a cohort.</p>
                <div className={`mb-6 p-4 rounded-xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-slate-50 border-slate-100'}`}>
                  <span className="text-3xl font-bold">₹1,500</span>
                  <span className={`text-xs font-semibold ml-2 ${styles.subtext}`}>/ Person / Session</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {["Small Group format", "Collaborative environment", "Peer feedback loops", "Group accountability"].map((item, i) => (
                    <li key={i} className={`flex items-start gap-3 text-[15px] font-medium ${styles.subtext}`}>
                      <Check size={18} className={`${isDark ? 'text-blue-400' : 'text-blue-600'} mt-1 shrink-0`} /> {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <p className={`text-xs text-center mb-3 font-semibold ${styles.subtext}`}>
                    Flying solo? <button onClick={openWaitlist} className={`underline ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>Join the waitlist</button>
                  </p>
                  <button
                    onClick={() => navigate('/form-a-squad-builderos')}
                    className={`w-full border-2 font-bold py-3 rounded-lg transition-transform hover:scale-[1.02] ${isDark ? 'bg-slate-800 border-blue-500 text-blue-300 hover:bg-blue-500 hover:text-white' : 'bg-white border-blue-600 text-blue-700 hover:bg-blue-50'}`}
                  >
                    Form a Squad
                  </button>
                </div>
              </motion.div>

              {/* Sync Card */}
              <motion.div variants={fadeInUp} className={`border rounded-2xl p-7 flex flex-col h-full transition-transform duration-300 hover:-translate-y-1 ${styles.card} ${styles.cardHoverEffect} relative overflow-hidden`}>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1">Sync</h3>
                  <p className={`text-xs font-bold mb-4 uppercase tracking-wider ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>Find out if it's for you</p>
                  <p className={`text-sm mb-6 leading-relaxed font-medium ${styles.subtext}`}>
                    Start with a conversation. We'll explore your goals and determine if this approach is right for you.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {["Interactive Session", "Live Q&A", "Actionable insights"].map((item, i) => (
                      <li key={i} className={`flex items-start gap-3 text-[15px] font-medium ${styles.subtext}`}>
                        <Check size={18} className={`${isDark ? 'text-cyan-400' : 'text-cyan-600'} mt-1 shrink-0`} /> {item}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate('/book-discovery-call-builderos')}
                    className={`w-full border font-bold py-3 rounded-lg transition-transform hover:scale-[1.02] ${isDark ? 'bg-slate-800 hover:bg-cyan-900 hover:text-cyan-300 border-cyan-500/30 text-white' : 'bg-slate-50 hover:bg-white text-slate-900 border-slate-300 hover:border-cyan-600 hover:text-cyan-700'}`}
                  >
                    Book a Discovery Call
                  </button>
                </div>

                <div className={`mt-auto pt-6 border-t ${styles.divider} z-10`}>
                  <p className={`text-base mb-3 font-semibold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>Curious about building in the age of AI?</p>
                  <div className="flex items-center justify-between">
                    <button onClick={openWebinar} className={`text-sm font-bold hover:underline flex items-center gap-1 transition-colors ${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-700 hover:text-cyan-900'}`}>
                      Join our next webinar <span aria-hidden="true">&rarr;</span>
                    </button>
                    <span className={`border text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${isDark ? 'bg-cyan-900/30 border-cyan-500/30 text-cyan-300' : 'bg-cyan-100 border-cyan-200 text-cyan-800'}`}>Free</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </section>

          {/* ================= PURPOSE & FOUNDER ================= */}
          <section id="about" className="py-20 px-4 max-w-6xl mx-auto scroll-mt-20">
            <div className="text-center mb-16">
              <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-3xl md:text-4xl font-bold">Our Purpose</motion.h2>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 gap-8"
            >
              {/* Quote Card */}
              <motion.div variants={fadeInUp} className={`rounded-2xl p-10 md:p-12 relative overflow-hidden transition-colors duration-300 ${styles.quoteBg}`}>
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent to-transparent opacity-50 ${isDark ? 'via-cyan-500/50' : 'via-cyan-500'}`}></div>
                <div className={`text-7xl absolute top-6 left-6 font-serif leading-none select-none ${isDark ? 'text-slate-800' : 'text-slate-200'}`}>"</div>
                <p className={`text-lg md:text-xl leading-relaxed relative z-10 font-medium ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>
                  Whether you want to build a company, accelerate your career or simply navigate a noisy world with clarity, <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>you need a system.</span>
                  <br /><br />
                  Ground Zero helps you build your own system and helps you stick to it! while integrating a set of meta skills that act as a lever for everything else you do.
                </p>
                <div className={`text-7xl absolute bottom-6 right-10 font-serif leading-none select-none font-medium ${isDark ? 'text-slate-800' : 'text-slate-200'}`}>"</div>
              </motion.div>

              {/* Founder Profile */}
              <motion.div variants={fadeInUp} className={`border rounded-2xl p-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-sm transition-all ${isDark ? 'bg-[#13141F]/90 border-gray-800' : 'bg-white/90 border-slate-200 hover:border-cyan-400 hover:shadow-md'}`}>
                <div className="flex-shrink-0 relative group">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-extrabold border-2 relative z-10 ${isDark ? 'bg-slate-800 text-cyan-200 border-cyan-500/40' : 'bg-slate-50 text-cyan-600 border-cyan-200'}`}>
                    SS
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Shivangi Srivastava</h3>
                  <p className={`text-sm font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>Founder, Ground Zero</p>
                  <p className={`text-lg leading-relaxed mb-6 font-medium ${styles.subtext}`}>
                    A learner at heart, working to create learning and building spaces that can foster curiosity, creativity and agency.
                  </p>
                  <div className={`text-sm space-y-2 border-t pt-4 font-medium ${styles.subtext} ${styles.divider}`}>
                    <p>Building tech and consumer business for 10+ years | Ex AVP New Initiatives, Swiggy | Ex CTO and Co-Founder at Tazzo | BTech (CSE) IIT Guwahati</p>
                  </div>
                  <div className="flex gap-4 mt-5 justify-center md:justify-start">
                    <a href="https://x.com/shivangi_sriv" target="_blank" rel="noopener noreferrer" className={`p-2.5 rounded-xl transition-all shadow-sm ${isDark ? 'bg-slate-800 hover:text-cyan-400' : 'bg-slate-100 hover:text-cyan-600'}`}>
                      <Twitter size={18} className={`${isDark ? 'text-gray-400' : 'text-slate-400'} hover:text-current`} />
                    </a>
                    <a href="https://www.linkedin.com/in/shivangi-srivastava-36bb1323/" target="_blank" rel="noopener noreferrer" className={`p-2.5 rounded-xl transition-all shadow-sm ${isDark ? 'bg-slate-800 hover:text-blue-400' : 'bg-slate-100 hover:text-blue-600'}`}>
                      <Linkedin size={18} className={`${isDark ? 'text-gray-400' : 'text-slate-400'} hover:text-current`} />
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </section>

          {/* ================= FOOTER ================= */}
          <footer className={`py-24 px-4 text-center border-t relative z-10 transition-colors duration-300 ${styles.footer}`}>
            <motion.h2
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className={`text-2xl md:text-3xl font-bold mb-8 max-w-3xl mx-auto leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              Find out whether this is the <span className={`${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>small shift</span> that changes everything.
            </motion.h2>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="flex flex-col sm:flex-row justify-center gap-5 mb-16"
            >
              <button
                onClick={() => navigate('/book-discovery-call-builderos')}
                className={`font-bold px-8 py-3.5 rounded-lg transition-transform hover:scale-105 shadow-md ${isDark ? 'bg-gradient-to-r from-[#8EE6F6] to-[#6DD5E8] text-black' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              >
                Book a discovery session
              </button>
              <button
                onClick={openWebinar}
                className={`border-2 font-bold px-8 py-3.5 rounded-lg transition-transform hover:shadow-md ${isDark ? 'bg-transparent border-gray-600 hover:border-cyan-400 text-white hover:text-cyan-400' : 'bg-white border-slate-300 text-slate-700 hover:border-cyan-600 hover:text-cyan-600'}`}
              >
                Join our next webinar
              </button>
            </motion.div>

            <div className={`flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto text-xs pt-8 border-t font-medium ${isDark ? 'text-gray-500 border-gray-800' : 'text-slate-400 border-slate-200'}`}>
              <p>© 2025 Ground Zero. All rights reserved.</p>
              <div className="flex gap-6 mt-6 md:mt-0">
                <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
              </div>
            </div>
          </footer>
        </div>

      </div>

      {/* --- Modals --- */}
      <AnimatePresence>
        {activeModal === 'waitlist' && <FormModal key="waitlist-modal" isOpen={true} onClose={closeModal} isDark={isDark} title="Join the Waitlist" url="https://docs.google.com/forms/d/1skdo6WtstPQxztiyc8xo6sa0tELuvhDuhdjbvS1PR1E/viewform?embedded=true" />}
        {activeModal === 'webinar' && <FormModal key="webinar-modal" isOpen={true} onClose={closeModal} isDark={isDark} title="Register for Webinar" url="https://docs.google.com/forms/d/1VeV7fbUFDnJkcwMNJOnDg0O1I8ibA3kMQtdSV7wy8J4/viewform?embedded=true" />}
      </AnimatePresence>
    </>
  );
};

export default LandingPageMain;