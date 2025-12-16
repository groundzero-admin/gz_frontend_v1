import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  FaBolt,
  FaCalendarAlt,
  FaChevronRight,
  FaQuoteLeft,
  FaClock,
  FaMapMarkerAlt,
  FaVideo,
  FaExternalLinkAlt,
  FaGlobeAmericas
} from 'react-icons/fa';

import { 
  getLiveBatchInfoTeacherMinor, 
  getTodaysLiveBatchesForTeacher 
} from '../api.js';


// ------------------- MOTIVATION BANNER -------------------
const MotivationBanner = ({ isDark }) => {
  const quotes = [
    "A teacher ignites the fire that lights the path of learning.",
    "The influence of a good teacher can never be erased.",
    "Teachers don’t just teach — they inspire futures.",
    "Every lesson you teach builds someone’s tomorrow."
  ];

  const [randomQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  return (
    <div 
      className="p-8 rounded-2xl shadow-md border-gradient relative overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: `var(${isDark ? "--card-dark" : "--button-bg-light"})`,
      }}
    >
      <div className="flex items-start gap-4">
        <FaQuoteLeft 
          className="text-4xl opacity-60"
          style={{ color: 'var(--accent-purple)' }}
        />
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-wide"
            style={{ color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }}
          >
            Welcome Back, Teacher
          </h1>
          <p 
            className="text-base opacity-80 leading-relaxed"
            style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})` }}
          >
            {randomQuote}
          </p>
        </div>
      </div>
    </div>
  );
};


// ------------------- LIVE BATCH BUTTON -------------------
// Matches Backend Response: { _id: "...", batchId: "..." }
const LiveBatchButton = ({ batch, isDark, onClick }) => (
  <button
    onClick={onClick}
    className="group flex items-center gap-3 px-5 py-3 rounded-xl border animate hover:shadow-md hover:-translate-y-1 transition-all duration-300"
    style={{
      backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
      borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
    }}
  >
    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
    <span className="font-semibold text-sm">{batch.batchId}</span>
    <FaChevronRight className="text-[10px] opacity-50 group-hover:translate-x-1 transition" />
  </button>
);


// ------------------- SCHEDULE CARD -------------------
const ScheduleCard = ({ info, isDark }) => {
  const hasClass = info.hasClassToday;
  const statusColor = hasClass ? "text-green-400" : "text-yellow-400";
  const statusBorder = hasClass ? "border-green-400" : "border-yellow-400";
  const dotBg = hasClass ? "bg-green-400" : "bg-yellow-400";

  // Determine mode based on API response
  const isOnline = info.mode === 'ONLINE';

  return (
    <div 
      className="p-6 rounded-2xl border flex flex-col justify-between transition hover:shadow-lg h-full"
      style={{
        backgroundColor: `var(${isDark ? "--card-dark" : "--card-light"})`,
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      }}
    >
      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 
              className="text-xl font-bold"
              style={{ color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }}
            >
              {info.batchId}
            </h3>
            
            {/* Mode Badge (Replaces Session/Week Number) */}
            <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${isOnline ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
              {isOnline ? <FaGlobeAmericas /> : <FaMapMarkerAlt />}
              <span>{info.mode}</span>
            </div>
          </div>

          <div 
            className={`px-3 py-1 rounded-full border flex items-center gap-2 text-xs font-bold ${statusColor} ${statusBorder}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${dotBg} ${hasClass ? "animate-pulse" : ""}`}></span>
            {hasClass ? "CLASS TODAY" : "NO CLASS"}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4 text-sm mb-4">
          
          {/* Timing */}
          <div className="flex items-center gap-3 opacity-80">
            <FaClock className="text-blue-400 flex-shrink-0" />
            <div className="flex-1">
               <span className="block text-[10px] uppercase opacity-60 font-bold">Timing</span>
               <span className="font-medium" style={{ color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }}>
                 {info.timing}
               </span>
            </div>
          </div>

          {/* Connection Info / Location */}
          <div className="flex items-center gap-3 opacity-80">
             {isOnline ? (
               <FaVideo className="text-purple-400 flex-shrink-0" />
             ) : (
               <FaMapMarkerAlt className="text-red-400 flex-shrink-0" />
             )}
            
            <div className="flex-1 overflow-hidden">
               <span className="block text-[10px] uppercase opacity-60 font-bold">
                 {isOnline ? "Join Link" : "Location"}
               </span>
               
               {isOnline && hasClass ? (
                 <a 
                   href={info.connectionInfo} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-blue-500 hover:text-blue-400 hover:underline flex items-center gap-1 truncate font-medium"
                 >
                   Launch Meeting <FaExternalLinkAlt className="text-[10px]" />
                 </a>
               ) : (
                 <span className="font-medium truncate block" title={info.connectionInfo} style={{ color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }}>
                   {info.connectionInfo}
                 </span>
               )}
            </div>
          </div>

          {/* Next Class */}
          {info.nextClassDate && (
             <div className="flex items-center gap-3 opacity-80">
                <FaCalendarAlt className="text-orange-400 flex-shrink-0" />
                <div>
                   <span className="block text-[10px] uppercase opacity-60 font-bold">Next Class</span>
                   <span className="font-medium" style={{ color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }}>
                     {info.nextClassDate}
                   </span>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};


// ------------------- MAIN PAGE -------------------
const TeacherDashboardPage = () => {
  const { isDark } = useOutletContext();
  const navigate = useNavigate();

  const [liveBatches, setLiveBatches] = useState([]);
  const [todaysSchedule, setTodaysSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const [batchesRes, scheduleRes] = await Promise.all([
        getLiveBatchInfoTeacherMinor(),
        getTodaysLiveBatchesForTeacher()
      ]);

      if (batchesRes && batchesRes.success) {
        setLiveBatches(batchesRes.data);
      }
      
      if (scheduleRes && scheduleRes.success) {
        setTodaysSchedule(scheduleRes.data);
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);


  const handleBatchClick = (id) => {
    navigate(`/teacher/dashboard/batches/${id}`);
  };


  return (
    <div className="flex flex-col gap-12 pb-20">
      
      {/* 🔥 Motivation Banner */}
      <MotivationBanner isDark={isDark} />


      {/* ⚡ Live Batches Section */}
      <section>
        <h2 
          className="text-xl font-bold mb-3 flex items-center gap-2"
          style={{ color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }}
        >
          <FaBolt className="text-yellow-400" /> Live Batches
        </h2>

        {isLoading ? (
          <div className="animate-pulse flex gap-4">
             <div className="h-12 w-32 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
             <div className="h-12 w-32 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
          </div>
        ) : liveBatches.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {liveBatches.map(batch => (
              <LiveBatchButton 
                key={batch._id} 
                batch={batch}
                isDark={isDark}
                onClick={() => handleBatchClick(batch._id)}
              />
            ))}
          </div>
        ) : (
          <p className="opacity-50 italic" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})` }}>
            No active live batches at the moment.
          </p>
        )}
      </section>


      {/* 📅 Today's Schedule */}
      <section>
        <h2 
          className="text-xl font-bold mb-4 flex items-center gap-2"
          style={{ color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }}
        >
          <FaCalendarAlt className="text-[var(--accent-purple)]" /> Today's Schedule
        </h2>

        {isLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="h-48 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
              ))}
           </div>
        ) : todaysSchedule.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {todaysSchedule.map((info, idx) => (
              <ScheduleCard key={idx} info={info} isDark={isDark} />
            ))}
          </div>
        ) : (
          <div 
            className="p-10 rounded-2xl border text-center opacity-60"
            style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}
          >
            <p style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})` }}>
              No class schedule for today.
            </p>
          </div>
        )}
      </section>

    </div>
  );
};

export default TeacherDashboardPage;