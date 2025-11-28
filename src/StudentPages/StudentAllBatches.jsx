import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  FaBolt, 
  FaFire, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaTimes, 
  FaLayerGroup,
  FaPlusCircle,
  FaCheckCircle
} from 'react-icons/fa';
import { getAllBatchesForStudent, getWeeksForBatchStudent } from '../api.js';

// --- Helper: Batch Card ---
const BatchCard = ({ batch, isDark, onClick }) => {
  const statusBg = batch.isLive ? "bg-green-500" : "bg-purple-500";
  const statusLabel = batch.isLive ? "LIVE" : "UPCOMING";
  const StatusIcon = batch.isLive ? FaBolt : FaFire;

  return (
    <div 
      onClick={onClick}
      className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden
        ${batch.amIEnrolled ? 'cursor-pointer' : ''}
      `}
      style={{
        backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      }}
    >
      {/* Enrollment Badge */}
      {batch.amIEnrolled && (
        <div className="absolute top-0 right-0 bg-[var(--accent-teal)] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
          ENROLLED
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-4">

        {/* Status */}
        <div 
          className={`flex items-center gap-2 px-3 py-1 rounded-full bg-opacity-10 border text-xs font-bold tracking-wider ${statusBg}`}
          style={{
            color: "white", 
            borderColor: batch.isLive ? "green" : "purple"
          }}
        >
          <span className={`w-2 h-2 rounded-full ${statusBg} ${batch.isLive ? 'animate-pulse' : ''}`}></span>
          {statusLabel}
        </div>

        <StatusIcon className={`text-xl ${batch.isLive ? 'text-yellow-400' : 'text-orange-400'}`} />
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold mb-1" style={{ color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }}>
        {batch.batchId}
      </h3>
      <p className="text-sm mb-6" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})` }}>
        {batch.cohort} • {batch.level}
      </p>

      {/* Details */}
      <div 
        className="grid grid-cols-2 gap-4 p-4 rounded-xl mb-6"
        style={{ backgroundColor: `var(${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"})` }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Start Date</p>
          <div className="flex items-center gap-2 text-sm font-medium">
            <FaCalendarAlt className="opacity-70" />
            {new Date(batch.startDate).toLocaleDateString()}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Location</p>
          <div className="flex items-center gap-2 text-sm font-medium">
            <FaMapMarkerAlt className="opacity-70" />
            {batch.classLocation}
          </div>
        </div>
      </div>

      {/* Action */}
      {batch.amIEnrolled ? (
        <button className="w-full py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 bg-[var(--accent-teal)] text-white opacity-90">
          <FaCheckCircle /> Joined
        </button>
      ) : (
        <button 
          className="w-full py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition hover:scale-[1.02]"
          style={{ 
            background: "linear-gradient(90deg, var(--accent-purple), var(--accent-teal))",
            color: 'white'
          }}
          onClick={(e) => {
            e.stopPropagation();
            alert("Enrollment feature coming soon!");
          }}
        >
          <FaPlusCircle /> Enroll Now
        </button>
      )}
    </div>
  );
};

// --- Helper: Batch Details Modal ---
const BatchDetailsModal = ({ isOpen, onClose, batch, weeks, isLoadingWeeks, isDark }) => {
  if (!isOpen || !batch) return null;

  const modalBG = isDark ? "#1A1B26" : "#fff"; 
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
        style={{ backgroundColor: modalBG, color: textColor, borderColor, borderWidth: '1px' }}
        onClick={(e) => e.stopPropagation()} 
      >

        {/* Header */}
        <div className="p-8 border-b flex justify-between items-start" style={{ borderColor }}>
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-4">
              {batch.batchId} 

              {/* White LIVE/UPCOMING */}
              <span 
                className="text-sm px-3 py-1 rounded-full border"
                style={{
                  borderColor: batch.isLive ? "green" : "purple",
                  backgroundColor: batch.isLive ? "green" : "purple",
                  color: "white"
                }}
              >
                {batch.isLive ? "LIVE" : "UPCOMING"}
              </span>
            </h2>

            <p className="text-base mt-2" style={{ color: secondaryText }}>{batch.description}</p>
          </div>

          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-2xl">
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FaLayerGroup className="text-[var(--accent-teal)]" /> Curriculum Weeks
          </h3>

          {isLoadingWeeks ? (
            <div className="py-20 text-center">
              <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[var(--accent-teal)] mx-auto mb-4"></div>
              <p style={{ color: secondaryText }}>Loading curriculum...</p>
            </div>
          ) : weeks.length === 0 ? (
            <div className="p-12 rounded-2xl border border-dashed text-center" style={{ borderColor }}>
              <p className="text-lg" style={{ color: secondaryText }}>No weeks scheduled yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {weeks.map((week) => (
                <div key={week.week_number} className="p-5 rounded-xl border transition hover:bg-white/5" style={{ borderColor }}>
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                      style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "var(--accent-teal)" }}>
                      {week.week_number}
                    </div>

                    <div>
                      <h4 className="font-bold text-lg">{week.title}</h4>
                      <p className="text-sm mt-1 mb-3" style={{ color: secondaryText }}>{week.description}</p>

                      {/* Days (violet bg + white text) */}
                      <div className="flex gap-2">
                        {week.class_days.map(day => (
                          <span 
                            key={day} 
                            className="text-[11px] px-2.5 py-1 rounded font-bold uppercase"
                            style={{
                              backgroundColor: "var(--accent-purple)",
                              color: "white"
                            }}
                          >
                            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][day - 1]}
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
          <button className="px-6 py-2 rounded-lg font-semibold bg-[var(--border-dark)] text-white">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const StudentAllBatchesPage = () => {
  const { isDark } = useOutletContext();
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // NEW: Show/hide enrolled batches
  const [showMyBatches, setShowMyBatches] = useState(false);

  // Modal State
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchWeeks, setBatchWeeks] = useState([]);
  const [isWeeksLoading, setIsWeeksLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const response = await getAllBatchesForStudent();
      if (response.success) {
        setBatches(response.data);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleBatchClick = async (batch) => {
    if (!batch.amIEnrolled) return;

    setSelectedBatch(batch);
    setIsWeeksLoading(true);
    setBatchWeeks([]);

    const response = await getWeeksForBatchStudent(batch._id);
    if (response.success) {
      setBatchWeeks(response.data);
    }
    setIsWeeksLoading(false);
  };

  const enrolledBatches = batches.filter(b => b.amIEnrolled);
  const otherBatches = batches.filter(b => !b.amIEnrolled);

  return (
    <div className="min-h-screen pb-20">
      <h1 className="text-3xl font-bold mb-8">All Batches</h1>

      {isLoading ? (
        <p className="opacity-50">Loading batches...</p>
      ) : (
        <div className="space-y-12">

          {/* COLLAPSIBLE SECTION */}
          <section>
            <button 
              onClick={() => setShowMyBatches(prev => !prev)}
              className="px-4 py-2 rounded-lg font-semibold text-sm mb-4"
              style={{
                backgroundColor: "var(--accent-teal)",
                color: "white"
              }}
            >
              {showMyBatches ? "Hide My Batches" : "Show My Batches"}
            </button>

            {showMyBatches && (
              <div className="mt-4">
                <h2 className="text-2xl font-bold mb-6 text-[var(--accent-teal)]">
                  My Enrolled Batches
                </h2>

                {enrolledBatches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledBatches.map(batch => (
                      <BatchCard 
                        key={batch._id} 
                        batch={batch} 
                        isDark={isDark} 
                        onClick={() => handleBatchClick(batch)} 
                      />
                    ))}
                  </div>
                ) : (
                  <p className="opacity-50 italic">You haven't enrolled in any batches yet.</p>
                )}
              </div>
            )}
          </section>

          <hr />

          {/* Explore Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-[var(--accent-purple)]">
              Explore Batches
            </h2>

            {otherBatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherBatches.map(batch => (
                  <BatchCard key={batch._id} batch={batch} isDark={isDark} onClick={() => {}} />
                ))}
              </div>
            ) : (
              <p className="opacity-50 italic">No new batches available.</p>
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

export default StudentAllBatchesPage;
