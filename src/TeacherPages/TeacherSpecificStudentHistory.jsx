import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaFileAlt } from "react-icons/fa";
// Assuming api.js is in the parent directory
import { getStudentFullHistory } from "../api.js"; 

// --- Individual History Row Component ---
const HistoryRow = ({ item, isDark }) => {
  const [worksheetTitle, setWorksheetTitle] = useState(item.worksheetId ? item.worksheetId : 'N/A');
  
  // This is a simple hover-based tooltip
  // We use 'group' on the parent and 'group-hover:...' on the child
  return (
    <div 
      className="group relative flex items-center p-4 border-b transition-all duration-150"
      style={{
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`
      }}
    >
      {/* 1. Status Icon */}
      <div className="w-1/12 text-center">
        {item.isBadPrompt ? (
          <FaTimesCircle className="text-red-500 text-xl" title="Bad Prompt" />
        ) : (
          <FaCheckCircle className="text-green-500 text-xl" title="Good Prompt" />
        )}
      </div>
      
      {/* 2. Prompt (Truncated) */}
      <div className="w-4/12 px-4">
        <p className="truncate">{item.prompt}</p>
      </div>
      
      {/* 3. Response (Truncated) */}
      <div className="w-5/12 px-4">
        <p 
          className="truncate" 
          style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
        >
          {item.response || "No response (Bad Prompt)"}
        </p>
      </div>
      
      {/* 4. Date */}
      <div 
        className="w-2/12 px-4 text-xs" 
        style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
      >
        {new Date(item.createdAt).toLocaleString()}
      </div>

      {/* 5. The Hover Tooltip */}
      <div 
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-96 p-4
                   hidden group-hover:block z-20 
                   rounded-lg shadow-xl"
        style={{
          backgroundColor: `var(${isDark ? "--bg-dark" : "white"})`,
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
          borderWidth: "1px"
        }}
      >
        <h4 className="font-bold mb-1">Full Prompt:</h4>
        <p className="text-sm mb-3 whitespace-pre-wrap">{item.prompt}</p>
        <h4 className="font-bold mb-1">Full Response:</h4>
        <p 
          className="text-sm whitespace-pre-wrap" 
          style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
        >
          {item.response || "No response (Bad Prompt)"}
        </p>
        <div 
          className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent 
                     border-t-8 absolute top-full left-1/2 -translate-x-1/2"
          style={{ borderTopColor: `var(${isDark ? "--border-dark" : "--border-light"})`}}
        ></div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const StudentPromptHistory = () => {
  const { isDark } = useOutletContext();
  const { studentId } = useParams();
  const navigate = useNavigate();
  
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setIsLoading(false);
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      const response = await getStudentFullHistory(studentId);
      
      if (response.success) {
        setHistory(response.data);
      } else {
        alert(response.message);
      }
      setIsLoading(false);
    };

    fetchHistory();
  }, [studentId]);

  const cardStyle = {
    backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
    backdropFilter: "blur(10px)"
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/teacher/dashboard/students")} // Go back to student list
          className="p-3 rounded-full transition"
          style={{ backgroundColor: `var(${isDark ? "--card-dark" : "--border-light"})`}}
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-3xl font-bold">Student Prompt History</h1>
      </div>

      {/* Content */}
      {isLoading ? (
        <p>Loading history...</p>
      ) : history.length === 0 ? (
        // Empty State
        <div 
          className="p-8 rounded-2xl border text-center"
          style={cardStyle}
        >
          <FaFileAlt className="text-5xl mx-auto mb-6 text-[var(--accent-teal)]" />
          <h2 className="text-2xl font-bold mb-2">No History Found</h2>
          <p style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
            This student has not submitted any prompts to the AI.
          </p>
        </div>
      ) : (
        // Data List (Table)
        <div 
          className="rounded-2xl border overflow-hidden shadow-xl" 
          style={cardStyle}
        >
          {/* Table Header */}
          <div 
            className="flex items-center p-4 text-sm uppercase"
            style={{ 
              color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`,
              borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
              borderBottomWidth: "1px"
            }}
          >
            <div className="w-1/12 text-center">Status</div>
            <div className="w-4/12 px-4">Prompt</div>
            <div className="w-5/12 px-4">Response</div>
            <div className="w-2/12 px-4">Time</div>
          </div>
          
          {/* Table Body */}
          <div>
            {history.map((item, index) => (
              <HistoryRow 
                key={index} // Using index as key is okay if list is not re-ordered
                item={item} 
                isDark={isDark} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPromptHistory;