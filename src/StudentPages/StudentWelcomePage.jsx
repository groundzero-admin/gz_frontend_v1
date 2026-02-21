import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  CheckCircle2,
  Sparkles,
  MapPin,
  Clock,
  Video,
  CalendarPlus,
  Star
} from 'lucide-react';
import { BsStars } from "react-icons/bs";
import { getMyLiveBatches, getstudentsbatchprogress } from '../api.js';

// --- Optimized Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  },
  exit: { opacity: 0 }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const bannerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

// --- Component: Welcome Banner ---
const WelcomeBanner = ({ username }) => {
  const [greetingData, setGreetingData] = useState({ text: "Greetings, explorer!", icon: "✨" });

  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = "";
    let icon = "";

    if (hour >= 5 && hour < 12) {
      newGreeting = "Rise and shine ";
      icon = "☀️";
    } else if (hour >= 12 && hour < 17) {
      newGreeting = "Afternoon mission check ";
      icon = "🚀";
    } else if (hour >= 17 && hour < 21) {
      newGreeting = "Good evening ";
      icon = "🌌";
    } else {
      newGreeting = "Hello night owl ";
      icon = "🦉";
    }

    setGreetingData({ text: newGreeting, icon: icon });
  }, []);

  return (
    <motion.div
      variants={bannerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full rounded-3xl overflow-hidden p-8 md:p-10 mb-8 shadow-2xl transform-gpu"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] z-0"></div>

      {/* Static Background Blobs for Performance */}
      <div className="absolute top-[-50%] left-[-20%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none opacity-40" />
      <div className="absolute bottom-[-50%] right-[-20%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[80px] pointer-events-none opacity-30" />

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
            <span className="text-2xl">{greetingData.icon}</span> {greetingData.text},  <span className="text-cyan-400 font-bold">{username}</span>!
          </p>
        </div>
        <p className="text-gray-400 max-w-3xl text-sm md:text-base leading-relaxed">
          Ready to explore, create, and discover? Your learning adventure continues here✨
        </p>
      </div>
    </motion.div>
  );
};

// --- Component: Session Card ---
const SessionCard = ({ session, status, isDark }) => {
  const [isDescHovered, setIsDescHovered] = useState(false);

  const statusStyles = {
    upcoming: 'border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    completed: 'border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    missed: 'border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
  };

  const getActionButton = () => {
    // Compute whether session has started (activity only enabled after session start time)
    let activityEnabled = true;
    if (session.date && session.startTime) {
      try {
        const sDate = new Date(session.date);
        const [tStr, mod] = session.startTime.split(" ");
        let [h, m] = tStr.split(":").map(Number);
        if (mod === "PM" && h !== 12) h += 12;
        if (mod === "AM" && h === 12) h = 0;
        sDate.setHours(h, m, 0, 0);
        // Enable activity 1 hour before session start
        const enableTime = new Date(sDate.getTime() - 1 * 60 * 60 * 1000);
        if (new Date() < enableTime) activityEnabled = false;
      } catch (e) { /* parsing fail → keep enabled */ }
    }

    const activityBtnClass = activityEnabled
      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
      : 'bg-gray-300 text-white cursor-not-allowed opacity-60';

    if (status === 'upcoming') {
      return (
        <div className="flex flex-col xl:flex-row gap-2 w-full">
          {session.sessionType === 'ONLINE' && (
            <a
              href={session.meetingLinkOrLocation || "#"}
              target={session.meetingLinkOrLocation ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-300 text-sm font-bold shadow-lg
                bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20
                ${!session.meetingLinkOrLocation ? 'opacity-50 cursor-not-allowed pointer-events-none grayscale' : ''}
              `}
            >
              <Video className="w-4 h-4" />
              Open GMeet
            </a>
          )}

          <button
            onClick={() => activityEnabled && window.open(`/student/activity/batch-session/${session._id}`, '_blank')}
            disabled={!activityEnabled}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-300 text-sm font-bold shadow-lg ${activityBtnClass}`}
          >
            <Rocket className="w-4 h-4" />
            Activity
          </button>
        </div>
      );
    }

    if (status === 'completed') {
      return (
        <button
          onClick={() => activityEnabled && window.open(`/student/activity/batch-session/${session._id}`, '_blank')}
          disabled={!activityEnabled}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-bold shadow-lg ${activityBtnClass}`}
        >
          <Rocket className="w-4 h-4" />
          Activity
        </button>
      );
    }

    if (status === 'missed') {
      return (
        <div className="flex flex-col xl:flex-row gap-2 w-full">
          <a
            href={`./dashboard/catchup-session`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl transition-all duration-300 text-sm font-bold shadow-amber-500/20 shadow-lg"
          >
            <CalendarPlus className="w-4 h-4" />
            Catch Up
          </a>
          <button
            onClick={() => activityEnabled && window.open(`/student/activity/batch-session/${session._id}`, '_blank')}
            disabled={!activityEnabled}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-300 text-sm font-bold shadow-lg ${activityBtnClass}`}
          >
            <Rocket className="w-4 h-4" />
            Activity
          </button>
        </div>
      );
    }
    return null;
  };

  const dateObj = new Date(session.date);
  const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <motion.div
      layout="position"
      variants={itemVariants}
      className={`backdrop-blur-sm border-2 rounded-3xl p-5 transition-all duration-300 flex flex-col h-full transform-gpu
        ${statusStyles[status]}
        ${isDark ? "bg-gray-900/40" : "bg-white/60"}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <h4 className={`font-display text-lg font-bold leading-tight ${isDark ? "text-white" : "text-gray-800"}`}>
          {session.title}
        </h4>
        {status === 'completed' && <div className="flex items-center gap-1 text-emerald-500 shrink-0 ml-2"><Star className="w-5 h-5 fill-current" /></div>}
        {status === 'upcoming' && <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 ml-2" />}
      </div>

      <div className="space-y-3 mb-6 flex-1">
        <div className={`flex items-center gap-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          <Clock className="w-4 h-4" />
          <span className="text-sm">{dateStr} at {session.startTime}</span>
        </div>

        {session.sessionType === 'ONLINE' ? (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span className="text-sm font-medium text-cyan-500">Online</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-purple-500">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{session.meetingLinkOrLocation || "Location TBD"}</span>
          </div>
        )}

        {session.description && (
          <div
            onMouseEnter={() => setIsDescHovered(true)}
            onMouseLeave={() => setIsDescHovered(false)}
            className={`relative rounded-xl p-3 mt-2 cursor-pointer border transition-colors duration-300
              ${isDark ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20" : "bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-gray-200"}
            `}
          >
            <div className="flex items-center gap-2 mb-1 opacity-70">
              <span className="text-[10px] font-bold uppercase tracking-wider">Session Details</span>
            </div>

            <div className={`overflow-hidden transition-[max-height] duration-500 ease-in-out relative ${isDescHovered ? 'max-h-60' : 'max-h-10'}`}>
              <p className={`text-xs leading-relaxed whitespace-pre-line pb-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                {session.description}
              </p>

              <div
                className={`absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t transition-opacity duration-300 pointer-events-none
                ${isDark ? "from-[#111827] to-transparent" : "from-white to-transparent"}
                ${isDescHovered ? "opacity-0" : "opacity-100"}
                `}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto pt-2">
        {getActionButton()}
      </div>
    </motion.div>
  );
};


// --- Component: Session Section (FIXED SHOW LESS) ---
const SessionSection = ({ title, sessions, type, defaultExpanded = false, isDark }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const isUpcoming = type === "upcoming";
  const INITIAL_COUNT = 3;
  const headerRef = useRef(null); // Ref for the top of the section

  const [visibleCount, setVisibleCount] = useState(isUpcoming ? INITIAL_COUNT : sessions.length);
  const lastCardRef = useRef(null);

  useEffect(() => {
    setVisibleCount(isUpcoming ? INITIAL_COUNT : sessions.length);
  }, [sessions, isUpcoming]);

  const visibleSessions = sessions.slice(0, visibleCount);
  const showLoadMore = isUpcoming && sessions.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount(sessions.length);
  };

  const handleShowLess = () => {
    // 1. Scroll back to the header smoothly so the user doesn't lose context
    if (headerRef.current) {
      headerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // 2. Reset count
    setVisibleCount(INITIAL_COUNT);
  };

  // Scroll to new items ONLY when expanding (Show More)
  useEffect(() => {
    if (visibleCount > INITIAL_COUNT && lastCardRef.current) {
      setTimeout(() => {
        lastCardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [visibleCount]);

  const sectionConfig = {
    upcoming: {
      icon: Rocket,
      color: 'text-cyan-400',
      bgColor: isDark ? 'bg-cyan-950/20' : 'bg-cyan-50/50',
      borderColor: 'border-cyan-500/20',
      emptyText: 'No missions scheduled yet 🚀',
    },
    completed: {
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: isDark ? 'bg-emerald-950/20' : 'bg-emerald-50/50',
      borderColor: 'border-emerald-500/20',
      emptyText: 'Your first adventure awaits ⭐',
    },
    missed: {
      icon: Sparkles,
      color: 'text-amber-400',
      bgColor: isDark ? 'bg-amber-950/20' : 'bg-amber-50/50',
      borderColor: 'border-amber-500/20',
      emptyText: "All caught up!",
    },
  };

  const config = sectionConfig[type];
  const Icon = config.icon;

  const accordionVariants = {
    collapsed: { height: 0, opacity: 0, overflow: "hidden" },
    expanded: { height: "auto", opacity: 1, transitionEnd: { overflow: "visible" } }
  };

  return (
    <div className="mb-6" ref={headerRef}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300
          ${config.bgColor} ${config.borderColor}
          ${isExpanded ? 'rounded-b-none border-b-0' : ''}
        `}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-6 h-6 ${config.color}`} />
          <span className={`text-lg font-bold ${config.color}`}>{title}</span>
          <span className={` py-1 rounded-full text-xs font-bold ${isDark ? "bg-black/20 text-gray-300" : "bg-white/50 text-gray-600"}`}>
            ( {sessions.length} )
          </span>
        </div>
      </button>

      <motion.div
        variants={accordionVariants}
        initial={defaultExpanded ? "expanded" : "collapsed"}
        animate={isExpanded ? "expanded" : "collapsed"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="border-2 border-t-0 rounded-b-2xl flex flex-col gap-6 origin-top"
        style={{
          borderColor: isDark ? 'rgba(6,182,212,0.1)' : 'rgba(6,182,212,0.2)',
          backgroundColor: isDark ? 'rgba(8,51,68,0.2)' : 'rgba(236,254,255,0.5)'
        }}
      >
        <div className={`p-5 ${config.borderColor} ${config.bgColor}`}>
          {sessions.length > 0 ? (
            <>
              {/* ✅ FIXED: Added layout prop to the GRID container and a spring transition 
                 This ensures the box shrinks smoothly when items are removed 
              */}
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {visibleSessions.map((session, index) => {
                    const isLast = index === visibleSessions.length - 1;
                    return (
                      <motion.div
                        key={session._id}
                        layout="position"
                        initial="hidden"
                        animate="visible"
                        // Faster exit animation so the container can shrink quickly
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        variants={itemVariants}
                        ref={isLast ? lastCardRef : null}
                      >
                        <SessionCard session={session} status={type} isDark={isDark} />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>

              {isUpcoming && sessions.length > INITIAL_COUNT && (
                <div className="flex justify-center border-t border-dashed border-gray-500/30 pt-4 mt-4">
                  <button
                    onClick={showLoadMore ? handleLoadMore : handleShowLess}
                    className={`group flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border
                      ${isDark
                        ? "bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white hover:border-gray-500"
                        : "bg-white/80 border-gray-200 text-gray-500 hover:bg-white hover:text-black hover:border-gray-400 shadow-sm"
                      }
                    `}
                  >
                    <span>{showLoadMore ? `Show ${sessions.length - visibleCount} More` : 'Show Less'}</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500 py-8 font-medium">
              {config.emptyText}
            </p>
          )}
        </div>
      </motion.div>
    </div>
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

  useEffect(() => {
    if (!selectedBatchId) return;
    let active = true;

    const fetchBatchStatus = async () => {
      setIsLoadingData(true);
      setBatchData(null);

      try {
        const response = await getstudentsbatchprogress({ batch_obj_id: selectedBatchId });
        if (active) {
          if (response.success) setBatchData(response.data);
          else setBatchData(null);
        }
      } catch (err) {
        console.error("Failed to fetch batch status", err);
      } finally {
        if (active) setIsLoadingData(false);
      }
    };

    fetchBatchStatus();
    return () => { active = false; };
  }, [selectedBatchId]);

  return (
    <div className="relative flex flex-col pb-20 max-w-7xl mx-auto min-h-screen">

      {/* PERFORMANCE FIX: Static Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
        <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[100px] opacity-40 transform-gpu" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[100px] opacity-30 transform-gpu" />
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

      <AnimatePresence mode='wait'>
        {isLoadingData ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-20 relative z-10"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          </motion.div>
        ) : batchData ? (
          <motion.div
            key={`content-${selectedBatchId}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10"
          >
            <SessionSection title="Upcoming Missions" sessions={batchData.upcoming} type="upcoming" defaultExpanded={true} isDark={isDark} />
            <SessionSection title="Completed Adventures" sessions={batchData.attended} type="completed" defaultExpanded={false} isDark={isDark} />
            <SessionSection title="Catch Up" sessions={batchData.missed} type="missed" defaultExpanded={batchData.missed.length > 0} isDark={isDark} />
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