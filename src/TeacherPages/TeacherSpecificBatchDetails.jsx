import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { getBatchAndSessionDetailsForTeacher } from "../api.js";

// --- ICONS CLEAN IMPORTS ---
import { 
  FaArrowLeft, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaLink, 
  FaUserGraduate, FaEnvelope, FaIdBadge, FaCommentDots,
  FaChevronUp, FaChevronDown
} from "react-icons/fa";

// ----------------------------------------
// BEAUTIFUL GOOGLE-MEET STYLE SESSION CARD
// ----------------------------------------
const SessionCard = ({ session, isDark }) => {
  const dateObj = new Date(session.date);
  const isUrl = session.meetingLinkOrLocation?.startsWith("http");

  return (
    <div
      className="group p-5 rounded-2xl border shadow-sm hover:shadow-lg transition-all relative overflow-hidden"
      style={{
        backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      }}
    >
      {/* Accent Bar */}
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{ backgroundColor: "var(--accent-teal)" }}
      />

      <div className="flex flex-col md:flex-row gap-4">
        {/* Date */}
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

        {/* Content */}
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-lg flex items-center gap-2">
              <FaCalendarAlt className="text-[var(--accent-teal)]" /> 
              {session.title}
            </h4>

            <span className="text-xs px-2 py-1 rounded border opacity-70">
              Session {session.session_number}
            </span>
          </div>

          <p className="text-sm opacity-70 mt-1 mb-3">{session.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium opacity-80">

            {/* TIME */}
            <span className="flex items-center gap-2">
              <FaClock className="opacity-70" />
              {session.startTime} - {session.endTime}
            </span>

            {/* LOCATION OR LINK */}
            {session.meetingLinkOrLocation && (
              <span className="flex items-center gap-2">
                {isUrl ? (
                  <>
                    <FaLink className="text-[var(--accent-teal)]" />
                    <a
                      href={session.meetingLinkOrLocation}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-lg font-bold text-white text-xs"
                      style={{ background: "var(--accent-teal)" }}
                    >
                      Join Meeting
                    </a>
                  </>
                ) : (
                  <>
                    <FaMapMarkerAlt className="text-red-500" />
                    <span>{session.meetingLinkOrLocation}</span>
                  </>
                )}
              </span>
            )}
          </div>
        </div>
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
          <div className="flex flex-wrap gap-3 text-xs opacity-70">
            <span className="flex items-center gap-1">
              <FaEnvelope /> {student.email}
            </span>
            <span className="flex items-center gap-1">
              <FaIdBadge /> {student.student_number}
            </span>
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

  const [batchData, setBatchData] = useState({
    sessions: [],
    students: [],
    batchId: "",
    batchType: "",
    level: "",
    cohort: "",
    classLocation: ""
  });

  const [isLoading, setIsLoading] = useState(true);
  const [showSessions, setShowSessions] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const response = await getBatchAndSessionDetailsForTeacher(batchId);

      if (response.success) setBatchData(response.data);
      else console.error(response.message);

      setIsLoading(false);
    };

    fetchData();
  }, [batchId]);

  return (
    <div className="pb-20">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/teacher/dashboard/batches")}
          className="p-3 rounded-full transition"
          style={{ backgroundColor: `var(${isDark ? "--card-dark" : "--border-light"})` }}
        >
          <FaArrowLeft />
        </button>

        <div>
          <h1 className="text-3xl font-bold">Batch Details</h1>

          {batchData.batchId && (
            <div className="flex items-center gap-3 mt-2">
              <h2 className="text-xl font-extrabold" style={{ color: "var(--accent-teal)" }}>
                {batchData.batchId}
              </h2>

              {batchData.batchType && (
                <span className={`text-xs px-2 py-1 rounded font-bold ${
                  batchData.batchType === "ONLINE"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {batchData.batchType}
                </span>
              )}
            </div>
          )}

          <div className="text-xs opacity-70 mt-2 space-x-4">
            <span>Cohort: {batchData.cohort || "N/A"}</span>
            <span>Level: {batchData.level || "N/A"}</span>
            {batchData.batchType === "OFFLINE" && (
              <span>Location: {batchData.classLocation}</span>
            )}
          </div>
        </div>
      </div>

      {/* BODY */}
      {isLoading ? (
        <p className="opacity-60 text-lg">Loading...</p>
      ) : (
        <div className="space-y-10">

          {/* SESSIONS */}
          <section>
            <button
              onClick={() => setShowSessions(!showSessions)}
              className="w-full flex justify-between items-center p-4 rounded-xl border hover:bg-opacity-10"
              style={{
                backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
                borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
              }}
            >
              <div className="flex items-center gap-2 font-bold text-lg">
                <FaCalendarAlt className="text-[var(--accent-teal)]" />
                Course Schedule ({batchData.sessions.length})
              </div>

              {showSessions ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {showSessions && (
             <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">

                {batchData.sessions.length > 0 ? (
                  batchData.sessions.map((session) => (
                    <SessionCard key={session._id} session={session} isDark={isDark} />
                  ))
                ) : (
                  <p className="opacity-60 italic">No sessions yet.</p>
                )}
              </div>
            )}
          </section>

          {/* STUDENTS */}
          <section>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
              <FaUserGraduate className="text-[var(--accent-purple)]" />
              Enrolled Students ({batchData.students.length})
            </h2>

            <div className="space-y-3">
              {batchData.students.length > 0 ? (
                batchData.students.map((student) => (
                  <StudentRow key={student._id} student={student} isDark={isDark} />
                ))
              ) : (
                <div
                  className="p-8 border rounded-xl text-center opacity-60 border-dashed"
                >
                  No students enrolled yet.
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
