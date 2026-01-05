import React, { useState, useEffect } from 'react';
import { 
  Rocket, Compass, BookOpen, Linkedin, Twitter, Check, 
  Sun, Moon, Lightbulb, BrainCircuit, Network, MessageCircle, 
  Heart, Cpu, Star, Users, MapPin, Calendar, Video, ArrowRight,
  X, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { whoami } from './api.js'; 

// --- CSS for Background Animations ---
const animationStyles = `
  @keyframes float-slow {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  
  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  @keyframes hover-space {
    0% { transform: translate(0, 0) rotate(var(--r)); }
    50% { transform: translate(20px, -20px) rotate(calc(var(--r) + 5deg)); }
    100% { transform: translate(0, 0) rotate(var(--r)); }
  }

  @keyframes twinkle {
    0%, 100% { opacity: 0.4; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.1) rotate(15deg); }
  }

  .animate-float-slow { animation: float-slow 15s ease-in-out infinite; }
  .animate-scroll { animation: scroll 60s linear infinite; }
  .animate-scroll:hover { animation-play-state: paused; }
  
  .animate-hover-space { 
    animation: hover-space 30s ease-in-out infinite; 
  }
  
  .animate-twinkle { animation: twinkle 5s ease-in-out infinite; }

  html { scroll-behavior: smooth; }
`;

// --- Framer Motion Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 }
};

// --- Space Background ---
const SpaceBackground = ({ isDark }) => {
  if (!isDark) return null;

  const stars = Array.from({ length: 12 }).map((_, i) => {
    const sizeRoll = Math.random();
    let iconSize = 12; 
    if (sizeRoll > 0.8) iconSize = 24; 
    else if (sizeRoll > 0.5) iconSize = 16; 

    return {
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      size: iconSize,
      rotation: `${Math.random() * 360}deg`
    };
  });

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0">
      {stars.map((star, i) => (
        <div 
          key={i}
          className="absolute animate-twinkle text-cyan-100/80 drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
          style={{ 
            top: star.top, 
            left: star.left, 
            animationDelay: star.delay,
            transform: `rotate(${star.rotation})`
          }}
        >
          <Star size={star.size} fill="currentColor" />
        </div>
      ))}
      
      {/* Ships */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}
        className="absolute top-[15%] left-[10%] animate-hover-space text-white/5" style={{ '--r': '15deg' }}
      >
        <Rocket size={56} className="text-cyan-500/10" />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2, delay: 0.5 }}
        className="absolute top-[50%] right-[8%] animate-hover-space text-white/5" style={{ animationDelay: '-5s', '--r': '-12deg' }}
      >
        <Rocket size={48} className="text-blue-500/10" />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2, delay: 1 }}
        className="absolute bottom-[20%] left-[20%] animate-hover-space text-white/5" style={{ animationDelay: '-12s', '--r': '45deg' }}
      >
        <Rocket size={64} className="text-purple-500/10" />
      </motion.div>
    </div>
  );
};

// --- Background Orbs ---
const BackgroundOrbs = ({ isDark }) => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0">
    <div className={`absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] blur-[120px] rounded-full animate-float-slow transition-colors duration-500 ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-400/20'}`} />
    <div className={`absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] blur-[100px] rounded-full animate-float-slow transition-colors duration-500 ${isDark ? 'bg-blue-600/10' : 'bg-blue-400/20'}`} style={{ animationDelay: '-2s' }} />
  </div>
);

