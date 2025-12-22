import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { getBatchAndSessionDetailsForTeacher } from "../api.js";

// --- ICONS ---
import { 
  FaArrowLeft, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaLink, 
  FaUserGraduate, FaEnvelope, FaIdBadge, FaCommentDots,
  FaChevronUp, FaChevronDown, FaChalkboard, FaCopy, FaExternalLinkAlt,
  FaInfoCircle
} from "react-icons/fa";

// ----------------------------------------
// SESSION CARD (Updated with Google Classroom)
// ----------------------------------------
const SessionCard = ({ session, isDark }) => {
  const dateObj = new Date(session.date);
  const isUrl = session.meetingLinkOrLocation?.startsWith("http");

  // Helper to copy text
  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("Link copied to clipboard!");
  };

  return (
    <div
      className="group p-5 rounded-2xl border shadow-sm hover:shadow-lg transition-all relative overflow-hidden flex flex-col h-full"
      style={{
        backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      }}
    >
      {/* Accent Bar */}
      <div
        className="absolute left-0 top-0 h-full w-1 bg-[var(--accent-teal)]"
      />

      <div className="flex gap-4 mb-4">
        {/* Date Box */}
        <div
          className="flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center font-bold border text-center"
          style={{
            backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)",
            borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
          }}
        >
          <span className="text-xs uppercase opacity-60">
            {dateObj.toLocaleDateString(undefined, { month: "short" })}
          </span>
          <span className="text-xl">{dateObj.getDate()}</span>
        </div>

        {/* Title & Time */}
        <div className="flex-grow">
           <div className="flex justify-between items-start">
            <h4 className="font-bold text-lg leading-tight mb-1">
              {session.title}
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded border opacity-60 whitespace-nowrap">
              #{session.session_number}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-medium opacity-70">
            <FaClock />
            {session.startTime} - {session.endTime}
          </div>
        </div>
      </div>

      <p className="text-sm opacity-70 mb-5 flex-grow">{session.description}</p>

      {/* LINKS SECTION */}
      <div className="mt-auto space-y-3 pt-4 border-t" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
        
        {/* 1. Meeting Link / Location */}
        {session.meetingLinkOrLocation && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-black/5 dark:bg-white/5">
            <div className="flex items-center gap-2 text-xs overflow-hidden">
              {isUrl ? <FaLink className="text-blue-400 flex-shrink-0" /> : <FaMapMarkerAlt className="text-red-400 flex-shrink-0" />}
              <span className="truncate opacity-80" title={session.meetingLinkOrLocation}>
                 {isUrl ? "Meeting Link" : session.meetingLinkOrLocation}
              </span>
            </div>
            
            {isUrl && (
              <div className="flex gap-2">
                <button 
                  onClick={() => copyToClipboard(session.meetingLinkOrLocation)}
                  className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
                  title="Copy Link"
                >
                  <FaCopy size={12} />
                </button>
                <a
                  href={session.meetingLinkOrLocation}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1 text-[10px] font-bold px-2"
                >
                  JOIN <FaExternalLinkAlt size={8} />
                </a>
              </div>
            )}
          </div>
        )}

        {/* 2. Google Classroom Link */}
        {session.googleClassroomLink && (
           <div className="flex items-center justify-between p-2 rounded-lg bg-black/5 dark:bg-white/5">
             <div className="flex items-center gap-2 text-xs overflow-hidden">
               <FaChalkboard className="text-amber-500 flex-shrink-0" />
               <span className="truncate opacity-80">Classroom Material</span>
             </div>
             
             <div className="flex gap-2">
                <button 
                  onClick={() => copyToClipboard(session.googleClassroomLink)}
                  className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
                  title="Copy Link"
                >
                  <FaCopy size={12} />
                </button>
                <a
                  href={session.googleClassroomLink}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded bg-amber-600 text-white hover:bg-amber-700 flex items-center gap-1 text-[10px] font-bold px-2"
                >
                  OPEN <FaExternalLinkAlt size={8} />
                </a>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};

// ----------------------------------------
// STUDENT ROW
// ----------------------------------------
const StudentRow = ({ student, isDark }) => {
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
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
          style={{ background: "linear-gradient(135deg, var(--accent-purple), var(--accent-teal))" }}
        >
          {student.name.charAt(0).toUpperCase()}
        </div>

        <div>
          <h4 className="font-bold">{student.name}</h4>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-70">
            <span className="flex items-center gap-1">
              <FaEnvelope /> {student.email}
            </span>
            <span className="flex items-center gap-1">
              <FaIdBadge /> {student.student_number}
            </span>
            {student.joinedAt && (
                <span className="flex items-center gap-1 opacity-60">
                    Joined: {new Date(student.joinedAt).toLocaleDateString()}
                </span>
            )}
          </div>
        </div>
      </div>

      <button
        className="px-4 py-2 rounded-lg text-xs font-bold border flex items-center gap-2 hover:opacity-80"
        style={{
          borderColor: "var(--accent-purple)",
          color: "var(--accent-purple)",
        }}
      >
        <FaCommentDots /> Give Feedback
      </button>
    </div>
  );
};

