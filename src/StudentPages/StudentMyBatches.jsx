import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  FaFire, 
  FaCalendarAlt, 
  FaUserFriends, 
  FaChevronRight, 
  FaTimes, 
  FaVideo,
  FaClock,
  FaMapMarkerAlt,
  FaGlobe
} from 'react-icons/fa'; 

// API helpers (keep your actual function names)
import { getMyLiveBatches, getSessiosnForBatchStudent } from '../api.js';

/**
 * StudentMyBatches.jsx
 * - Shows live/upcoming batch cards
 * - Clicking a batch opens a modal with sessions
 * - If backend returns "No Credit" for meetingLinkOrLocation it shows a disabled "Not Enough Credit" button
 * - Offline sessions show location; online sessions show Join/Upcoming depending on timing and credit
 */

// --- Helper: Batch Card Component ---
const BatchCard = ({ batch, isDark, onClick }) => {
  const statusBg = batch.isLive ? "bg-green-500" : "bg-purple-500";
  const statusLabel = batch.isLive ? "LIVE" : "UPCOMING";
  const isOnline = batch.batchType === 'ONLINE';

  return (
    <div 
      onClick={onClick}
      className="group relative p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between"
      style={{
        backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        minHeight: '280px'
      }}
    >
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${batch.isLive ? 'from-green-400 to-teal-500' : 'from-purple-500 to-pink-500'}`}></div>

      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2">
            <div 
              className={`flex items-center gap-2 px-3 py-1 rounded-full bg-opacity-10 border border-opacity-20 text-xs font-bold tracking-wider ${statusBg}`}
              style={{ color: "white", borderColor: batch.isLive ? "green" : "purple" }}
            >
              <span className={`w-2 h-2 rounded-full ${statusBg} ${batch.isLive ? 'animate-pulse' : ''}`}></span>
              {statusLabel}
            </div>

            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border border-opacity-20 text-xs font-bold tracking-wider ${isOnline ? 'bg-blue-500/10 text-blue-500 border-blue-500' : 'bg-orange-500/10 text-orange-500 border-orange-500'}`}>
               {isOnline ? 'ONLINE' : 'OFFLINE'}
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-1" style={{ color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }}>
          {batch.batchId}
        </h3>

        <p className="text-sm mb-6" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})` }}>
          {batch.cohort ? batch.cohort.charAt(0).toUpperCase() + batch.cohort.slice(1) : 'Cohort'} Level • {batch.level ? batch.level.charAt(0).toUpperCase() + batch.level.slice(1) : ''}
        </p>

        <div 
          className="grid grid-cols-2 gap-4 p-4 rounded-xl mb-4"
          style={{ backgroundColor: `var(${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"})` }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase opacity-50 mb-1"
              style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})` }}>
              Start Date
            </p>
            <div className="flex items-center gap-2 text-sm font-medium"
              style={{ color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }}>
              <FaCalendarAlt className="opacity-70" />
              {new Date(batch.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase opacity-50 mb-1"
              style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})` }}>
              {isOnline ? 'Platform' : 'Location'}
            </p>
            <div className="flex items-start gap-2 text-sm font-medium"
              style={{ color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }}>
              {isOnline ? (
                <>
                  <FaGlobe className="opacity-70 mt-0.5 text-blue-400" />
                  <span>Gmeet / Zoom</span>
                </>
              ) : (
                <>
                  <FaMapMarkerAlt className="opacity-70 mt-0.5 text-orange-400" />
                  <span className="line-clamp-2">
                    {batch.classLocation || "Center"} {batch.cityCode ? `(${batch.cityCode})` : ''}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center text-xs font-bold tracking-wide transition-opacity mt-auto" style={{ color: 'var(--accent-teal)' }}>
        Click to see sessions <FaChevronRight className="ml-1 text-[10px]" />
      </div>
    </div>
  );
};

// --- Helper: Batch Details Modal ---
const BatchDetailsModal = ({ isOpen, onClose, batch, sessions, isLoadingSessions, isDark }) => {
  if (!isOpen || !batch) return null;

  const textColor = isDark ? "var(--text-dark-primary)" : "var(--text-light-primary)";
  const borderColor = isDark ? "var(--border-dark)" : "var(--border-light)";
  const secondaryText = isDark ? "var(--text-dark-secondary)" : "var(--text-light-secondary)";
  const isOnlineBatch = batch.batchType === 'ONLINE';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl rounded-2xl shadow-2xl max-h-[85vh] flex flex-col"
        style={{ 
          backgroundColor: isDark ? "#1A1B26" : "#fff",
          color: textColor, 
          borderColor: borderColor, 
          borderWidth: '1px'
        }}
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="p-8 border-b flex justify-between items-start" style={{ borderColor }}>
          <div>
            <h2 className="text-3xl font-bold flex flex-wrap items-center gap-4">
              {batch.batchId} 
              <span className={`text-sm px-3 py-1 rounded-full border text-white ${batch.isLive ? 'bg-green-500 border-green-500' : 'bg-purple-500 border-purple-500'}`}>
                {batch.isLive ? 'LIVE' : 'UPCOMING'}
              </span>
              <span className={`text-sm px-3 py-1 rounded-full border ${isOnlineBatch ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                 {isOnlineBatch ? <FaGlobe className="inline mr-1"/> : <FaMapMarkerAlt className="inline mr-1"/>}
                 {isOnlineBatch ? 'Online' : 'Offline'}
              </span>
            </h2>
            <p className="text-base mt-2" style={{ color: secondaryText }}>
              {batch.description || "No description available for this batch."}
            </p>
            {!isOnlineBatch && (
              <p className="text-sm mt-1 text-orange-400 flex items-center gap-2">
                 <FaMapMarkerAlt /> {batch.classLocation}, {batch.cityCode}
              </p>
            )}
          </div>

          <button onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition text-2xl"
            style={{ color: secondaryText }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FaVideo className="text-[var(--accent-teal)]" />
            Class Sessions
          </h3>

          {isLoadingSessions ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-teal)] mx-auto mb-4"></div>
              <p style={{ color: secondaryText }}>Loading session schedule...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-12 rounded-2xl border border-dashed text-center" style={{ borderColor }}>
              <p className="text-lg" style={{ color: secondaryText }}>No sessions have been scheduled for this batch yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                // normalized fields: topic, start_time, end_time, meeting_link
                const hasValidLink = session.meeting_link && (session.meeting_link.startsWith('http') || session.meeting_link.startsWith('www'));
                const noCredit = session.meeting_link === "No Credit";

                // compute one-hour-before logic (only if start_time present and session.date)
                let linkHidden = false;
                if (isOnlineBatch && hasValidLink && session.date && session.start_time) {
                  try {
                    const sessionStart = new Date(session.date);
                    const [timeStr, modifier] = session.start_time.split(" ");
                    let [hours, minutes] = timeStr.split(":").map(Number);
                    if (modifier === "PM" && hours !== 12) hours += 12;
                    if (modifier === "AM" && hours === 12) hours = 0;
                    sessionStart.setHours(hours, minutes, 0, 0);
                    const oneHourBefore = new Date(sessionStart.getTime() - 60 * 60 * 1000);
                    const now = new Date();
                    if (now < oneHourBefore) linkHidden = true;
                  } catch (e) {
                    // if parsing fails, default to not hiding
                    linkHidden = false;
                  }
                }

                return (
                  <div 
                    key={session._id}
                    className="p-5 rounded-xl border transition hover:bg-white/5 flex flex-col md:flex-row gap-5 items-start md:items-center"
                    style={{ borderColor }}
                  >
                    {/* Session Number */}
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg"
                      style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "var(--accent-teal)" }}
                    >
                      #{session.session_number}
                    </div>

                    {/* Details */}
                    <div className="flex-grow">
                      <h4 className="font-bold text-lg">{session.topic || "Untitled Session"}</h4>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm" style={{ color: secondaryText }}>
                        <span className="flex items-center gap-1.5">
                            <FaCalendarAlt className="opacity-70" />
                            {session.date ? new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : "Date TBA"}
                        </span>

                        <span className="flex items-center gap-1.5">
                            <FaClock className="opacity-70" />
                            {session.start_time || "--:--"} - {session.end_time || "--:--"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 w-full md:w-auto mt-2 md:mt-0">
                      {/* ACTION LOGIC:
                        - If meeting_link === "No Credit" -> show Not Enough Credit (disabled)
                        - Else if hasValidLink && (not hidden by 1-hour rule) -> Join Class
                        - Else if offline -> show location (meeting_link used as location)
                        - Else (online & hidden) -> Upcoming
                      */}
                      {noCredit ? (
                        <button 
                          disabled
                          className="flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-semibold border cursor-not-allowed"
                          style={{ borderColor, color: "red", opacity: 0.9 }}
                        >
                          Not Enough Credit
                        </button>
                      ) : (hasValidLink && !linkHidden) ? (
                        <a 
                          href={session.meeting_link} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition hover:brightness-110"
                          style={{ backgroundColor: "var(--accent-teal)" }}
                        >
                          <FaVideo /> Join Class
                        </a>
                      ) : (!isOnlineBatch) ? (
                        <div 
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border opacity-90"
                          style={{ borderColor, color: secondaryText }}
                        >
                          <FaMapMarkerAlt className="text-orange-500"/> {session.meeting_link || "Location TBA"}
                        </div>
                      ) : (
                        <button 
                          disabled 
                          className="flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-semibold border opacity-30 cursor-not-allowed"
                          style={{ borderColor }}
                        >
                          Upcoming
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t text-right" style={{ borderColor }}>
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-semibold transition bg-[var(--border-dark)] hover:bg-opacity-80 text-white"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};


// --- Main Page Component ---
const StudentMyBatches = () => {
  const { isDark } = useOutletContext(); // Assuming context provides isDark
  
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchSessions, setBatchSessions] = useState([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(false);

  // 1. Fetch user's batches (Live & Upcoming)
useEffect(() => {
  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const response = await getMyLiveBatches();

      if (response?.success && Array.isArray(response.data)) {
        const today = new Date();

        const normalized = response.data.map(b => {
          const start = new Date(b.startDate);

          return {
            _id: b.batch_obj_id,          // ✅ required for keys & API calls
            batchId: b.batchName,         // ✅ used in UI
            level: b.level,
            cohort: b.level,              // optional: reuse if cohort not provided
            startDate: b.startDate,
            batchType: b.batchType,
            description: b.description,
            classLocation: b.classLocation || null,
            cityCode: b.cityCode || null,

            isLive: start <= today,
            isUpcoming: start > today
          };
        });

        setBatches(normalized);
      } else {
        console.error("Invalid response format", response);
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchBatches();
}, []);



  // 2. Handle click: Fetch Sessions
  const handleBatchClick = async (batch) => {
    setSelectedBatch(batch);
    setIsSessionsLoading(true);
    setBatchSessions([]);

    try {
        const response = await getSessiosnForBatchStudent(batch._id);
        
        if (response && response.success && Array.isArray(response.data)) {
          const normalized = response.data.map(s => ({
            ...s,
            topic: s.title,                   
            start_time: s.startTime,          
            end_time: s.endTime,              
            meeting_link: s.meetingLinkOrLocation, 
            // recording removed intentionally per request
          }));

          setBatchSessions(normalized);
        } else {
          console.error("Invalid sessions response", response);
        }
    } catch (error) {
        console.error("Error fetching sessions:", error);
    } finally {
        setIsSessionsLoading(false);
    }
  };

  const liveBatches = batches.filter(b => b.isLive);
  const upcomingBatches = batches.filter(b => b.isUpcoming);

  return (
    <div className="min-h-screen pb-20">

      {/* Header */}
      <div 
        className="relative rounded-3xl overflow-hidden p-8 md:p-12 text-white shadow-2xl mb-12"
        style={{
          background: "linear-gradient(90deg, #4F46E5 0%, #9333EA 100%)",
          minHeight: '200px'
        }}
      >
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl font-extrabold mb-3">My Cohorts</h1>
          <p className="text-lg opacity-90 leading-relaxed">
            Access your enrolled batches. Click on any card to view the detailed session schedule.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-teal)]"></div>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* Live Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gray-800">
                <FaFire className="text-yellow-400 text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Live & Running</h2>
                <p className="text-sm opacity-60">Cohorts currently in progress</p>
              </div>
            </div>

            {liveBatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveBatches.map(batch => (
                  <BatchCard 
                    key={batch._id} 
                    batch={batch} 
                    isDark={isDark} 
                    onClick={() => handleBatchClick(batch)} 
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-dashed text-center opacity-50">
                No active live cohorts found.
              </div>
            )}
          </section>

          {/* Upcoming Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gray-800">
                <FaUserFriends className="text-teal-400 text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Upcoming</h2>
                <p className="text-sm opacity-60">Cohorts you're enrolled in starting soon</p>
              </div>
            </div>

            {upcomingBatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingBatches.map(batch => (
                  <BatchCard 
                    key={batch._id} 
                    batch={batch} 
                    isDark={isDark} 
                    onClick={() => handleBatchClick(batch)} 
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-dashed text-center opacity-50">
                No upcoming cohorts found.
              </div>
            )}
          </section>
        </div>
      )}

      {/* Modal */}
      <BatchDetailsModal 
        isOpen={!!selectedBatch}
        onClose={() => setSelectedBatch(null)}
        batch={selectedBatch}
        sessions={batchSessions}
        isLoadingSessions={isSessionsLoading}
        isDark={isDark}
      />

    </div>
  );
};

export default StudentMyBatches;