// --- Modal Component ---
const FormModal = ({ isOpen, onClose, url, title, isDark }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" 
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`relative w-full max-w-3xl h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col ${isDark ? 'bg-[#13141F] border border-white/10' : 'bg-white border border-slate-200'}`}
          >
            <div className={`flex justify-between items-center p-4 border-b ${isDark ? 'border-white/10 bg-[#13141F]' : 'border-slate-100 bg-white'}`}>
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
              <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'}`}>
                <X size={20} />
              </button>
            </div>
            <div className={`flex-1 relative ${isDark ? 'bg-black' : 'bg-white'}`}>
               <div className="absolute inset-0 flex items-center justify-center -z-10">
                  <Loader2 className="animate-spin text-slate-400" />
               </div>
               <iframe 
                src={url} 
                className="w-full h-full border-0 transition-all duration-300" 
                title="Form"
                marginHeight="0" 
                marginWidth="0"
                style={{ 
                  filter: isDark ? 'invert(1) hue-rotate(180deg) contrast(0.9)' : 'none',
                  backgroundColor: isDark ? 'black' : 'white' 
                }}
              >
                Loading...
              </iframe>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const GroundZeroSpark = () => {
  const [isDark, setIsDark] = useState(true);
  const [isWebinarOpen, setIsWebinarOpen] = useState(false); 
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

  // --- Handle Login Click ---
  const handleLoginClick = async () => {
    try {
      const response = await whoami();
      
      if (response.success && response.data) {
        const { role } = response.data;
        navigate(`/${role}/dashboard`);
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error("Auth check failed", error);
      navigate('/login');
    }
  };

  // --- Styles ---
  const styles = {
    bg: isDark ? "bg-[#0B0C15]" : "bg-slate-50",
    text: isDark ? "text-gray-100" : "text-slate-900",
    subtext: isDark ? "text-gray-400" : "text-slate-600",
    navbar: isDark ? "bg-[#13141F]/80 border-white/10" : "bg-white/80 border-slate-200",
    card: isDark ? "bg-[#13141F]/60 border-white/5 hover:border-cyan-500/30" : "bg-white border-slate-200 shadow-xl hover:border-cyan-500/40",
    uspIcon: isDark ? "bg-slate-800/50 text-cyan-400" : "bg-cyan-50 text-cyan-600",
    footer: isDark ? "bg-[#0B0C15] border-white/10" : "bg-slate-100 border-slate-200",
    fancyCard: isDark 
      ? "bg-[#13141F]/40 border-white/10 hover:bg-[#13141F]/80 hover:border-cyan-500/50" 
      : "bg-white border-slate-200 hover:border-cyan-500/50 hover:shadow-2xl"
  };

  const reviews = [
    { name: "Rahul K.", role: "Parent of 10-year-old", text: "The collaborative projects helped my son come out of his shell. He presented his AI project with so much confidence!" },
    { name: "Anita S.", role: "Parent of 14-year-old", text: "Ground Zero doesn't just teach AI tools - they teach how to think. That's invaluable for their future." },
    { name: "Vikram T.", role: "Parent of 11-year-old", text: "Best investment we made. Our child is now building actual projects and solving real problems!" },
    { name: "Meera R.", role: "Parent of 13-year-old", text: "The curriculum is thoughtfully designed. It balances creativity with powerful tech tools perfectly." },
    { name: "Sanya M.", role: "Parent of 12-year-old", text: "My daughter now questions AI responses instead of blindly accepting them. That's the critical thinking we needed!" },
    { name: "Arjun P.", role: "Parent of 9-year-old", text: "Finally a program that isn't just coding syntax. It's about logic, empathy, and building useful things." },
  ];
  
  const allReviews = [...reviews, ...reviews, ...reviews]; 

  return (
    <>
    <div className={`min-h-screen font-sans selection:bg-cyan-500/50 selection:text-white overflow-hidden relative transition-colors duration-500 ${styles.bg} ${styles.text}`}>
      <style>{animationStyles}</style>
      
      {/* Background Layers */}
      <BackgroundOrbs isDark={isDark} />
      <SpaceBackground isDark={isDark} />

      <div className="relative z-10">
        
        {/* ================= NAVBAR ================= */}
        <motion.nav 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pt-6 px-4"
        >
          <div className={`backdrop-blur-xl border rounded-[5px] px-6 py-3 flex items-center justify-between w-full max-w-5xl shadow-2xl transition-all duration-300 ${styles.navbar}`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-[5px] flex items-center justify-center text-xs font-extrabold border shadow-[0_0_15px_rgba(34,211,238,0.2)] ${isDark ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-cyan-400 border-cyan-500/20' : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-transparent'}`}>
                GO
              </div>
              <span className="font-bold text-lg tracking-tight">Ground Zero <span className="text-cyan-400">Spark</span></span>
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
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme} 
                className={`p-2 rounded-full transition-all ${isDark ? 'bg-white/10 text-yellow-300' : 'bg-slate-200 text-slate-600'}`}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>

              {/* --- LOGIN BUTTON --- */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLoginClick}
                className={`border text-xs md:text-sm font-semibold px-5 py-2 rounded-[5px] transition-all shadow-lg 
                  ${isDark 
                    ? 'bg-slate-800/80 text-purple-400 border-purple-500/30 hover:bg-purple-500 hover:text-white' 
                    : 'bg-purple-600 text-white border-transparent hover:bg-purple-700'
                  }`}
              >
                Login
              </motion.button>

              {/* --- BOOK A CALL BUTTON (Hidden on Mobile) --- */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/book-discovery-call-spark')}
                className={`hidden md:block border text-xs md:text-sm font-semibold px-5 py-2 rounded-[5px] transition-all shadow-lg ${isDark ? 'bg-slate-800/80 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500 hover:text-black' : 'bg-slate-900 text-white border-transparent hover:bg-slate-700'}`}
              >
                Book a Call
              </motion.button>
            </div>
          </div>
        </motion.nav>

        {/* ================= HERO SECTION ================= */}
        <section className="relative pt-80 pb-32 px-4 text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none" />
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]"
          >
            Make your kids <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500">future ready</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-xl md:text-2xl max-w-2xl mx-auto mb-12 font-medium ${styles.subtext}`}
          >
            Thinking skills and responsible AI, taught through real problem-solving.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-5"
          >
            <motion.button 
                {...hoverScale}
                onClick={() => navigate('/book-discovery-call-spark')} 
                className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold px-10 py-4 rounded-full transition-transform shadow-[0_0_30px_rgba(34,211,238,0.4)]"
              >
                Book a discovery call &rarr;
              </motion.button>
            <motion.button 
              {...hoverScale}
              onClick={(e) => handleScroll(e, 'programs')} 
              className={`border px-10 py-4 rounded-full font-semibold transition-all ${isDark ? 'border-white/20 hover:bg-white/10 text-white' : 'border-slate-300 hover:bg-slate-100 text-slate-800'}`}
            >
              Explore Programs
            </motion.button>
          </motion.div>
        </section>

        {/* ================= USP / CURRICULUM ================= */}
        <section id="curriculum" className="py-24 px-4 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
                className={`p-8 rounded-2xl border backdrop-blur-md transition-all group ${styles.card}`}
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

        {/* ================= TESTIMONIALS (Infinite Scroll) ================= */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          id="stories" 
          className="py-20 overflow-hidden relative"
        >
          <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Trusted by parents. <span className="text-blue-500">Loved by students.</span>
            </h2>
            <p className={`${styles.subtext}`}>Stories from the Ground Zero community</p>
          </div>

          <div className="flex w-full overflow-hidden mask-linear-gradient">
            <div className="flex gap-6 animate-scroll w-max px-6">
              {allReviews.map((t, i) => (
                <div key={i} className={`p-8 rounded-3xl border backdrop-blur-md w-[350px] md:w-[450px] flex-shrink-0 flex flex-col justify-between ${styles.card}`}>
                  <div>
                    <div className="text-5xl text-blue-500/20 font-serif mb-6">“</div>
                    <p className={`text-base font-medium leading-relaxed mb-8 ${styles.subtext}`}>{t.text}</p>
                  </div>
                  <div className="pt-6 border-t border-white/5 flex items-center gap-3">
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
          </div>
        </motion.section>

        {/* ================= PROGRAMS ================= */}
        <section id="programs" className="py-24 px-4 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Our Programs</h2>
            <p className={styles.subtext}>Choose the program which fits your requirement.</p>
          </motion.div>

          <div className="flex flex-col gap-10">
            
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch"
            >
              {/* Card 1: Personalised Mentorship */}
              <motion.div variants={fadeInUp} whileHover={{ y: -8 }} className={`p-8 rounded-3xl border flex flex-col h-full transition-all ${styles.card}`}>
                <h3 className="text-2xl font-bold mb-2">Personalised Mentorship</h3>
                <p className={`text-sm mb-6 ${styles.subtext}`}>For the kids who want personalised approach</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">₹2,500</span><span className="text-xs opacity-60 ml-2">/ Session</span>
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
                  className={`w-full py-4 rounded-xl font-bold border transition-all ${isDark ? 'border-white/20 hover:bg-white/10 text-white' : 'border-slate-300 hover:bg-slate-100 text-slate-800'}`}
                >
                  Book your session
                </motion.button>
              </motion.div>

              {/* Card 2: Spark Online */}
              <motion.div variants={fadeInUp} whileHover={{ y: -16 }} className={`relative p-8 rounded-3xl border flex flex-col h-full transform lg:-translate-y-4 ${isDark ? 'bg-[#13141F] border-cyan-500/50 shadow-[0_0_60px_-12px_rgba(34,211,238,0.25)]' : 'bg-white border-blue-500 shadow-xl'}`}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black text-xs font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <Star size={12} fill="black" /> Popular
                </div>
                <h3 className="text-2xl font-bold mb-2">Spark Online Batch</h3>
                <p className={`text-sm mb-6 ${styles.subtext}`}>For kids who want to learn thinking and building together.</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-cyan-400">₹1,000</span><span className="text-xs opacity-60 ml-2">/ Session</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {["Small Group format", "2 sessions / week for 6 weeks", "Collaborative learning environment", "Demo Day: projects presentation", "Next batch starts 10th Jan"].map((item, i) => (
                    <li key={i} className={`flex items-start gap-3 text-sm ${styles.subtext}`}>
                      <Check size={18} className="text-blue-500 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
                <motion.button 
                  {...hoverScale}
                  onClick={() => navigate('/buycourse?coursetype=ONLINE')}
                  className="w-full py-4 rounded-xl font-bold bg-cyan-400 hover:bg-cyan-300 text-black transition-all shadow-lg hover:shadow-cyan-400/20"
                >
                  Book your spot
                </motion.button>
                <p className="text-center text-[10px] mt-3 opacity-50">Limited seats available</p>
              </motion.div>

              {/* Card 3: Spark Offline */}
              <motion.div variants={fadeInUp} whileHover={{ y: -8 }} className={`p-8 rounded-3xl border flex flex-col h-full transition-all ${styles.card}`}>
                <h3 className="text-2xl font-bold mb-2">Spark Offline Batch</h3>
                <p className={`text-sm mb-6 ${styles.subtext}`}>In-person learning experience for hands-on collaboration.</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">₹1,500</span><span className="text-xs opacity-60 ml-2">/ Session</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {["Physical Classroom Setting", "Hands-on hardware/AI projects", "Direct peer-to-peer interaction", "Personalized instructor attention", "Weekend batches available"].map((item, i) => (
                    <li key={i} className={`flex items-start gap-3 text-sm ${styles.subtext}`}>
                      <Check size={18} className="text-purple-400 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
                <motion.button 
                  {...hoverScale}
                  onClick={() => navigate('/buycourse?coursetype=OFFLINE')}
                  className={`w-full py-4 rounded-xl font-bold border transition-all ${isDark ? 'border-white/20 hover:bg-white/10 text-white' : 'border-slate-300 hover:bg-slate-100 text-slate-800'}`}
                >
                  Join Offline Batch
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Row 2: Beautiful CTA Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto w-full">
              
              {/* Free Consultation Card */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`group p-8 rounded-3xl border flex items-center justify-between transition-all duration-300 cursor-pointer ${styles.fancyCard}`}
                onClick={() => navigate('/book-discovery-call-spark')}
              >
                <div className="flex items-start gap-5">
                  <div className={`p-3 rounded-2xl ${isDark ? 'bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-cyan-100'}`}>
                    <Calendar size={28} className="text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">Free Consultation</h4>
                    <p className={`text-sm ${styles.subtext}`}>Not sure where to start? Let's discuss your child's needs.</p>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 group-hover:bg-cyan-500 group-hover:border-cyan-500 ${isDark ? 'border-white/20' : 'border-slate-300'}`}>
                  <ArrowRight size={20} className="transition-transform group-hover:translate-x-1 group-hover:text-black" />
                </div>
              </motion.div>

              {/* Webinar Card */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`group p-8 rounded-3xl border flex items-center justify-between transition-all duration-300 cursor-pointer ${styles.fancyCard}`}
                onClick={openWebinar}
              >
                <div className="flex items-start gap-5">
                  <div className={`p-3 rounded-2xl ${isDark ? 'bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-purple-100'}`}>
                    <Video size={28} className="text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">Join Upcoming Webinar</h4>
                    <p className={`text-sm ${styles.subtext}`}>"How to think about learning in the age of AI" • Free</p>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 group-hover:bg-purple-500 group-hover:border-purple-500 ${isDark ? 'border-white/20' : 'border-slate-300'}`}>
                  <ArrowRight size={20} className="transition-transform group-hover:translate-x-1 group-hover:text-white" />
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ================= FOUNDER ================= */}
        <section id="about" className="py-24 px-4 max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={`rounded-3xl p-10 md:p-16 border flex flex-col lg:flex-row gap-12 items-center ${styles.card}`}
          >
            <div className="flex-1 space-y-6">
              <div className="text-5xl text-cyan-400 font-serif">“</div>
              <h3 className="text-2xl md:text-3xl font-bold leading-relaxed">
                The world is changing exponentially. Most jobs your child aspires to today won't exist in 15 years. 
                <br /><br />
                We move beyond just teaching AI tools; <span className="text-blue-500">we build the thinkers, tinkerers, and future shapers</span> who will lead with empathy.
              </h3>
            </div>
            
            <div className={`p-10 rounded-3xl border w-full max-w-sm text-center ${isDark ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-black text-2xl font-bold mb-6 shadow-lg shadow-cyan-500/20">SS</div>
              <h4 className="text-2xl font-bold mb-1">Shivangi Srivastava</h4>
              <p className="text-cyan-500 text-sm font-medium mb-6 uppercase tracking-wider">Founder, Ground Zero</p>
              <p className={`text-sm mb-8 leading-relaxed ${styles.subtext}`}>
                Ex AVP New Initiatives, Swiggy | Ex CTO and Co-Founder at Tazzo | BTech (CSE) IIT Guwahati
              </p>
              <div className="flex justify-center gap-4">
                <a href="#" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"><Twitter size={18} /></a>
                <a href="#" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"><Linkedin size={18} /></a>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ================= CTA ================= */}
        <section className="py-32 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto px-4"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-10 leading-tight">
              Find out how a <span className="text-cyan-400">small shift in learning</span><br />
              can unlock big possibilities
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-5">
              <motion.button 
                {...hoverScale}
                onClick={() => navigate('/book-discovery-call-spark')} 
                className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold px-10 py-4 rounded-full transition-transform shadow-[0_0_30px_rgba(34,211,238,0.4)]"
              >
                Book a discovery call &rarr;
              </motion.button>
              <motion.button 
                {...hoverScale}
                onClick={openWebinar}
                className={`border px-10 py-4 rounded-full font-semibold transition-all ${isDark ? 'border-white/20 hover:bg-white/10' : 'border-slate-300 hover:bg-slate-100'}`}
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
      url="https://docs.google.com/forms/d/1VeV7fbUFDnJkcwMNJOnDg0O1I8ibA3kMQtdSV7wy8J4/viewform?embedded=true"
    />
    </>
  );
};

export default GroundZeroSpark;