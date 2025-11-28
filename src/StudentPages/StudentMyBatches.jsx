import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  FaFire, 
  FaCalendarAlt, 
  FaUserFriends, 
  FaChevronRight, 
  FaTimes, 
  FaLayerGroup,
  FaMapMarkerAlt 
} from 'react-icons/fa'; 
// ⚠️ Removed FaBolt

import { getMyEnrolledBatches, getWeeksForBatchStudent } from '../api.js';

// --- Helper: Batch Card Component ---
const BatchCard = ({ batch, isDark, onClick }) => {

  const statusBg = batch.isLive ? "bg-green-500" : "bg-purple-500";
  const statusLabel = batch.isLive ? "LIVE" : "UPCOMING";

  // Status icon → removed bolt, only fire for upcoming
  const StatusIcon = batch.isLive ? null : FaFire;

  return (
    <div 
      onClick={onClick}
      className="group relative p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden"
      style={{
        backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      }}
    >
      {/* Top Glow */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${batch.isLive ? 'from-green-400 to-teal-500' : 'from-purple-500 to-pink-500'}`}></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        {/* Status Badge */}
        <div 
          className={`flex items-center gap-2 px-3 py-1 rounded-full bg-opacity-10 border border-opacity-20 text-xs font-bold tracking-wider ${statusBg}`}
          style={{
            color: "white",              // <<< MAKE LIVE TEXT WHITE
            borderColor: batch.isLive ? "green" : "purple"
          }}
        >
          <span className={`w-2 h-2 rounded-full ${statusBg} ${batch.isLive ? 'animate-pulse' : ''}`}></span>
          {statusLabel}
        </div>

        {/* No icon when LIVE */}
        {StatusIcon && <StatusIcon className="text-xl text-orange-400" />}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold mb-1" style={{ color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }}>
        {batch.batchId}
      </h3>

      <p className="text-sm mb-6" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})` }}>
        {batch.cohort.charAt(0).toUpperCase() + batch.cohort.slice(1)} Level • {batch.level.charAt(0).toUpperCase() + batch.level.slice(1)}
      </p>

      {/* Info */}
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
            Location
          </p>
          <div className="flex items-center gap-2 text-sm font-medium"
            style={{ color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }}>
            <FaMapMarkerAlt className="opacity-70" />
            {batch.classLocation}
          </div>
        </div>
      </div>

      <div className="flex items-center text-xs font-bold tracking-wide transition-opacity" style={{ color: 'var(--accent-teal)' }}>
        Click to see weeks <FaChevronRight className="ml-1 text-[10px]" />
      </div>
    </div>
  );
};

// --- Helper: Batch Details Modal ---
const BatchDetailsModal = ({ isOpen, onClose, batch, weeks, isLoadingWeeks, isDark }) => {
  if (!isOpen || !batch) return null;

  const textColor = isDark ? "var(--text-dark-primary)" : "var(--text-light-primary)";
  const borderColor = isDark ? "var(--border-dark)" : "var(--border-light)";
  const secondaryText = isDark ? "var(--text-dark-secondary)" : "var(--text-light-secondary)";

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
            <h2 className="text-3xl font-bold flex items-center gap-4">
              {batch.batchId} 
              <span className="text-sm px-3 py-1 rounded-full border border-green-500 text-white bg-green-500">
                LIVE
              </span>
            </h2>
            <p className="text-base mt-2" style={{ color: secondaryText }}>
              {batch.description || "No description available for this batch."}
            </p>
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
            <FaLayerGroup className="text-[var(--accent-teal)]" />
            Curriculum Weeks
          </h3>

          {isLoadingWeeks ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-teal)] mx-auto mb-4"></div>
              <p style={{ color: secondaryText }}>Loading curriculum...</p>
            </div>
          ) : weeks.length === 0 ? (
            <div className="p-12 rounded-2xl border border-dashed text-center" style={{ borderColor }}>
              <p className="text-lg" style={{ color: secondaryText }}>No weeks have been scheduled for this batch yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {weeks.map((week) => (
                <div 
                  key={week.week_number}
                  className="p-5 rounded-xl border transition hover:bg-white/5"
                  style={{ borderColor }}
                >
                  <div className="flex items-start gap-5">
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                      style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "var(--accent-teal)" }}
                    >
                      {week.week_number}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{week.title}</h4>
                      <p className="text-sm mt-1 mb-3 line-clamp-2" style={{ color: secondaryText }}>
                        {week.description}
                      </p>

                     {/* Days (violet background + white text) */}
                        <div className="flex gap-2">
                            {week.class_days.map(day => (
                                <span 
                                key={day} 
                                className="text-[11px] px-2.5 py-1 rounded font-bold uppercase"
                                style={{
                                    backgroundColor: "var(--accent-purple)", // <<< Violet background
                                    color: "white" // <<< White text
                                }}
                                >
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day - 1]}
                                </span>
                            ))}
                        </div>


                    </div>
                  </div>
                </div>
              ))}
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
const StudentMyBactches  = () => {
  const { isDark } = useOutletContext();
  
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchWeeks, setBatchWeeks] = useState([]);
  const [isWeeksLoading, setIsWeeksLoading] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      setIsLoading(true);
      const response = await getMyEnrolledBatches();

      if (response.success) {
        setBatches(response.data);
      } 

      setIsLoading(false);
    };
    fetchBatches();
  }, []);

  const handleBatchClick = async (batch) => {
    setSelectedBatch(batch);
    setIsWeeksLoading(true);
    setBatchWeeks([]);

    const response = await getWeeksForBatchStudent(batch._id);
    if (response.success) {
      setBatchWeeks(response.data);
    }
    setIsWeeksLoading(false);
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
            Explore all the cohorts you're enrolled in. Click on any cohort to see the complete curriculum and learning weeks.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-teal)]"></div>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* Live */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gray-800">
                {/* Removed FaBolt */}
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

          {/* Upcoming */}
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
        weeks={batchWeeks}
        isLoadingWeeks={isWeeksLoading}
        isDark={isDark}
      />

    </div>
  );
};

export default StudentMyBactches;
