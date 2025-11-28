import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom'; 
import { 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaChalkboardTeacher, 
  FaRocket, 
  FaLightbulb, 
  FaBolt 
} from 'react-icons/fa';

import { getMyLiveBatches, getTodaysLiveBatchInfo } from '../api.js';

// --- Helper: Batch Selection Chip ---
const BatchChip = ({ label, isSelected, onClick, isDark }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border
      ${isSelected 
        ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)] shadow-md scale-105' 
        : 'bg-transparent hover:bg-opacity-10 hover:bg-gray-500'
      }
    `}
    style={{
      borderColor: isSelected ? 'var(--accent-purple)' : `var(${isDark ? "--border-dark" : "--border-light"})`,
      color: isSelected ? 'white' : `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`,
    }}
  >
    {label}
  </button>
);

// --- Helper: Info Pill ---
const InfoPill = ({ icon, label, value, isDark }) => (
  <div 
    className="flex flex-col p-3 rounded-xl border"
    style={{
      backgroundColor: `var(${isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.5)"})`,
      borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
    }}
  >
    <div className="flex items-center gap-2 mb-1 text-[10px] font-bold uppercase tracking-wider opacity-70" 
      style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
    >
      {icon} {label}
    </div>
    <div className="text-base font-bold">{value}</div>
  </div>
);

