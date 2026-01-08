import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  FaQuestionCircle, 
  FaCheckCircle, 
  FaUser, 
  FaClock, 
  FaLayerGroup, 
  FaEnvelope,
  FaCheck
} from "react-icons/fa";
import { getUnresolvedDoubts, resolveDoubt } from "../api.js";

// --- Helper: Doubt Row Component ---
const DoubtRow = ({ doubt, isDark, onResolve }) => {
  const [isResolving, setIsResolving] = useState(false);

  const handleResolveClick = async () => {
    if (!window.confirm("Are you sure you want to mark this doubt as resolved?")) return;
    
    setIsResolving(true);
    const success = await onResolve(doubt._id);
    if (!success) setIsResolving(false); // Only reset loading if it failed
  };

  return (
    <div 
      className="group relative p-5 rounded-xl border transition-all hover:shadow-md mb-4"
      style={{
        backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      }}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        
        {/* Left Side: Content & Info */}
        <div className="flex-grow min-w-0">
          {/* Header: Batch & Student */}
          <div className="flex flex-wrap items-center gap-3 mb-2 text-xs font-bold uppercase tracking-wider opacity-70">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FaLayerGroup /> {doubt.batchId}
            </span>
            <span className="flex items-center gap-1">
              <FaUser /> {doubt.student_number} • {doubt.studentName}
            </span>
            <span className="flex items-center gap-1">
              <FaClock /> {new Date(doubt.createdAt).toLocaleString()}
            </span>
          </div>

          {/* Doubt Content (Truncated) */}
          <p className="text-base font-medium line-clamp-2 mb-1">
            {doubt.doubt_content}
          </p>
          <p className="text-xs opacity-50 italic group-hover:opacity-100 transition-opacity">
            Hover to see full content
          </p>
        </div>

        {/* Right Side: Action Button */}
        <div className="flex-shrink-0 self-start">
          <button
            onClick={handleResolveClick}
            disabled={isResolving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs text-white transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))" }}
          >
            {isResolving ? (
              "Resolving..."
            ) : (
              <>
                <FaCheck /> Mark Resolved
              </>
            )}
          </button>
        </div>
      </div>

      {/* --- Hover Tooltip for Full Content --- */}
      <div 
        className="absolute left-0 top-full mt-2 w-full md:w-[600px] p-4 rounded-xl border shadow-2xl z-20 hidden group-hover:block"
        style={{
          backgroundColor: `var(${isDark ? "--bg-dark" : "white"})`,
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        }}
      >
        <h4 className="font-bold text-sm mb-2 text-[var(--accent-teal)]">Full Doubt Content:</h4>
        <p className="text-sm whitespace-pre-wrap leading-relaxed">
          {doubt.doubt_content}
        </p>
        
        <div className="mt-4 pt-4 border-t flex justify-between items-center text-xs opacity-60" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`}}>
          <span>Student Email: {doubt.studentEmail}</span>
          <span>ID: {doubt._id}</span>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const TeacherDoubtsPage = () => {
  const { isDark } = useOutletContext();
  const [doubts, setDoubts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDoubts = async () => {
    setIsLoading(true);
    // Fetch ALL unresolved doubts (no batchId filter for now)
    const response = await getUnresolvedDoubts();
    
    if (response.success) {

        // console.log(response.data )
      setDoubts(response.data);
    } else {
      // Only alert if it's a real error, not just empty list
      if (response.message !== "Unresolved doubts retrieved.") { 
         // alert(response.message); // Optional: suppress if standard empty response
      }
      if (response.data) setDoubts(response.data); // Sometimes data is [] even on 'error' message in some APIs
      else setDoubts([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDoubts();
  }, []);

  const handleResolve = async (doubtId) => {
    const response = await resolveDoubt(doubtId);
    
    if (response.success) {
      // Optimistically remove from list
      setDoubts(prev => prev.filter(d => d._id !== doubtId));
      // alert(response.message); // Optional success alert
      return true;
    } else {
      alert(response.message);
      return false;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          Student Doubts 
          <span className="text-sm font-bold bg-red-500 text-white px-3 py-1 rounded-full animate-pulse">
            {doubts.length} Pending
          </span>
        </h1>
        <p className="text-lg opacity-70 mt-1">
          Review and resolve questions from your students.
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <p className="text-lg opacity-60">Loading doubts...</p>
      ) : doubts.length === 0 ? (
        <div 
          className="p-12 rounded-2xl border border-dashed text-center opacity-60"
          style={{ 
            borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
            backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`
          }}
        >
          <FaCheckCircle className="text-5xl mx-auto mb-4 text-green-500" />
          <h2 className="text-xl font-bold mb-2">All Caught Up!</h2>
          <p>There are no unresolved doubts at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {doubts.map(doubt => (
            <DoubtRow 
              key={doubt._id} 
              doubt={doubt} 
              isDark={isDark} 
              onResolve={handleResolve} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherDoubtsPage;