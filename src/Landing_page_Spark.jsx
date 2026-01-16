import React, { useState, useEffect, memo } from 'react';
import { 
  Rocket, Check, Sun, Moon, Lightbulb, BrainCircuit, Network, MessageCircle, 
  Heart, Cpu, Star, X, Loader2, Calendar, Video, Twitter, Linkedin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { whoami } from './api.js'; 

import logoFullBlack from './Logo/gz_logo_with_name_black.png';
import logoFullWhite from './Logo/gz_logo_with_name_white.png';

// --- Global CSS: Smooth Scroll & Text Optimization ---
const globalStyles = `
  html { scroll-behavior: smooth; }
  body { text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; }
`;

// --- Framer Motion Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 }
};

// --- OPTIMIZED BACKGROUNDS ---
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
         backgroundColor: isDark ? '#0B0C15' : '#f8fafc' 
       }}
     />
  </div>
));

const SpaceBackground = memo(({ isDark }) => {
  if (!isDark) return null;
  return (
    <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
            backgroundImage: `
                radial-gradient(1px 1px at 10% 10%, white 100%, transparent),
                radial-gradient(1px 1px at 20% 80%, white 100%, transparent),
                radial-gradient(2px 2px at 40% 40%, white 100%, transparent),
                radial-gradient(1px 1px at 70% 20%, white 100%, transparent),
                radial-gradient(1.5px 1.5px at 90% 90%, white 100%, transparent)
            `,
            backgroundSize: '100% 100%',
        }}
    />
  );
});

// --- Modal Component ---
const FormModal = ({ isOpen, onClose, url, title, isDark }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div onClick={onClose} className="absolute inset-0 bg-black/80 cursor-pointer" />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`relative w-full max-w-3xl h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col ${isDark ? 'bg-[#13141F] border border-gray-800' : 'bg-white border border-gray-200'}`}
          >
            <div className={`flex justify-between items-center p-4 border-b ${isDark ? 'border-gray-800 bg-[#13141F]' : 'border-gray-100 bg-white'}`}>
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100/10">
                <X size={20} className={isDark ? "text-white" : "text-black"} />
              </button>
            </div>
            <div className={`flex-1 relative ${isDark ? 'bg-black' : 'bg-white'}`}>
               <iframe 
                src={url} 
                loading="lazy"
                className="w-full h-full border-0" 
                title="Form"
                style={{ 
                  filter: isDark ? 'invert(1) hue-rotate(180deg) contrast(0.9)' : 'none',
                  backgroundColor: isDark ? 'black' : 'white' 
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const GroundZeroSpark = () => {
  const [isDark, setIsDark] = useState(false);
  const [isWebinarOpen, setIsWebinarOpen] = useState(false); 

  const [authState, setAuthState] = useState({
    checked: false,
    isLoggedIn: false,
    role: null,
    name: null
  });

  const navigate = useNavigate();
  const toggleTheme = () => setIsDark(!isDark);

  const handleScroll = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openWebinar = () => setIsWebinarOpen(true);
  const closeWebinar = () => setIsWebinarOpen(false);

  const handleLoginClick = () => {
    if (!authState.checked) return;
    if (authState.isLoggedIn) {
      navigate(`/${authState.role}/dashboard`);
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await whoami();
        if (res?.success && res?.data?.role) {
          setAuthState({
            checked: true,
            isLoggedIn: true,
            role: res.data.role,     
            name: res.data.name
          });
        } else {
          setAuthState({ checked: true, isLoggedIn: false, role: null, name: null });
        }
      } catch (err) {
        setAuthState({ checked: true, isLoggedIn: false, role: null, name: null });
      }
    };
    checkAuth();
  }, []);

  // --- Styles: Solid Colors & High Opacity (No Blur) ---
  const styles = {
    bg: "bg-transparent", 
    text: isDark ? "text-gray-100" : "text-slate-900",
    subtext: isDark ? "text-gray-400" : "text-slate-600",
    navbar: isDark 
      ? "bg-[#13141F]/95 border-gray-800 shadow-md" 
      : "bg-white/95 border-gray-200 shadow-sm",
    card: isDark 
      ? "bg-[#13141F]/90 border-gray-800 hover:border-cyan-500 transition-colors will-change-transform" 
      : "bg-white/90 border-gray-200 shadow-md hover:border-cyan-500/50 transition-all will-change-transform",
    uspIcon: isDark ? "bg-slate-800 text-cyan-400" : "bg-cyan-50 text-cyan-600",
    footer: isDark 
      ? "bg-[#0B0C15]/95 border-gray-800" 
      : "bg-slate-50/95 border-gray-200",
    fancyCard: isDark 
      ? "bg-[#13141F]/90 border-gray-800 hover:border-cyan-500" 
      : "bg-white/90 border-gray-200 hover:border-cyan-500 hover:shadow-lg"
  };

  const reviews = [
    { name: "Rahul K.", role: "Parent of 10-year-old", text: "The collaborative projects helped my son come out of his shell. He presented his AI project with so much confidence!" },
    { name: "Anita S.", role: "Parent of 14-year-old", text: "Ground Zero doesn't just teach AI tools - they teach how to think. That's invaluable for their future." },
    { name: "Vikram T.", role: "Parent of 11-year-old", text: "Best investment we made. Our child is now building actual projects and solving real problems!" },
    { name: "Meera R.", role: "Parent of 13-year-old", text: "The curriculum is thoughtfully designed. It balances creativity with powerful tech tools perfectly." },
    { name: "Sanya M.", role: "Parent of 12-year-old", text: "My daughter now questions AI responses instead of blindly accepting them. That's the critical thinking we needed!" },
    { name: "Arjun P.", role: "Parent of 9-year-old", text: "Finally a program that isn't just coding syntax. It's about logic, empathy, and building useful things." },
  ];
  
  return (
    <>
    <div className={`min-h-screen font-sans selection:bg-cyan-500/50 selection:text-white relative transition-colors duration-300 ${styles.bg} ${styles.text}`}>
      <style>{globalStyles}</style>
      
      {/* Optimized Backgrounds */}
      <BackgroundOrbs isDark={isDark} />
      <SpaceBackground isDark={isDark} />

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
                    alt="Ground Zero Spark"
                    className="h-[22px] md:h-[24px] w-auto object-contain select-none"
                  />
              </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              {['Curriculum', 'Programs', 'Stories', 'About'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`} 
                  onClick={(e) => handleScroll(e, item.toLowerCase())} 
                  className={`transition-colors cursor-pointer hover:text-cyan-400 ${styles.subtext}`}
                >
                  {item}
                </a>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme} 
                className={`p-2 rounded-full transition-colors ${isDark ? 'bg-gray-800 text-yellow-300' : 'bg-gray-100 text-slate-600'}`}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>

              <motion.button 
                {...hoverScale}
                onClick={handleLoginClick}
                className={`border text-xs md:text-sm font-semibold px-5 py-2 rounded-[5px] transition-all shadow-md will-change-transform
                  ${isDark 
                    ? 'bg-slate-800 text-purple-400 border-purple-500/30 hover:bg-purple-900/30' 
                    : 'bg-purple-600 text-white border-transparent hover:bg-purple-700'
                  }`}
              >
                Login
              </motion.button>

              <motion.button 
                {...hoverScale}
                onClick={() => navigate('/book-discovery-call-spark')}
                className={`hidden md:block border text-xs md:text-sm font-semibold px-5 py-2 rounded-[5px] transition-all shadow-md will-change-transform ${isDark ? 'bg-slate-800 text-cyan-400 border-cyan-500/30 hover:bg-cyan-900/30' : 'bg-slate-900 text-white border-transparent hover:bg-slate-700'}`}
              >
                Book a Call
              </motion.button>
            </div>
          </div>
        </motion.nav>

        {/* ================= HERO SECTION (Centered Layout) ================= */}
        {/* CHANGED: pt-44 -> min-h-[85vh] + flex-col justify-center. This moves text lower and keeps it centered. */}
        <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 text-center">
          
          {/* Static Gradient Blob */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[400px] h-[400px] rounded-full pointer-events-none z-0 ${isDark ? 'bg-cyan-500/10 blur-3xl' : 'bg-cyan-400/10 blur-3xl'}`} />
          
          <div className="relative z-10 max-w-6xl mx-auto pt-20">
            <motion.h1 
              variants={fadeInUp}
              initial="hidden" animate="visible"
              className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]"
            >
              Make your kids <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500">future ready</span>
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              initial="hidden" animate="visible"
              className={`text-xl md:text-2xl max-w-2xl mx-auto mb-12 font-medium ${styles.subtext}`}
            >
              Thinking skills and responsible AI, taught through real problem-solving.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              initial="hidden" animate="visible"
              className="flex flex-col sm:flex-row justify-center gap-5"
            >
              <motion.button 
                  {...hoverScale}
                  onClick={() => navigate('/book-discovery-call-spark')} 
                  className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold px-10 py-4 rounded-full transition-transform shadow-lg will-change-transform"
                >
                  Book a discovery call &rarr;
                </motion.button>
              <motion.button 
                {...hoverScale}
                onClick={(e) => handleScroll(e, 'programs')} 
                className={`border px-10 py-4 rounded-full font-semibold transition-all will-change-transform ${isDark ? 'border-gray-600 hover:border-gray-400 text-white' : 'border-slate-300 hover:bg-slate-100 text-slate-800'}`}
              >
                Explore Programs
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* ================= USP / CURRICULUM ================= */}
        <section id="curriculum" className="py-24 px-4 max-w-7xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Our USP is a <span className="text-blue-500">deeply researched curriculum</span><br />
              that helps children develop:
            </h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: Lightbulb, title: "Creative Thinking", q: "How do I create new ideas?", sub: "Building new things • Expressing imagination" },
              { icon: BrainCircuit, title: "Critical Thinking", q: "How do I evaluate claims?", sub: "Question Peer pressure • AI misinformation" },
              { icon: Network, title: "Systems Thinking", q: "How do things connect?", sub: "Cause & effect • Connecting ideas • Breaking down problems" },
              { icon: MessageCircle, title: "Communication", q: "How do I express myself?", sub: "Public speaking • Storytelling • Clarity and persuasion" },
              { icon: Heart, title: "Life Skills", q: "How do I become my best version?", sub: "Entrepreneurship • Finance • Well-being" },
              { icon: Cpu, title: "AI Nativeness", q: "How do I use AI as a tool?", sub: "Build with AI • Prototyping • Outsourcing thinking?" },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                className={`p-8 rounded-2xl border transition-transform duration-300 group hover:-translate-y-1 ${styles.card}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${styles.uspIcon}`}>
                  <item.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm italic mb-3 opacity-80">"{item.q}"</p>
                <p className={`text-xs ${styles.subtext}`}>{item.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ================= TESTIMONIALS (Optimized Grid) ================= */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          id="stories" 
          className="py-20"
        >
          <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Trusted by parents. <span className="text-blue-500">Loved by students.</span>
            </h2>
            <p className={`${styles.subtext}`}>Stories from the Ground Zero community</p>
          </div>

          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((t, i) => (
              <div key={i} className={`p-8 rounded-3xl border flex flex-col justify-between ${styles.card}`}>
                <div>
                  <div className="text-5xl text-blue-500/20 font-serif mb-6">“</div>
                  <p className={`text-base font-medium leading-relaxed mb-8 ${styles.subtext}`}>{t.text}</p>
                </div>
                <div className={`pt-6 border-t flex items-center gap-3 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center font-bold text-black text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs opacity-60">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ================= PROGRAMS ================= */}
        <section id="programs" className="py-24 px-4 max-w-7xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Our Programs</h2>
            <p className={styles.subtext}>Choose the program which fits your requirement.</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch"
          >
            {/* Card 1: Personalised Mentorship */}
            <motion.div variants={fadeInUp} className={`p-8 rounded-3xl border flex flex-col h-full transition-transform hover:-translate-y-1 ${styles.card}`}>
              <h3 className="text-2xl font-bold mb-2">Personalised Mentorship</h3>
              <p className={`text-sm mb-6 ${styles.subtext}`}>For the kids who want personalised approach</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹3,000</span><span className="text-xs opacity-60 ml-2">/ Session</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {["1:1 Live Sessions", "Fully Self-paced", "Unblocking specific hurdles", "Lock in sessions as you need them", "K-12 academic support provided"].map((item, i) => (
                  <li key={i} className={`flex items-start gap-3 text-sm ${styles.subtext}`}>
                    <Check size={18} className="text-cyan-400 mt-0.5" /> {item}
                  </li>
                ))}
              </ul>
                <motion.button 
                      {...hoverScale}
                      onClick={() => navigate('/book-one-on-one-session-spark')}
                      className={`w-full py-4 rounded-xl font-bold border transition-all will-change-transform
                        ${isDark
                            ? 'border-blue-400/60 text-blue-300 hover:bg-blue-900/20'
                            : 'border-blue-500/50 text-blue-600 hover:bg-blue-50'
                        }`}
                    >
                      Book your session
                 </motion.button>
            </motion.div>

            {/* Card 2: Spark Online */}
            <motion.div variants={fadeInUp} className={`relative p-8 rounded-3xl border flex flex-col h-full transform lg:-translate-y-4 ${isDark ? 'bg-[#13141F] border-cyan-500/50' : 'bg-white border-blue-500 shadow-xl'}`}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black text-xs font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Star size={12} fill="black" /> Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Spark Online Batch</h3>
              <p className={`text-sm mb-6 ${styles.subtext}`}>For kids who want to learn thinking and building together.</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-cyan-400">₹1,500</span><span className="text-xs opacity-60 ml-2">/ Session</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {["Small Group format", "2 sessions / week for 6 weeks", "Collaborative learning environment", "Demo Day: projects presentation", "Next batch starts 21st March"].map((item, i) => (
                  <li key={i} className={`flex items-start gap-3 text-sm ${styles.subtext}`}>
                    <Check size={18} className="text-blue-500 mt-0.5" /> {item}
                  </li>
                ))}
              </ul>
              <motion.button 
                {...hoverScale}
                onClick={() => navigate('/buycourse?coursetype=ONLINE')}
                className="w-full py-4 rounded-xl font-bold bg-cyan-400 hover:bg-cyan-300 text-black transition-all shadow-md will-change-transform"
              >
                Book your spot
              </motion.button>
              <p className="text-center text-[10px] mt-3 opacity-50">Limited seats available</p>
            </motion.div>

            {/* Card 3 (Column 3): Stacked Consultation + Webinar */}
            <div className="flex flex-col gap-6 h-full">
              
              {/* Consultation Card */}
              <motion.div 
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate('/book-discovery-call-spark')}
                className={`flex-1 p-8 rounded-3xl border flex flex-col justify-between transition-all cursor-pointer ${styles.fancyCard}`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                      <Calendar size={20} />
                    </div>
                    <h3 className="text-lg font-bold leading-tight">Schedule Consultation</h3>
                  </div>
                  <p className={`text-sm ${styles.subtext}`}>
                    We'll discuss your child's learning needs, walk you through the program, and see if Ground Zero aligns with you.
                  </p>
                </div>
                <div className={`mt-4 w-full py-3 rounded-xl font-bold text-center transition-all ${isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  Book a discovery call
                </div>
              </motion.div>

              {/* Webinar Card */}
              <motion.div 
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                onClick={openWebinar}
                className={`flex-1 p-8 rounded-3xl border flex flex-col justify-between transition-all cursor-pointer ${styles.fancyCard}`}
              >
                <div>
                   <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-600'}`}>
                      <Video size={20} />
                    </div>
                    <h3 className="text-lg font-bold leading-tight">Join Our Webinar</h3>
                  </div>

                  <p className={`text-sm mb-3 font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    "How to think about learning in the age of AI"
                  </p>
                  <ul className="space-y-1.5 mb-2">
                    {[
                      "Interactive, discussion-led session",
                      "Small-group, Limited seats"
                    ].map((item, i) => (
                      <li key={i} className={`flex items-start gap-2 text-xs ${styles.subtext}`}>
                        <div className="mt-1.5 w-1 h-1 rounded-full bg-cyan-400 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`mt-4 w-full py-3 rounded-xl font-bold text-center border transition-all ${isDark ? 'border-cyan-500/30 hover:bg-cyan-900/30 text-cyan-400' : 'border-slate-300 hover:bg-slate-100 text-slate-800'}`}>
                  Reserve your spot
                </div>
              </motion.div>

            </div>
          </motion.div>
        </section>

        {/* ================= FOUNDER ================= */}
        <section id="about" className="py-24 px-4 max-w-4xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="flex flex-col gap-6"
          >
             {/* Quote Card */}
            <div className={`p-10 md:p-12 rounded-3xl border relative overflow-hidden ${isDark ? 'bg-[#13141F] border-gray-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="absolute top-6 left-8 text-6xl text-cyan-500/20 font-serif leading-none">“</div>
              <h3 className="relative z-10 text-xl md:text-2xl font-medium leading-relaxed mt-4">
                The world is changing exponentially. Most jobs your child aspires to today won't exist in 15 years. 
                <br /><br />
                We move beyond just teaching AI tools; <span className="text-blue-500 font-bold">we build the thinkers, tinkerers, and future shapers</span> who will lead with empathy.
              </h3>
              <div className="absolute bottom-6 right-8 text-6xl text-cyan-500/20 font-serif leading-none rotate-180">“</div>
            </div>

            {/* Profile Card */}
            <div className={`p-8 md:p-10 rounded-3xl border flex flex-col md:flex-row items-center gap-8 ${isDark ? 'bg-[#13141F] border-gray-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              
              <div className="shrink-0 w-28 h-28 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-[2px]">
                <div className={`w-full h-full rounded-full flex items-center justify-center text-3xl font-bold ${isDark ? 'bg-[#0B0C15] text-white' : 'bg-white text-slate-900'}`}>
                  SS
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h4 className="text-2xl font-bold mb-1">Shivangi Srivastava</h4>
                <p className="text-cyan-500 text-sm font-bold uppercase tracking-wider mb-4">Founder, Ground Zero</p>
                <p className={`text-sm mb-6 leading-relaxed ${styles.subtext}`}>
                  Ex AVP New Initiatives, Swiggy | Ex CTO and Co-Founder at Tazzo | BTech (CSE) IIT Guwahati
                </p>
                <div className="flex justify-center md:justify-start gap-4">
                  <a href="https://x.com/shivangi_sriv" target='_blank' rel="noreferrer" className={`p-2.5 rounded-lg transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                    <Twitter size={18} />
                  </a>
                  <a href="https://www.linkedin.com/in/shivangi-srivastava-36bb1323/" target='_blank' rel="noreferrer" className={`p-2.5 rounded-lg transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                    <Linkedin size={18} />
                  </a>
                </div>
              </div>

            </div>
          </motion.div>
        </section>

        {/* ================= CTA ================= */}
        <section className="py-32 text-center">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="max-w-4xl mx-auto px-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-10 leading-tight">
              Find out how a <span className="text-cyan-400">small shift in learning</span><br />
              can unlock big possibilities
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-5">
              <motion.button 
                {...hoverScale}
                onClick={() => navigate('/book-discovery-call-spark')} 
                className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold px-10 py-4 rounded-full transition-transform shadow-lg will-change-transform"
              >
                Book a discovery call &rarr;
              </motion.button>
              <motion.button 
                {...hoverScale}
                onClick={openWebinar}
                className={`border px-10 py-4 rounded-full font-semibold transition-all will-change-transform ${isDark ? 'border-gray-600 hover:bg-white/10' : 'border-slate-300 hover:bg-slate-100'}`}
              >
                Join our next webinar
              </motion.button>
            </div>
          </motion.div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className={`py-12 px-4 border-t text-center text-xs ${styles.footer}`}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center opacity-60">
            <p>© 2025 Ground Zero Spark. All rights reserved.</p>
            <div className="flex gap-8 mt-6 md:mt-0">
              <a href="#" className="hover:text-cyan-400">Privacy Policy</a>
              <a href="#" className="hover:text-cyan-400">Terms of Service</a>
            </div>
          </div>
        </footer>

      </div>
    </div>

    {/* Webinar Modal */}
    <FormModal 
      isOpen={isWebinarOpen} 
      onClose={closeWebinar} 
      isDark={isDark}
      title="Register for Webinar"
      url="https://docs.google.com/forms/d/1f7-IOT4bcMiKhZvUp3GKZ7HfCbEXbJQouw7XO2gTOao/viewform?embedded=true"
    />
    </>
  );
};

export default GroundZeroSpark;