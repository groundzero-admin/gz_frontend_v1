import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate, useLocation } from 'react-router-dom';
// --- FIX: Corrected import path ---
import { getBatchDetailsForTeacher } from "../api.js";

// --- SVG Icons (Inline to avoid dependency errors) ---
const FaArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16" fill="currentColor">
    <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0 73.4-73.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
  </svg>
);
const FaCalendarWeekIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="1em" height="1em" fill="currentColor" className={className}>
    <path d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm128 80c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H144c-8.8 0-16-7.2-16-16V272zm128 0c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V272zM128 368c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H144c-8.8 0-16-7.2-16-16V368zm128 0c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V368z"/>
  </svg>
);
const FaUserGraduateIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="1em" height="1em" fill="currentColor" className={className}>
    <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zM209.1 359.2c-15.1-10.7-32.2-17.2-51.1-20.5V308.2c12.4 4.1 25.3 7 38.6 8.9c20.3 3 39.5 1.5 57.4-4.5c11.3-3.8 21.6-8.6 30.6-14.1l-19.6 34.8c-13.4 23.8-38.5 38.9-66.1 38.9c-2.8 0-5.5-.1-8.2-.4zM332.2 329.8c5.4-9.6 8.2-20.3 8.2-31.5c0-37.1-22.2-69.2-53.3-83.6c-24-11.2-50.5-17.7-79-20.6c-11.7-1.2-23.2-1.8-34.4-1.8c-11.2 0-22.7 .6-34.4 1.8c-28.5 2.9-55 9.4-79 20.6C30.2 229.1 8 261.2 8 298.3c0 11.2 2.9 21.9 8.2 31.5c6.3 11.4 15.3 21.3 26.5 29.2l11.4 8.1c8.8 6.3 18.2 11.9 28 16.5c20.9 10 44.5 15.1 69.8 15.1c21.2 0 41.6-4.1 60.8-12.1c11.3-4.7 21.8-10.4 31.4-17.2c9.6-6.8 18.5-14.6 26.5-23.5l11.4-8.1z"/>
  </svg>
);
const FaEnvelopeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
    <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/>
  </svg>
);
const FaIdBadgeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="1em" height="1em" fill="currentColor">
    <path d="M192 0c-41.8 0-77.4 26.7-90.5 64H64C28.7 64 0 92.7 0 128V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H282.5C269.4 26.7 233.8 0 192 0zm0 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM128 256a64 64 0 1 1 128 0 64 64 0 1 1 -128 0zm64 112c-52.2 0-98.3 27.2-123.8 68c-4.6-2.9-8.6-7.4-11.2-12.7C46.5 404.4 32 374.6 32 341.3c0-28.6 11-56.3 29.4-76.7c0 0 0 0 0 0c7.8-8.7 17.2-15.9 27.6-21c1.4 12.4 5.5 24 11.8 34.3c15.6 25.2 43.2 42.1 75.2 42.1s59.6-16.9 75.2-42.1c6.3-10.2 10.4-21.9 11.8-34.3c10.4 5.1 19.8 12.3 27.6 21c0 0 0 0 0 0c18.4 20.4 29.4 48.1 29.4 76.7c0 33.3-14.5 63.1-37 82c-2.6 5.3-6.6 9.8-11.2 12.7c-25.5-40.8-71.6-68-123.8-68z"/>
  </svg>
);
const FaCommentDotsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
    <path d="M448 0H64C28.7 0 0 28.7 0 64v288c0 35.3 28.7 64 64 64h96v84c0 9.8 11.2 15.5 19.1 9.7L304 416h144c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64zM128 240a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm128 0a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm128 0a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"/>
  </svg>
);
const FaChevronUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
    <path d="M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z"/>
  </svg>
);
const FaChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
    <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/>
  </svg>
);
// --- End SVG Icons ---

// --- Helper: Week Card ---
const WeekCard = ({ week, isDark }) => {
  const dayMap = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun' };
  const daysString = week.class_days.map(d => dayMap[d]).join(', ');

  return (
    <div 
      className="p-4 rounded-xl border flex items-start gap-4 transition-all"
      style={{
        backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      }}
    >
      <div 
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
        style={{ backgroundColor: `var(${isDark ? "--bg-dark" : "rgba(0,0,0,0.05)"})`, color: "var(--accent-teal)" }}
      >
        {week.week_number}
      </div>
      <div>
        <h4 className="font-bold text-base">{week.week_title}</h4>
        <p className="text-sm opacity-70 mt-1 mb-2">{week.description}</p>
        <div className="flex items-center gap-3 text-xs font-medium opacity-60">
           <span className="flex items-center gap-1"><FaCalendarWeekIcon className="text-sm"/> {daysString}</span>
           {week.startTime && <span>{week.startTime} - {week.endTime}</span>}
        </div>
      </div>
    </div>
  );
};

// --- Helper: Student Row ---
const StudentRow = ({ student, isDark }) => {
  const handleFeedback = () => {
    alert(`Feedback feature for ${student.name} will be implemented soon.`);
  };

  return (
    <div 
      className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md"
      style={{
        backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      }}
    >
      <div className="flex items-center gap-4 mb-4 md:mb-0">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ background: "linear-gradient(135deg, var(--accent-purple), var(--accent-teal))" }}
        >
          {student.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 className="font-bold text-base">{student.name}</h4>
          <div className="flex flex-wrap gap-3 text-xs opacity-70 mt-0.5">
            <span className="flex items-center gap-1"><FaEnvelopeIcon /> {student.email}</span>
            <span className="flex items-center gap-1"><FaIdBadgeIcon /> {student.student_number}</span>
          </div>
        </div>
      </div>

      <button 
        onClick={handleFeedback}
        className="px-4 py-2 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-2 hover:opacity-80"
        style={{
          borderColor: 'var(--accent-purple)',
          color: 'var(--accent-purple)',
          backgroundColor: `var(${isDark ? "rgba(139, 92, 246, 0.1)" : "transparent"})`
        }}
      >
        <FaCommentDotsIcon /> Give Feedback
      </button>
    </div>
  );
};

// --- Main Component ---
const TeacherSpecificBatchDetailPage = () => {
  const { isDark } = useOutletContext();
  const { batchId } = useParams(); // Note: This is the MongoDB _id
  const navigate = useNavigate();
  const location = useLocation();
  
  // Retrieve batch name (e.g. SPA001) from state if navigated from list
  const batchName = location.state?.batchStringId;
  
  const [batchData, setBatchData] = useState({ weeks: [], students: [], batchId: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [showWeeks, setShowWeeks] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const response = await getBatchDetailsForTeacher(batchId);
      
      if (response.success) {
        setBatchData(response.data);
      } else {
        console.error(response.message);
      }
      setIsLoading(false);
    };

    if (batchId) fetchData();
  }, [batchId]);

  // Decide what to show as the main batch identifier
  // Priority: 1. Data from API (batchData.batchId) 2. Data from Navigation State 3. "Batch Details"
  const displayBatchId = batchData.batchId || batchName;

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/teacher/dashboard/batches")} // Go back to list
          className="p-3 rounded-full transition"
          style={{ backgroundColor: `var(${isDark ? "--card-dark" : "--border-light"})`}}
        >
          <FaArrowLeftIcon />
        </button>
        <div>
          {/* --- UPDATED: Display Batch Name prominently --- */}
          <h1 className="text-3xl font-bold">Batch Details</h1>
          {displayBatchId && (
            <h2 className="text-xl font-extrabold mt-1" style={{ color: "var(--accent-teal)" }}>
              {displayBatchId}
            </h2>
          )}
          {/* Show ID for reference */}
          <p className="text-xs opacity-40 mt-1 font-mono">System ID: {batchId}</p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-lg opacity-70">Loading details...</p>
      ) : (
        <div className="space-y-8">
          
          {/* --- SECTION 1: WEEKS (Collapsible) --- */}
          <section>
            <button 
              onClick={() => setShowWeeks(!showWeeks)}
              className="w-full flex justify-between items-center p-4 rounded-xl border mb-4 transition hover:opacity-90"
              style={{
                backgroundColor: `var(${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"})`,
                borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
              }}
            >
              <div className="flex items-center gap-2 font-bold text-lg">
                <FaCalendarWeekIcon className="text-[var(--accent-teal)]" /> 
                Curriculum ({batchData.weeks.length} Weeks)
              </div>
              {showWeeks ? <FaChevronUpIcon /> : <FaChevronDownIcon />}
            </button>

            {showWeeks && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                {batchData.weeks.length > 0 ? (
                  batchData.weeks.map((week) => (
                    <WeekCard key={week._id} week={week} isDark={isDark} />
                  ))
                ) : (
                  <p className="p-4 opacity-60 italic">No weeks scheduled yet.</p>
                )}
              </div>
            )}
          </section>

          {/* --- SECTION 2: STUDENTS --- */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaUserGraduateIcon className="text-[var(--accent-purple)]" /> 
              Enrolled Students ({batchData.students.length})
            </h2>

            <div className="space-y-3">
              {batchData.students.length > 0 ? (
                batchData.students.map((student) => (
                  <StudentRow key={student.student_obj_id} student={student} isDark={isDark} />
                ))
              ) : (
                <div 
                  className="p-8 rounded-xl border border-dashed text-center opacity-60"
                  style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}
                >
                  No students enrolled in this batch yet.
                </div>
              )}
            </div>
          </section>

        </div>
      )}
    </div>
  );
};

export default TeacherSpecificBatchDetailPage;