// ----------------------------------------
// MAIN COMPONENT
// ----------------------------------------
const TeacherSpecificBatchDetailPage = () => {
  const { isDark } = useOutletContext();
  const { batchId } = useParams();
  const navigate = useNavigate();

  const [batchData, setBatchData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSessions, setShowSessions] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Pass the batch_obj_id (from URL params) to API
      const response = await getBatchAndSessionDetailsForTeacher(batchId);

      if (response.success) {
         setBatchData(response.data);
      } else {
         console.error(response.message);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [batchId]);

  // Safe check for data before rendering
  if (isLoading) return <div className="p-10 text-center animate-pulse">Loading batch details...</div>;
  if (!batchData) return <div className="p-10 text-center text-red-500">Batch not found or error loading data.</div>;

  return (
    <div className="pb-20">

      {/* HEADER SECTION (Expanded Info) */}
      <div className="flex flex-col gap-6 mb-8">
        
        {/* Navigation & Title */}
        <div className="flex items-center gap-4">
            <button
            onClick={() => navigate("/teacher/dashboard/batches")}
            className="p-3 rounded-full transition"
            style={{ backgroundColor: `var(${isDark ? "--card-dark" : "--border-light"})` }}
            >
            <FaArrowLeft />
            </button>
            <h1 className="text-3xl font-bold">Batch Details</h1>
        </div>

        {/* Batch Info Card */}
        <div 
            className="p-6 rounded-2xl border shadow-sm"
            style={{ 
                backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
                borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` 
            }}
        >
            <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-extrabold text-[var(--accent-teal)]">
                            {batchData.batchName} {/* Using batchName from JSON */}
                        </h2>
                        <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${
                            batchData.batchType === "ONLINE" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"
                        }`}>
                            {batchData.batchType}
                        </span>
                    </div>
                    
                    <p className="opacity-70 text-sm max-w-2xl mb-4 leading-relaxed">
                        {batchData.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm font-medium opacity-80">
                         <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5">
                             <span className="opacity-50 uppercase text-[10px]">Level</span>
                             <span>{batchData.level}</span>
                         </div>
                         <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5">
                             <span className="opacity-50 uppercase text-[10px]">Started</span>
                             <span>{new Date(batchData.startDate).toLocaleDateString()}</span>
                         </div>
                         <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5">
                             <span className="opacity-50 uppercase text-[10px]">Students</span>
                             <span>{batchData.students?.length || 0}</span>
                         </div>
                         <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5">
                             <span className="opacity-50 uppercase text-[10px]">Sessions</span>
                             <span>{batchData.sessions?.length || 0}</span>
                         </div>
                    </div>
                </div>
            </div>
        </div>

      </div>

      {/* BODY CONTENT */}
      <div className="space-y-10">

        {/* SESSIONS SECTION */}
        <section>
          <button
            onClick={() => setShowSessions(!showSessions)}
            className="w-full flex justify-between items-center p-4 rounded-xl border hover:bg-opacity-10 mb-4 transition"
            style={{
              backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
              borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
            }}
          >
            <div className="flex items-center gap-2 font-bold text-lg">
              <FaCalendarAlt className="text-[var(--accent-teal)]" />
              Course Schedule
            </div>
            {showSessions ? <FaChevronUp /> : <FaChevronDown />}
          </button>

          {showSessions && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {batchData.sessions?.length > 0 ? (
                batchData.sessions.map((session) => (
                  <SessionCard key={session._id} session={session} isDark={isDark} />
                ))
              ) : (
                <div className="col-span-full p-8 text-center opacity-50 border border-dashed rounded-xl">
                    No sessions scheduled yet.
                </div>
              )}
            </div>
          )}
        </section>

        {/* STUDENTS SECTION */}
        <section>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <FaUserGraduate className="text-[var(--accent-purple)]" />
            Enrolled Students ({batchData.students?.length || 0})
          </h2>

          <div className="space-y-3">
            {batchData.students?.length > 0 ? (
              batchData.students.map((student) => (
                <StudentRow key={student._id} student={student} isDark={isDark} />
              ))
            ) : (
              <div className="p-8 border rounded-xl text-center opacity-60 border-dashed">
                No students enrolled yet.
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default TeacherSpecificBatchDetailPage;   