const StudentDashboardPage = () => {
  const { isDark } = useOutletContext();
  const navigate = useNavigate();

  // State
  const [liveBatches, setLiveBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [batchInfo, setBatchInfo] = useState(null);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);

  // Fetch Live Batches
  useEffect(() => {
    const fetchBatches = async () => {
      setIsLoadingBatches(true);
      const response = await getMyLiveBatches();
      if (response.success) {
        setLiveBatches(response.data);
        if (response.data.length > 0) {
          setSelectedBatchId(response.data[0].batch_obj_id);
        }
      }
      setIsLoadingBatches(false);
    };
    fetchBatches();
  }, []);

  // Fetch Batch Info
  useEffect(() => {
    if (!selectedBatchId) return;

    const fetchInfo = async () => {
      setIsLoadingInfo(true);
      const response = await getTodaysLiveBatchInfo(selectedBatchId);
      if (response.success) {
        setBatchInfo(response.data);
      }
      setIsLoadingInfo(false);
    };
    fetchInfo();
  }, [selectedBatchId]);

  // Helper: Current batch name
  const getSelectedBatchName = () => {
    const batch = liveBatches.find(b => b.batch_obj_id === selectedBatchId);
    return batch ? batch.batchId : "Unknown Batch";
  };

  // --- Format Today's Date ---
  const todayStr = new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  });

  // --- Format Next Class Date ---
  const nextClassValue = batchInfo?.nextClassDate
    ? (isNaN(new Date(batchInfo.nextClassDate).getTime())
        ? "Update Soon"
        : new Date(batchInfo.nextClassDate).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            weekday: 'short'
          })
      )
    : "Update Soon";

  return (
    <div className="flex flex-col gap-5 pb-10">
      
      {/* --- Welcome Banner --- */}
      <div 
        className="relative rounded-3xl overflow-hidden p-6 md:p-8 text-white shadow-xl"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          minHeight: '180px'
        }}
      >
        <h1 className="text-3xl font-extrabold mb-1">Welcome to Ground Zero</h1>
        <p className="text-sm opacity-90 italic mb-4">
          "The future belongs to those who believe in the beauty of their dreams."
        </p>

        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold flex items-center gap-2">
            <FaRocket /> Building Future Leaders
          </span>
          <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold flex items-center gap-2">
            <FaLightbulb /> Innovation First
          </span>
          <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold flex items-center gap-2">
            <FaBolt /> Your Journey Starts Here
          </span>
        </div>
      </div>

      {/* --- Batch Selection --- */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide opacity-70 mb-2">My Live Batches</h2>

        {isLoadingBatches ? (
          <p className="opacity-50 text-sm">Loading batches...</p>
        ) : liveBatches.length === 0 ? (
          <p className="opacity-50 italic text-sm">You are not enrolled in any batches.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {liveBatches.map(batch => (
              <BatchChip
                key={batch.batch_obj_id}
                label={batch.batchId}
                isDark={isDark}
                isSelected={selectedBatchId === batch.batch_obj_id}
                onClick={() => setSelectedBatchId(batch.batch_obj_id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* --- Active Batch Card --- */}
      {selectedBatchId && (
        <div 
          className="rounded-3xl border p-1 overflow-hidden transition-all flex-grow"
          style={{
            backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
            borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
          }}
        >
          <div className="p-6 relative h-full flex flex-col">

            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FaBolt className="text-[var(--accent-teal)] text-lg" />
                  <h2 className="text-2xl font-extrabold">{getSelectedBatchName()}</h2>
                </div>
              </div>

              <div className="px-3 py-1 rounded-lg border text-[10px] font-bold uppercase"
                style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`}}
              >
                {batchInfo?.hasClassToday ? "Class Today" : "No Class Today"}
              </div>
            </div>

            {isLoadingInfo ? (
              <div className="py-10 text-center opacity-50 text-sm">
                Loading schedule details...
              </div>
            ) : batchInfo ? (
              <>
                {/* --- Updated Order --- */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">

                  {/* 1. CURRENT WEEK */}
                  <InfoPill 
                    isDark={isDark}
                    icon={<FaCalendarAlt />}
                    label="Current Week"
                    value={`Week ${batchInfo.calculatedWeek || "N/A"}`}
                  />

                  {/* 2. TODAY (DATE + DAY) */}
                  <InfoPill 
                    isDark={isDark}
                    icon={<FaChalkboardTeacher />}
                    label="Today"
                    value={todayStr}
                  />

                   <InfoPill 
                  isDark={isDark}
                  icon={<FaClock />}
                  label="Timings"
                  value={
                    batchInfo.startTime 
                      ? `${batchInfo.startTime} - ${batchInfo.endTime}` 
                      : "N/A"
                  }
                />

                  {/* 3. TIMINGS */}
                  <InfoPill 
                    isDark={isDark}
                    icon={<FaClock />}
                    label="Timings"
                    value={
                      batchInfo.startTime 
                        ? `${batchInfo.startTime} - ${batchInfo.endTime}` 
                        : "N/A"
                    }
                  />

                  {/* 4. NEXT CLASS DATE (ALWAYS) */}
                  <InfoPill 
                    isDark={isDark}
                    icon={<FaMapMarkerAlt />}
                    label="Next Class"
                    value={nextClassValue}
                  />

                </div>

                {/* --- Topic Section --- */}
                <div 
                  className="p-4 rounded-2xl border mb-6 flex-grow"
                  style={{
                    backgroundColor: `var(${isDark ? "--bg-dark" : "rgba(0,0,0,0.02)"})`,
                    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
                  }}
                >
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-1 text-[var(--accent-purple)]">
                    Learning Focus
                  </h4>
                  <h3 className="text-xl font-bold mb-1">
                    {batchInfo.weekTitle || "No topic scheduled"}
                  </h3>
                  <p className="opacity-70 text-sm max-w-3xl line-clamp-2">
                    {batchInfo.weekDescription || "Check back later for details."}
                  </p>
                </div>

                {/* --- Action Buttons --- */}
                <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                  <button 
                    className="flex-1 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition"
                    style={{ background: "linear-gradient(90deg,#8B5CF6,#6D28D9)" }}
                    onClick={() => navigate("asktoai")}
                  >
                    ✨ Open AI Chat
                  </button>
                  <button 
                    className="flex-1 py-3 rounded-xl font-bold text-sm border"
                    style={{ 
                      borderColor: 'var(--accent-teal)', 
                      color: 'var(--accent-teal)',
                    }}
                    onClick={() => alert("Opening Replit...")}
                  >
                    Build with Replit →
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center opacity-50 text-sm">Select a batch to view details.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboardPage;
