import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { getLiveBatchInfoTeacherMajor } from '../api.js';

// --- Inline SVG Icons (Unchanged) ---
const FaLayerGroupIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="1em" height="1em" fill="currentColor" className={className}>
    <path d="M265.8 60.5c14-8 31-8 44.9 0l192 110.1c9.2 5.3 14.3 15 13.5 25.5s-8.8 19.6-19.1 22.8l-192 60c-5.7 1.8-11.8 1.8-17.6 0l-192-60c-10.2-3.2-18.3-12.3-19.1-22.8s4.3-20.2 13.5-25.5l192-110.1zM46.9 245.1l16.3 5.1 176.4 55.1c18.5 5.8 38.3 5.8 56.8 0l176.4-55.1 16.3-5.1c12.9-4 26.7 3 30.7 15.9s-3 26.7-15.9 30.7l-16.3 5.1-176.4 55.1c-13.4 4.2-27.6 4.2-41 0L94.6 296.7l-16.3-5.1C65.4 287.6 51.6 294.6 47.6 307.5s3 26.7 15.9 30.7l16.3 5.1 176.4 55.1c18.5 5.8 38.3 5.8 56.8 0l176.4-55.1 16.3-5.1c12.9-4 26.7 3 30.7 15.9s-3 26.7-15.9 30.7l-16.3 5.1-176.4 55.1c-33.8 10.6-69.9 10.6-103.7 0L46.9 385.1c-12.9-4-19.9-17.8-15.9-30.7s17.8-19.9 30.7-15.9z"/>
  </svg>
);
const FaMapMarkerAltIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="1em" height="1em" fill="currentColor" className={className}>
    <path d="M172.3 501.7C27 291 0 269.4 0 192 0 86 86 0 192 0s192 86 192 192c0 77.4-27 99-172.3 309.7-9.5 13.8-29.9 13.8-39.5 0zM192 272c44.2 0 80-35.8 80-80s-35.8-80-80-80-80 35.8-80 80 35.8 80 80 80z"/>
  </svg>
);
const FaCalendarAltIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="1em" height="1em" fill="currentColor" className={className}>
    <path d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm128 80c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H144c-8.8 0-16-7.2-16-16V272zm128 0c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V272zM128 368c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H144c-8.8 0-16-7.2-16-16V368zm128 0c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V368z"/>
  </svg>
);
const FaBoltIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="1em" height="1em" fill="currentColor" className={className}>
    <path d="M296 160H180.6l42.6-129.8C227.2 15 215.7 0 200 0H56C44 0 33.8 8.9 32.2 20.8l-32 240C-1.7 275.2 25.2 288 40 288h115.4l-42.6 129.8C108.8 432.6 120.3 448 136 448h144c12 0 22.2-8.9 23.8-20.8l32-240c1.9-14.4-25-27.2-39.8-27.2z"/>
  </svg>
);
const FaChevronRightIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="1em" height="1em" fill="currentColor" className={className}>
    <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/>
  </svg>
);
const FaGlobeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" width="1em" height="1em" fill="currentColor" className={className}>
    <path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm100.2 60.1c11.3 22.3 19 46.8 22.5 72.3-33.9 0-69 2.5-103.2 4.6-2.5-22.3-6.9-44-12.8-64.8 35.8-6.1 69.1-8.2 93.5-12.1zm-70.5-10.9c6.6 22 11.2 45.1 13.8 68.8-31 1.9-63.7 3.5-96 3.5s-65-1.6-96-3.5c2.6-23.7 7.2-46.8 13.8-68.8 26.2-1.9 57.3-3.6 82.2-3.6s56 1.7 82.2 3.6zM248 48c-23.7 0-46.7 5.2-67.9 14.5-3.8-14.6-6.4-29.4-7.5-44.1 24-2.8 49.6-4.4 75.4-4.4s51.4 1.6 75.4 4.4c-1.1 14.8-3.7 29.5-7.5 44.1C294.7 53.2 271.7 48 248 48z"/>
  </svg>
);

// --- Batch Card Component ---
const TeacherBatchCard = ({ batch, isDark, onClick }) => {
  const isOnline = batch.batchType === "ONLINE";

  return (
    <div 
      onClick={onClick}
      className="group relative p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden"
      style={{
        backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      }}
    >
      {/* Top Glow: Color changes based on Online/Offline */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isOnline ? 'from-blue-400 to-indigo-500' : 'from-orange-400 to-red-500'}`}></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span 
            className={`p-3 rounded-full bg-opacity-10 ${isOnline ? 'bg-blue-500 text-blue-400' : 'bg-orange-500 text-orange-400'}`}
          >
            <FaLayerGroupIcon />
          </span>
          <div>
            <h3 className="text-xl font-bold" style={{ color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }}>
              {batch.batchName}
            </h3>
            
            {/* Live Status + Type */}
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-bold text-green-500 tracking-wider">LIVE</span>
              <span className="text-[10px] opacity-50">|</span>
              <span className={`text-xs font-bold tracking-wider ${isOnline ? 'text-blue-500' : 'text-orange-500'}`}>
                {batch.batchType}
              </span>
            </div>
          </div>
        </div>
        <FaBoltIcon className="text-xl text-yellow-400 opacity-80" />
      </div>

      {/* Info Section */}
      <div className="space-y-3 mb-6">
        <p className="text-sm flex items-center gap-2 opacity-80" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})` }}>
          <span className="px-2 py-0.5 rounded border text-[10px] uppercase font-semibold opacity-70" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`}}>
            {batch.level}
          </span>
        </p>

        {/* Description (truncated) */}
        <p className="text-xs line-clamp-2 opacity-60" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})` }}>
            {batch.description}
        </p>
        
        <div 
          className="p-3 rounded-xl grid grid-cols-1 gap-2"
          style={{ backgroundColor: `var(${isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.05)"})` }}
        >
          {/* Location Logic */}
          <p className="text-xs flex items-center gap-2 font-medium" style={{ color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }}>
            {isOnline ? (
              <>
                <FaGlobeIcon className="text-blue-400" /> 
                Remote / Online Class
              </>
            ) : (
              <>
                <FaMapMarkerAltIcon className="text-red-400" /> 
                {batch.classLocation}, {batch.cityCode}
              </>
            )}
          </p>

          <p className="text-xs flex items-center gap-2 font-medium" style={{ color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }}>
            <FaCalendarAltIcon className="text-[var(--accent-teal)]" /> 
            Started: {new Date(batch.startDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Footer Action */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
        <span className="text-xs font-medium opacity-60" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})` }}>
          Manage Batch
        </span>
        <button className="p-2 rounded-full transition-colors hover:bg-white/10 text-[var(--accent-teal)]">
          <FaChevronRightIcon />
        </button>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const TeacherAllLiveBatchesPage = () => {
  const { isDark } = useOutletContext();
  const navigate = useNavigate();
  
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      setIsLoading(true);
      const response = await getLiveBatchInfoTeacherMajor();
      
      if (response.success) {
        setBatches(response.data);
      } else {
        if (response.message !== "No live batches found.") {
          console.error(response.message);
        }
      }
      setIsLoading(false);
    };

    fetchBatches();
  }, []);

  const handleBatchClick = (batchObjId) => {
    // Navigate using batch_obj_id
    navigate(`/teacher/dashboard/batches/${batchObjId}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">My Live Batches</h1>
        <p className="text-lg opacity-70" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})` }}>
          Overview of all your currently active cohorts.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-teal)]"></div>
        </div>
      ) : batches.length === 0 ? (
        <div 
          className="p-12 rounded-2xl border border-dashed text-center"
          style={{ 
            borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
            backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`
          }}
        >
          <FaLayerGroupIcon className="text-5xl mx-auto mb-4 opacity-30" />
          <h2 className="text-xl font-bold mb-2">No Live Batches</h2>
          <p className="opacity-60">You don't have any batches marked as LIVE right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {batches.map((batch) => (
            <TeacherBatchCard 
              key={batch.batch_obj_id} // Used batch_obj_id as key
              batch={batch} 
              isDark={isDark} 
              onClick={() => handleBatchClick(batch.batch_obj_id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherAllLiveBatchesPage;