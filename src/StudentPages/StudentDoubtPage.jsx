import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
// --- Inline SVG Icons to avoid dependency issues ---
const FaQuestionCircleIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor" className={className}>
    <path d="M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248zM262.655 90c-54.497 0-89.255 22.957-116.549 63.758-3.536 5.286-2.353 12.415 2.715 16.258l34.699 26.31c5.205 3.947 12.621 3.008 16.665-2.122 17.864-22.658 30.113-35.797 57.303-35.797 20.429 0 45.698 13.148 45.698 32.958 0 14.976-12.363 22.667-32.534 33.976C247.128 238.528 216 254.941 216 296v4c0 6.627 5.373 12 12 12h56c6.627 0 12-5.373 12-12v-1.333c0-28.462 83.186-29.647 83.186-106.667 0-58.002-60.165-102-116.531-102zM256 338c-25.365 0-46 20.635-46 46 0 25.364 20.635 46 46 46s46-20.636 46-46c0-25.365-20.635-46-46-46z"/>
  </svg>
);
const FaPlusIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="1em" height="1em" fill="currentColor" className={className}>
    <path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"/>
  </svg>
);
const FaTimesIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="1em" height="1em" fill="currentColor" className={className}>
    <path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L109.3 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L210.7 256 310.6 150.6z"/>
  </svg>
);
const FaCheckCircleIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor" className={className}>
    <path d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628 0z"/>
  </svg>
);
const FaClockIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor" className={className}>
    <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm61.8-104.4l-84.9-61.7c-3.1-2.3-4.9-5.9-4.9-9.7V116c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v141.7l66.8 48.6c5.4 3.9 6.5 11.4 2.6 16.8L334.6 349c-3.9 5.3-11.4 6.5-16.8 2.6z"/>
  </svg>
);
const FaChevronDownIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="1em" height="1em" fill="currentColor" className={className}>
    <path d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"/>
  </svg>
);
const FaChevronUpIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="1em" height="1em" fill="currentColor" className={className}>
    <path d="M240.971 130.524l194.343 194.343c9.373 9.373 9.373 24.569 0 33.941l-22.667 22.667c-9.357 9.357-24.522 9.375-33.901.04L224 227.495 69.255 381.516c-9.379 9.335-24.544 9.317-33.901-.04l-22.667-22.667c-9.373-9.373-9.373-24.569 0-33.941L207.03 130.525c9.372-9.372 24.568-9.372 33.941-.001z"/>
  </svg>
);
// --- End SVG Icons ---

import { getMyDoubts, raiseDoubt, getMyLiveBatches } from '../api.js';

// --- Modal to Raise Doubt ---
const RaiseDoubtModal = ({ isOpen, onClose, isDark, onDoubtRaised }) => {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch batches for dropdown when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchBatches = async () => {
        const response = await getMyLiveBatches();
        if (response.success) {
          setBatches(response.data);
          // Select first batch by default
          if (response.data.length > 0) {
            setSelectedBatchId(response.data[0].batchId);
          }
        }
      };
      fetchBatches();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBatchId || !content.trim()) return;

    setIsSubmitting(true);
    const response = await raiseDoubt(selectedBatchId, content);
    setIsSubmitting(false);

    alert(response.message);
    if (response.success) {
      onDoubtRaised(); // Refresh list
      setContent("");
      onClose();
    }
  };

  if (!isOpen) return null;

  const inputStyle = {
    backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
    color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)" }}
    >
      <div 
        className="relative w-full max-w-lg p-8 rounded-2xl border shadow-2xl"
        style={{
          backgroundColor: `var(${isDark ? "--card-dark" : "#fff"})`,
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
          color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
        }}
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-xl opacity-60 hover:opacity-100"><FaTimesIcon /></button>
        
        <h2 className="text-2xl font-bold mb-6">Ask a Doubt</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 opacity-80">Select Batch</label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border appearance-none"
              style={inputStyle}
              required
            >
              <option value="" disabled>Select a batch</option>
              {batches.map(b => (
                <option key={b.batchId} value={b.batchId}>{b.batchId}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 opacity-80">Your Doubt</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border min-h-[150px]"
              style={inputStyle}
              placeholder="Describe your doubt clearly..."
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl font-semibold border opacity-70 hover:opacity-100 transition" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-xl font-bold text-white transition shadow-lg hover:scale-105" style={{ background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))", opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? "Submitting..." : "Ask Doubt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Doubt Card ---
const DoubtCard = ({ doubt, isDark }) => {
  const isResolved = doubt.isresolved;
  const statusColor = isResolved ? "text-green-400" : "text-yellow-400";
  const statusBg = isResolved ? "bg-green-500" : "bg-yellow-500";

  return (
    <div 
      className="p-5 rounded-2xl border mb-4 transition hover:shadow-md"
      style={{
        backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 rounded-md text-xs font-bold bg-opacity-10 bg-blue-500 text-white-400 border border-blue-500/30">
            {doubt.batchId}
          </span>
          <span className="text-xs opacity-50 font-mono">ID: {doubt._id.slice(-6)}</span>
        </div>
        <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${statusColor}`}>
          <span className={`w-2 h-2 rounded-full ${statusBg}`}></span>
          {isResolved ? "Resolved" : "Pending"}
        </div>
      </div>

      <p className="text-base leading-relaxed mb-4 whitespace-pre-wrap">
        {doubt.doubt_content}
      </p>

      <div className="flex items-center gap-2 text-xs opacity-60">
        <FaClockIcon />
        {new Date(doubt.createdAt).toLocaleString()}
      </div>
    </div>
  );
};

// --- Main Page ---
const StudentDoubtsPage = () => {
  const { isDark } = useOutletContext();
  const [doubts, setDoubts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDoubts = async () => {
    setIsLoading(true);
    const response = await getMyDoubts();
    if (response.success) {
      setDoubts(response.data);
    } else {
      // alert(response.message);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDoubts();
  }, []);

  const unresolvedDoubts = doubts.filter(d => !d.isresolved);
  const resolvedDoubts = doubts.filter(d => d.isresolved);

  return (
    <div className="pb-20 relative">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            My Doubts <FaQuestionCircleIcon className="text-[var(--accent-purple)] opacity-80"/>
          </h1>
          <p className="text-sm opacity-60 mt-1">Ask questions to your teachers and track responses.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white shadow-lg transition hover:scale-105"
          style={{ background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))" }}
        >
          <FaPlusIcon /> Ask a Doubt
        </button>
      </div>

      {isLoading ? (
        <p className="text-lg opacity-60">Loading doubts...</p>
      ) : (
        <>
          {/* Unresolved Section */}
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4 text-yellow-400 flex items-center gap-2">
              Pending Resolution ({unresolvedDoubts.length})
            </h2>
            {unresolvedDoubts.length > 0 ? (
              unresolvedDoubts.map(doubt => <DoubtCard key={doubt._id} doubt={doubt} isDark={isDark} />)
            ) : (
              <div className="p-8 rounded-xl border border-dashed text-center opacity-50" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
                No pending doubts! You're all caught up.
              </div>
            )}
          </section>

          {/* Resolved Section Toggle */}
          <div className="border-t pt-8" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
            <button 
              onClick={() => setShowResolved(!showResolved)}
              className="flex items-center gap-2 font-bold text-lg mb-4 transition hover:opacity-80"
              style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})` }}
            >
              {showResolved ? <FaChevronUpIcon /> : <FaChevronDownIcon />}
              {showResolved ? "Hide" : "Show"} Resolved Doubts ({resolvedDoubts.length})
            </button>

            {showResolved && (
              <div className="animate-fadeIn">
                {resolvedDoubts.length > 0 ? (
                  resolvedDoubts.map(doubt => <DoubtCard key={doubt._id} doubt={doubt} isDark={isDark} />)
                ) : (
                  <p className="opacity-50 italic">No resolved doubts yet.</p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <RaiseDoubtModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onDoubtRaised={fetchDoubts} 
        isDark={isDark} 
      />
    </div>
  );
};

export default StudentDoubtsPage;