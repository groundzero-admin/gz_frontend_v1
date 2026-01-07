import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion'; 
import { 
  Rocket, 
  CheckCircle2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  MapPin, 
  Clock, 
  Video, 
  CalendarPlus, 
  Star,
  BookOpen
} from 'lucide-react';
import { BsStars } from "react-icons/bs"; 

import { getMyLiveBatches, getstudentsbatchprogress } from '../api.js'; 

// const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL  ; 



// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 50, damping: 20 }
  }
};

const bannerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// --- Component: Welcome Banner ---
const WelcomeBanner = ({ username }) => {
  const [greetingData, setGreetingData] = useState({ text: "Greetings, explorer!", icon: "✨" });

  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = "";
    let icon = "";

    if (hour >= 5 && hour < 12) {
      newGreeting = "Rise and shine, space explorer!";
      icon = "☀️";
    } else if (hour >= 12 && hour < 17) {
      newGreeting = "Afternoon mission check!";
      icon = "🚀";
    } else if (hour >= 17 && hour < 21) {
      newGreeting = "Good evening, stargazer!";
      icon = "🌌";
    } else {
      newGreeting = "Hello night owl!";
      icon = "🦉";
    }

    setGreetingData({ text: newGreeting, icon: icon });
  }, []);

  return (
    <motion.div 
      variants={bannerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full rounded-3xl overflow-hidden p-8 md:p-10 mb-8 shadow-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] z-0"></div>
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-50%] left-[-20%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-50%] right-[-20%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"
      />
      
      <div className="relative z-10 flex flex-col gap-4">
        <div className="self-start px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 backdrop-blur-md flex items-center gap-2">
           <BsStars className="text-cyan-400 text-xs" />
           <span className="text-cyan-300 text-xs font-bold uppercase tracking-wider">Welcome to your universe</span>
        </div>
        <div>
           <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-purple-200 mb-2 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
             Spark Ground Zero
           </h1>
           <p className="text-xl md:text-2xl font-medium text-gray-300 flex items-center gap-2">
              <span className="text-2xl">{greetingData.icon}</span> {greetingData.text}, <span className="text-cyan-400 font-bold">{username}</span>!
           </p>
        </div>
        <p className="text-gray-400 max-w-xl text-sm md:text-base leading-relaxed">
          Ready to explore, create, and discover? Your learning adventure continues here ✨
        </p>
      </div>
    </motion.div>
  );
};

// --- Component: Session Card ---
const SessionCard = ({ session, status, isDark }) => {
  const statusStyles = {
    upcoming: 'border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    completed: 'border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    missed: 'border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
  };

  const calendlyLink = 'https://calendly.com/spark-ground-zero/follow-up-session';

  const getActionButton = () => {
    if (status === 'upcoming') {
      return (
        <div className="flex gap-2 w-full">
          <a
            href={session.meetingLinkOrLocation || "#"}
            target={session.meetingLinkOrLocation ? "_blank" : "_self"}
            rel="noopener noreferrer"
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-300 text-sm font-bold shadow-lg
              ${session.sessionType === 'ONLINE' 
                 ? "bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20" 
                 : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20"
              }
              ${!session.meetingLinkOrLocation ? 'opacity-50 cursor-not-allowed pointer-events-none grayscale' : ''}
            `}
          >
            {session.sessionType === 'ONLINE' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
            {session.sessionType === 'ONLINE' ? "Open GMeet" : "View Location"}
          </a>

          <a
            href={session.googleClassroomLink || "#"}
            target={session.googleClassroomLink ? "_blank" : "_self"}
            rel="noopener noreferrer"
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-300 text-sm font-bold border
              ${isDark 
                ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white" 
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-black"
              }
              ${!session.googleClassroomLink ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
            `}
          >
            <BookOpen className="w-4 h-4" />
            Classroom
          </a>
        </div>
      );
    }

    if (status === 'completed') {
      return (
        <a
          href={session.googleClassroomLink || "#"}
          target={session.googleClassroomLink ? "_blank" : "_self"}
          rel="noopener noreferrer"
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-xl transition-all duration-300 text-sm font-bold
             ${!session.googleClassroomLink ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
          `}
        >
          <ExternalLink className="w-4 h-4" />
          Open Classroom
        </a>
      );
    }

    if (status === 'missed') {
      return (
        <div className="flex gap-2 w-full">
          <a
            href={ `./dashboard/catchup-session` }
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl transition-all duration-300 text-sm font-bold shadow-amber-500/20 shadow-lg"
          >
            <CalendarPlus className="w-4 h-4" />
            Catch Up
          </a>

          <a
            href={session.googleClassroomLink || "#"}
            target={session.googleClassroomLink ? "_blank" : "_self"}
            rel="noopener noreferrer"
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-300 text-sm font-bold border
                ${isDark 
                  ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white" 
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-black"
                }
                ${!session.googleClassroomLink ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
            `}
          >
            <BookOpen className="w-4 h-4" />
            Classroom
          </a>
        </div>
      );
    }

    return null;
  };

  const dateObj = new Date(session.date);
  const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <motion.div
      variants={itemVariants} 
      className={`backdrop-blur-sm border-2 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full
        ${statusStyles[status]}
        ${isDark ? "bg-gray-900/40" : "bg-white/60"}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <h4 className={`font-display text-lg font-bold leading-tight ${isDark ? "text-white" : "text-gray-800"}`}>
          {session.title}
        </h4>
        {status === 'completed' && <div className="flex items-center gap-1 text-emerald-500 shrink-0 ml-2"><Star className="w-5 h-5 fill-current" /></div>}
        {status === 'upcoming' && <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse shrink-0 ml-2" />}
      </div>

      <div className="space-y-3 mb-6 flex-1">
        <div className={`flex items-center gap-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          <Clock className="w-4 h-4" />
          <span className="text-sm">{dateStr} at {session.startTime}</span>
        </div>

        {session.sessionType === 'ONLINE' ? (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-sm font-medium text-cyan-500">Online</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-purple-500">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{session.meetingLinkOrLocation || "Location TBD"}</span>
          </div>
        )}
      </div>

      <div className="mt-auto pt-2">
        {getActionButton()}
      </div>
    </motion.div>
  );
};

// --- Component: Session Section ---
const SessionSection = ({ title, sessions, type, defaultExpanded = false, isDark }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const sectionConfig = {
    upcoming: {
      icon: Rocket,
      color: 'text-cyan-400',
      bgColor: isDark ? 'bg-cyan-950/20' : 'bg-cyan-50/50',
      borderColor: 'border-cyan-500/20',
      emptyText: 'No missions scheduled yet! Check back soon 🚀',
    },
    completed: {
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: isDark ? 'bg-emerald-950/20' : 'bg-emerald-50/50',
      borderColor: 'border-emerald-500/20',
      emptyText: 'Your first adventure awaits! ⭐',
    },
    missed: {
      icon: Sparkles,
      color: 'text-amber-400',
      bgColor: isDark ? 'bg-amber-950/20' : 'bg-amber-50/50',
      borderColor: 'border-amber-500/20',
      emptyText: "All caught up! You're doing great!",
    },
  };

  const config = sectionConfig[type];
  const Icon = config.icon;

  return (
    <motion.div variants={itemVariants} className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 hover:bg-white/5
          ${config.bgColor}
          ${config.borderColor}
          ${isExpanded ? 'rounded-b-none border-b-0' : ''}
        `}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-6 h-6 ${config.color}`} />
          <span className={`text-lg font-bold ${config.color}`}>{title}</span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isDark ? "bg-black/20 text-gray-300" : "bg-white/50 text-gray-600"}`}>
            {sessions.length}
          </span>
        </div>
        {isExpanded ? <ChevronUp className={`w-5 h-5 ${config.color}`} /> : <ChevronDown className={`w-5 h-5 ${config.color}`} />}
      </button>

      <motion.div
        initial={false}
        animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className={`p-5 border-2 border-t-0 rounded-b-2xl ${config.borderColor} ${config.bgColor}`}>
          {sessions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session) => (
                <SessionCard key={session._id} session={session} status={type} isDark={isDark} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8 font-medium">{config.emptyText}</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};




// --- Main Page Component ---
const StudentDashboardPage = () => {
  const { isDark, userData } = useOutletContext();
  const username = userData?.username || "Explorer";
  
  const [liveBatches, setLiveBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null); 
  const [batchData, setBatchData] = useState(null); 
  
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch Batches (Run once)
  useEffect(() => {
    const fetchBatches = async () => {
      setIsLoadingBatches(true);
      try {
        const response = await getMyLiveBatches();
        if (response.success && response.data.length > 0) {
          setLiveBatches(response.data);
          setSelectedBatchId(response.data[0].batch_obj_id);
        } else {
          setLiveBatches([]);
        }
      } catch (err) {
        console.error("Failed to fetch batches", err);
      } finally {
        setIsLoadingBatches(false);
      }
    };
    fetchBatches();
  }, []);

  // Fetch Batch Data (The Fix is Here)
  useEffect(() => {
    if (!selectedBatchId) return;

    // 1. Create a flag to track if this specific effect is still active
    let active = true;

    const fetchBatchStatus = async () => {
      setIsLoadingData(true);
      setBatchData(null); // Clear previous data immediately to prevent visual mismatch

      try {
        const response = await getstudentsbatchprogress({ batch_obj_id: selectedBatchId });
        
        // 2. Only update state if this effect is still active (User hasn't clicked away)
        if (active) {
            if (response.success) setBatchData(response.data);
            else setBatchData(null);
        }
      } catch (err) {
        console.error("Failed to fetch batch status", err);
      } finally {
        // 3. Only turn off loader if we are still on this batch
        if (active) {
            setIsLoadingData(false);
        }
      }
    };

    fetchBatchStatus();

    // 4. Cleanup function: Runs if component unmounts OR if selectedBatchId changes
    return () => {
      active = false; // This effectively "cancels" the state update of the previous request
    };
  }, [selectedBatchId]);

  return (
    <div className="relative flex flex-col pb-20 max-w-7xl mx-auto min-h-screen">
      
      {/* Global Background Nebula Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[150px]"
          />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 2 }}
            className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[150px]"
          />
      </div>

      <WelcomeBanner username={username} />

      <div className="mb-8 relative z-10">
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <Star className="w-5 h-5" />
            </div>
            <div>
                <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>My Sessions</h2>
                <p className="text-xs text-gray-500 font-medium">What's next for you?</p>
            </div>
        </div>

        {isLoadingBatches ? (
          <div className="animate-pulse h-10 w-48 bg-gray-700/20 rounded-full"></div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {liveBatches.map((batch) => (
              <button
                key={batch.batch_obj_id}
                onClick={() => setSelectedBatchId(batch.batch_obj_id)}
                // Add disabled state during loading to prevent spam-clicking if desired
                // disabled={isLoadingData && selectedBatchId === batch.batch_obj_id} 
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border backdrop-blur-sm
                  ${selectedBatchId === batch.batch_obj_id 
                    ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]' 
                    : isDark 
                      ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20' 
                      : 'bg-white/50 border-gray-200 text-gray-600 hover:bg-white hover:text-black hover:border-black'
                  }
                `}
              >
                {batch.batchName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FIX FOR ANIMATION BUG:
         1. Use mode="wait" to ensure exit finishes.
         2. Ensure Keys are distinct (loader vs content).
      */}
      <AnimatePresence mode='wait'>
        {isLoadingData ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }} // Fast exit for loader
            className="flex items-center justify-center py-20 relative z-10"
          >
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          </motion.div>
        ) : batchData ? (
          <motion.div
            key={`content-${selectedBatchId}`} // Unique key forces re-render of this block
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10"
          >
            <SessionSection 
              title="Upcoming Missions" 
              sessions={batchData.upcoming}
              type="upcoming"
              defaultExpanded={true}
              isDark={isDark}
            />
             <SessionSection 
              title="Completed Adventures" 
              sessions={batchData.attended}
              type="completed"
              defaultExpanded={false}
              isDark={isDark}
            />
            <SessionSection 
              title="Catch Up" 
              sessions={batchData.missed}
              type="missed"
              defaultExpanded={batchData.missed.length > 0}
              isDark={isDark}
            />
          </motion.div>
        ) : (
          <motion.div 
             key="empty"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="text-center py-20 opacity-50 text-gray-400 relative z-10"
          >
             Select a mission batch above to view your progress.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default StudentDashboardPage;