import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaFileAlt, 
  FaPlus, 
  FaMinus, 
  FaSave,
  FaWifi,
  FaBan,
  FaUser,
  FaEnvelope,
  FaIdBadge,
  FaLayerGroup,
  FaPhone,
  FaUserFriends,
  FaUserTie 
} from "react-icons/fa";

// Import the API functions
import { getStudentFullHistory, updateStudentCreditWallet } from "../api.js"; 

// --- Individual History Row Component ---
const HistoryRow = ({ item, isDark }) => {
  return (
    <div 
      className="group relative flex items-center p-4 border-b transition-all duration-150"
      style={{
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`
      }}
    >
      <div className="w-1/12 text-center">
        {item.isBadPrompt ? (
          <FaTimesCircle className="text-red-500 text-xl" title="Bad Prompt" />
        ) : (
          <FaCheckCircle className="text-green-500 text-xl" title="Good Prompt" />
        )}
      </div>
      <div className="w-4/12 px-4">
        <p className="truncate">{item.prompt}</p>
      </div>
      <div className="w-5/12 px-4">
        <p 
          className="truncate" 
          style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
        >
          {item.response || "No response (Bad Prompt)"}
        </p>
      </div>
      <div 
        className="w-2/12 px-4 text-xs" 
        style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
      >
        {new Date(item.createdAt).toLocaleString()}
      </div>

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

// --- Credit Card Component ---
const CreditControlCard = ({ title, value, type, onAdjust, icon: Icon, isDark }) => {
  return (
    <div 
      className="flex flex-col p-5 rounded-2xl border shadow-lg flex-1"
      style={{
        backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-full ${type === 'online' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
          <Icon className="text-xl" />
        </div>
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      
      <div className="flex items-center justify-between mt-auto">
        <span className="text-sm opacity-70">Remaining:</span>
        
        <div className="flex items-center gap-3 bg-opacity-10 rounded-lg p-1"
             style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
          
          <button 
            onClick={() => onAdjust(type, -1)}
            disabled={value <= 0}
            className={`p-2 rounded-md transition-colors ${value <= 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-red-100 hover:text-red-600'}`}
          >
            <FaMinus size={12} />
          </button>

          <span className="font-mono text-xl font-bold w-20 text-center">{value}</span>

          <button 
            onClick={() => onAdjust(type, 1)}
            className="p-2 rounded-md transition-colors hover:bg-green-100 hover:text-green-600"
          >
            <FaPlus size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Helper Component for Detail Items ---
const DetailItem = ({ icon: Icon, label, value, isDark }) => (
  <div className="flex items-start gap-3 p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5">
    <div className="mt-1 opacity-50"><Icon /></div>
    <div className="overflow-hidden">
      <p className="text-xs uppercase tracking-wider opacity-60 mb-0.5">{label}</p>
      <p className="font-medium text-base truncate" title={value} style={{ color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`}}>
        {value || "N/A"}
      </p>
    </div>
  </div>
);

// --- Main Page Component ---
const StudentPromptHistory = () => {
  const { isDark } = useOutletContext();
  const { studentId } = useParams();
  const navigate = useNavigate();
  
  // Data States
  const [chats, setChats] = useState([]);
  const [studentDetails, setStudentDetails] = useState(null);
  const [parentDetails, setParentDetails] = useState(null);
  
  // Credit States
  const [credits, setCredits] = useState({ online: 0, offline: 0 });
  const [initialCredits, setInitialCredits] = useState({ online: 0, offline: 0 });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!studentId) {
      setIsLoading(false);
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      const response = await getStudentFullHistory(studentId);
      
      if (response.success) {
        setChats(response.data.chats || []);
        
        const fetchedCredits = response.data.credit || { online: 0, offline: 0 };
        setCredits(fetchedCredits);
        setInitialCredits(fetchedCredits);

        setStudentDetails(response.data.studentDetails || {});
        setParentDetails(response.data.parentDetails);
        
      } else {
        alert(response.message);
      }
      setIsLoading(false);
    };

    fetchHistory();
  }, [studentId]);

  const handleCreditAdjust = (type, direction) => {
    const step = type === 'online' ? 1500 : 1500;
    const change = step * direction;

    setCredits(prev => {
      const newValue = prev[type] + change;
      const finalValue = newValue < 0 ? 0 : newValue;
      return { ...prev, [type]: finalValue };
    });
  };

  // --- UPDATED API CALL LOGIC WITH CONFIRMATION ---
  const handleUpdateCredits = async () => {
    if (!studentDetails || !studentDetails.student_number) {
      alert("Missing student information (Roll Number). Cannot update credits.");
      return;
    }

    // 1. Construct Confirmation Message
    const confirmMessage = 
      `Are you sure you want to update credits?\n\n` +
      `Online: ${initialCredits.online} → ${credits.online}\n` +
      `Offline: ${initialCredits.offline} → ${credits.offline}`;

    // 2. Show Alert
    const isConfirmed = window.confirm(confirmMessage);
    if (!isConfirmed) return; // Stop if cancelled

    setIsSaving(true);

    // 3. Proceed with API Call
    const response = await updateStudentCreditWallet(
      studentId,                     
      studentDetails.student_number, 
      credits.online,                
      credits.offline                
    );
    
    if (response.success) {
      alert(response.message);
      setInitialCredits(credits); // Disable button until changed again
    } else {
      alert("Error: " + response.message);
    }

    setIsSaving(false);
  };

  const cardStyle = {
    backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
    backdropFilter: "blur(10px)"
  };

  const hasChanges = credits.online !== initialCredits.online || credits.offline !== initialCredits.offline;
  const hasParent = parentDetails && typeof parentDetails === 'object';

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/admin/dashboard/student")}
          className="p-3 rounded-full transition"
          style={{ backgroundColor: `var(${isDark ? "--card-dark" : "--border-light"})`}}
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-3xl font-bold">Student Profile & History</h1>
      </div>

      {isLoading ? (
        <p>Loading data...</p>
      ) : (
        <div className="flex flex-col gap-6">
          
          {/* 1. Student Details Section */}
          <div className="rounded-2xl border shadow-lg p-6" style={cardStyle}>
            <div className="flex items-center gap-3 mb-6 border-b pb-4" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
              <FaIdBadge className="text-2xl text-[var(--accent-teal)]" />
              <h2 className="text-xl font-bold">Student Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4">
              <DetailItem icon={FaUser} label="Student Name" value={studentDetails?.name} isDark={isDark} />
              <DetailItem icon={FaEnvelope} label="Student Email" value={studentDetails?.email} isDark={isDark} />
              <DetailItem icon={FaIdBadge} label="Student Number" value={studentDetails?.student_number} isDark={isDark} />
              <DetailItem icon={FaPhone} label="Student Mobile" value={studentDetails?.mobile} isDark={isDark} />
              <DetailItem icon={FaLayerGroup} label="Class" value={studentDetails?.class ? `Class ${studentDetails.class}` : "N/A"} isDark={isDark} />
              
              {!hasParent ? (
                 <DetailItem 
                   icon={FaUserFriends} 
                   label="Parent Status" 
                   value={parentDetails || "Not Linked"} 
                   isDark={isDark} 
                 />
              ) : (
                 <>
                   <DetailItem icon={FaUserTie} label="Parent Name" value={parentDetails.name} isDark={isDark} />
                   <DetailItem icon={FaEnvelope} label="Parent Email" value={parentDetails.email} isDark={isDark} />
                   <DetailItem icon={FaPhone} label="Parent Mobile" value={parentDetails.mobile} isDark={isDark} />
                 </>
              )}
            </div>
          </div>

          {/* 2. Credits Section */}
          <div className="flex flex-col md:flex-row gap-6">
            <CreditControlCard 
              title="Online Credits"
              value={credits.online}
              type="online"
              onAdjust={handleCreditAdjust}
              icon={FaWifi}
              isDark={isDark}
            />

            <CreditControlCard 
              title="Offline Credits"
              value={credits.offline}
              type="offline"
              onAdjust={handleCreditAdjust}
              icon={FaBan}
              isDark={isDark}
            />

            <div className="flex items-end">
            <button
  onClick={handleUpdateCredits}
  disabled={!hasChanges || isSaving}
  className={`
    flex items-center gap-2 px-8 py-4 rounded-xl font-bold shadow-lg transition-all
    ${!hasChanges 
      ? 'opacity-60 cursor-not-allowed bg-sky-300 text-white' // Sky blueish when disabled (no changes)
      : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'} // Blueish when clickable
  `}
>
  {isSaving ? "Updating..." : <><FaSave /> Update Credits</>}
</button> 
            </div>
          </div>

          <hr style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`, opacity: 0.3 }} />

          {/* 3. History Section */}
          {chats.length === 0 ? (
            <div className="p-8 rounded-2xl border text-center" style={cardStyle}>
              <FaFileAlt className="text-5xl mx-auto mb-6 text-[var(--accent-teal)]" />
              <h2 className="text-2xl font-bold mb-2">No History Found</h2>
              <p style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
                This student has not submitted any prompts to the AI.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border overflow-hidden shadow-xl" style={cardStyle}>
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
              
              <div>
                {chats.map((item, index) => (
                  <HistoryRow key={item._id || index} item={item} isDark={isDark} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentPromptHistory;