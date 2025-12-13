// AttendancePage.jsx
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  ChevronRight, 
  Loader2,
  History,
  X,
  UserCheck
} from 'lucide-react';

// ==========================================
// API CONFIGURATION & HELPERS
// ==========================================

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:4010"; 

const api = {
  getAllLiveBatches: async () => {
    try {
      const response = await fetch(`${BASE_URL}/admin/listallactivebatches`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Failed to fetch batches");
      return await response.json();
    } catch (error) {
      console.error("getAllLiveBatches error:", error);
      return { success: false, message: "Network error fetching batches." };
    }
  },

  getAllSessionsForBatch: async (batch_obj_id) => {
    try {
      const response = await fetch(`${BASE_URL}/admin/getsessionforabatch?batch_obj_id=${batch_obj_id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Failed to fetch sessions");
      return await response.json();
    } catch (error) {
      console.error("getAllSessionsForBatch error:", error);
      return { success: false, message: "Network error fetching sessions." };
    }
  },

  attendanceStatusPerSession: async (session_obj_id) => {
    try {
      const response = await fetch(`${BASE_URL}/admin/attendance-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ session_obj_id }),
      });
      if (!response.ok) throw new Error("Failed to fetch attendance status");
      return await response.json();
    } catch (error) {
      console.error("attendanceStatusPerSession error:", error);
      return { success: false, message: "Network error fetching attendance." };
    }
  },

  markAttendance: async (student_obj_id, session_obj_id, status) => {
    try {
      const response = await fetch(`${BASE_URL}/teacher/mark-attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ student_obj_id, session_obj_id, status }),
      });
      if (!response.ok) throw new Error("Failed to mark attendance");
      return await response.json();
    } catch (error) {
      console.error("markAttendance error:", error);
      return { success: false, message: "Network error marking attendance." };
    }
  },

  getAllStudentDetails: async () => {
    try {
      const response = await fetch(`${BASE_URL}/admin/getallstudentdetails`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Failed to fetch students");
      return await response.json();
    } catch (error) {
      console.error("getAllStudentDetails error:", error);
      return { success: false, message: "Network error fetching students." };
    }
  },

  attendanceStatusPerStudent: async (student_obj_id) => {
    try {
      const response = await fetch(`${BASE_URL}/admin/student-attendance-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ student_obj_id }),
      });
      if (!response.ok) throw new Error("Failed to fetch student history");
      return await response.json();
    } catch (error) {
      console.error("attendanceStatusPerStudent error:", error);
      return { success: false, message: "Network error fetching student history." };
    }
  }
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function AttendancePage() {
  // Theme from parent layout
  const outletContext = useOutletContext?.() || {};
  const isDark = !!outletContext.isDark;

  // --- State: Batches & Sessions ---
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchSessions, setBatchSessions] = useState([]);
  const [showSessionsModal, setShowSessionsModal] = useState(false);

  // --- State: Session Attendance (Marking) ---
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionStudents, setSessionStudents] = useState([]); // List of students with status
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [updatingId, setUpdatingId] = useState(null); // Which student ID is currently updating

  // --- State: All Students & History ---
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentHistory, setSelectedStudentHistory] = useState(null);
  const [studentHistoryData, setStudentHistoryData] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // --- Loading States ---
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Initial Load
  useEffect(() => {
    fetchBatches();
    fetchAllStudents();
  }, []);

  // 1. Fetch Batches
const fetchBatches = async () => {
  setLoadingBatches(true);
  const res = await api.getAllLiveBatches();

  if (res.success) {
    const onlyLive = (res.data || []).filter(
      batch => batch.status === "LIVE" || batch.isLive === true
    );
    setBatches(onlyLive);
  }

  setLoadingBatches(false);
};


  // 2. Fetch All Students (Bottom Section)
  const fetchAllStudents = async () => {
    setLoadingStudents(true);
    const res = await api.getAllStudentDetails();

    if (res.success) {
      // keep server's student_number if present
      const normalized = res.data.map(s => ({
        ...s,
        name: s.username || s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim(),
        student_number: s.student_number ?? s.studentNumber ?? s.studentId ?? s.email
      }));

      setAllStudents(normalized);
    }

    setLoadingStudents(false);
  };

  // 3. Handle Batch Click -> Load Sessions
  const handleBatchClick = async (batch) => {
    setSelectedBatch(batch);
    setShowSessionsModal(true);
    setLoadingSessions(true);
    setBatchSessions([]); // Clear previous
    
    const res = await api.getAllSessionsForBatch(batch._id);
    if (res.success) setBatchSessions(res.data || []);
    else setBatchSessions([]);
    
    setLoadingSessions(false);
  };

  // 4. Handle Session Click -> Load Attendance List
  const handleSessionClick = async (session) => {
    setShowSessionsModal(false); 
    
    setSelectedSession(session);
    setShowAttendanceModal(true);
    setLoadingAttendance(true);
    setSessionStudents([]); // Clear previous

    const res = await api.attendanceStatusPerSession(session._id);
    if (res.success) setSessionStudents(res.data || []);
    else setSessionStudents([]);

    setLoadingAttendance(false);
  };

  // 5. Toggle Attendance Status
  const toggleAttendance = async (student) => {
    const newStatus = student.status === "PRESENT" ? "ABSENT" : "PRESENT";
    setUpdatingId(student.student_obj_id); // Show loader for this specific row

    const res = await api.markAttendance(
      student.student_obj_id,
      selectedSession._id,
      newStatus
    );

    if (res.success) {

       alert(res.message);
       
      setSessionStudents(prev => prev.map(s => 
        s.student_obj_id === student.student_obj_id 
          ? { ...s, status: newStatus } 
          : s
      ));
    } else {
      alert("Failed to update status. Please try again.");
    }
    setUpdatingId(null);
  };

  // 6. Handle Student Card Click -> Load History
  const handleStudentClick = async (student) => {
    setSelectedStudentHistory(student);
    setShowHistoryModal(true);
    setLoadingHistory(true);
    setStudentHistoryData(null); // Clear previous

    const res = await api.attendanceStatusPerStudent(student._id);
    if (res.success) setStudentHistoryData(res.data);
    
    setLoadingHistory(false);
  };

  // helper: style values from CSS variables (return string like 'var(--bg-dark)')
  const v = (name) => `var(${isDark ? `--${name}-dark` : `--${name}-light`})`;

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
        color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
      }}
    >
      {/* small css for gradient border and scrollbar that uses CSS variables but doesn't force dark */}
      <style>{`
        .border-gradient {
          position: relative;
          border: 2px solid transparent;
          background-image: linear-gradient(var(--button-bg-dark), var(--button-bg-dark)), linear-gradient(90deg, var(--accent-teal), var(--accent-purple), var(--accent-teal));
          background-origin: border-box;
          background-clip: padding-box, border-box;
          animation: borderFlow 4s linear infinite;
        }
        @keyframes borderFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        /* scrollbar */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 6px; }
      `}</style>

      <div className="p-6 max-w-7xl mx-auto">
        <header className="mb-10 pt-4 flex items-start gap-4">
          <div className="p-3 rounded-xl border-gradient shadow-[0_0_15px_rgba(138,43,226,0.12)] flex items-center">
            <Calendar className="w-8 h-8" style={{ color: 'var(--accent-teal)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6, color: `var(${isDark ? '--text-dark-primary' : '--text-light-primary'})` }}>
              Attendance Admin
            </h1>
            <p style={{ color: `var(${isDark ? '--text-dark-secondary' : '--text-light-secondary'})` }}>
              Manage live batches and track real-time participation.
            </p>
          </div>
        </header>

        {/* --- TOP SECTION: BATCHES --- */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 style={{ fontSize: 20, fontWeight: 700, color: `var(${isDark ? '--text-dark-primary' : '--text-light-primary'})` }}>
              <Users className="inline-block" style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--accent-purple)' }} />
              Live Batches
            </h2>
          </div>

          {loadingBatches ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: 24, borderRadius: 12,
              backgroundColor: `var(${isDark ? '--card-dark' : '--card-light'})`,
              border: `1px solid var(${isDark ? '--border-dark' : '--border-light'})`,
              color: `var(${isDark ? '--text-dark-secondary' : '--text-light-secondary'})`
            }}>
              <Loader2 className="animate-spin" style={{ width: 20, height: 20, color: 'var(--accent-teal)' }} />
              <span>Loading active batches...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {batches.map(batch => (
                <div 
                  key={batch._id}
                  onClick={() => handleBatchClick(batch)}
                  role="button"
                  className="rounded-2xl p-6 cursor-pointer group"
                  style={{
                    backgroundColor: `var(${isDark ? '--card-dark' : '--card-light'})`,
                    border: `1px solid var(${isDark ? '--border-dark' : '--border-light'})`,
                    transition: 'transform .25s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{
                      backgroundColor: 'transparent',
                      color: 'var(--accent-purple)',
                      border: `1px solid rgba(138,43,226,0.18)`,
                      padding: '6px 10px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.6
                    }}>{batch.batchId}</span>

                    <ChevronRight className="group-hover" style={{ color: `var(${isDark ? '--text-dark-secondary' : '--text-light-secondary'})` }} />
                  </div>

                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: `var(${isDark ? '--text-dark-primary' : '--text-light-primary'})` }}>{batch.title || batch.batchId}</h3>
                  <p style={{ color: `var(${isDark ? '--text-dark-secondary' : '--text-light-secondary'})`, marginTop: 6 }}>{batch.cohort} • {batch.level}</p>
                </div>
              ))}
              {!loadingBatches && batches.length === 0 && (
                <p style={{ color: `var(${isDark ? '--text-dark-secondary' : '--text-light-secondary'})` }}>No active batches found.</p>
              )}
            </div>
          )}
        </section>

        {/* --- BOTTOM SECTION: ALL STUDENTS --- */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 style={{ fontSize: 20, fontWeight: 700, color: `var(${isDark ? '--text-dark-primary' : '--text-light-primary'})` }}>
              <Search className="inline-block" style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--accent-teal)' }} />
              Student Directory
            </h2>
          </div>

          {loadingStudents ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: 24, borderRadius: 12,
              backgroundColor: `var(${isDark ? '--card-dark' : '--card-light'})`,
              border: `1px solid var(${isDark ? '--border-dark' : '--border-light'})`,
              color: `var(${isDark ? '--text-dark-secondary' : '--text-light-secondary'})`
            }}>
              <Loader2 className="animate-spin" style={{ width: 20, height: 20, color: 'var(--accent-purple)' }} />
              <span>Loading student database...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {allStudents.map(student => (
                <div 
                  key={student._id} 
                  onClick={() => handleStudentClick(student)}
                  role="button"
                  className="p-4 rounded-xl flex items-center gap-4"
                  style={{
                    backgroundColor: `var(${isDark ? '--card-dark' : '--card-light'})`,
                    border: `1px solid var(${isDark ? '--border-dark' : '--border-light'})`,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 999,
                    padding: 2,
                    background: `linear-gradient(135deg, var(--accent-purple), var(--accent-teal))`
                  }}>
                    <div style={{
                      width: '100%', height: '100%', borderRadius: 999, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      backgroundColor: `var(${isDark ? '--bg-dark' : '--bg-light'})`,
                      color: `var(${isDark ? '--text-dark-primary' : '--text-light-primary'})`,
                      fontWeight: 700
                    }}>
                      {student.name ? student.name.charAt(0).toUpperCase() : "?"}
                    </div>
                  </div>

                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, color: `var(${isDark ? '--text-dark-primary' : '--text-light-primary'})`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {student.name}
                    </div>
                    <div style={{ fontSize: 12, color: `var(${isDark ? '--text-dark-secondary' : '--text-light-secondary'})`, fontFamily: 'monospace' }}>
                      {student.student_number}
                    </div>
                  </div>
                </div>
              ))}
              {!loadingStudents && allStudents.length === 0 && (
                <p style={{ color: `var(${isDark ? '--text-dark-secondary' : '--text-light-secondary'})` }}>No students found in directory.</p>
              )}
            </div>
          )}
        </section>

        {/* --- MODAL 1: BATCH SESSIONS --- */}
        {showSessionsModal && selectedBatch && (
          <div style={{
            position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 60, padding: 16, backdropFilter: 'blur(6px)'
          }}>
            <div style={{
              width: '100%', maxWidth: 900, maxHeight: '80vh', overflow: 'hidden', borderRadius: 18,
              backgroundColor: `var(${isDark ? '--bg-dark' : '--bg-light'})`,
              border: `1px solid var(${isDark ? '--border-dark' : '--border-light'})`,
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ padding: 20, borderBottom: `1px solid var(${isDark ? '--border-dark' : '--border-light'})`, backgroundColor: `var(${isDark ? '--card-dark' : '--card-light'})` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: `var(${isDark ? '--text-dark-primary' : '--text-light-primary'})` }}>{selectedBatch.title || selectedBatch.batchId}</h3>
                    <div style={{ marginTop: 6, color: `var(${isDark ? '--text-dark-secondary' : '--text-light-secondary'})`, fontFamily: 'monospace' }}>
                      Batch ID: {selectedBatch.batchId} {selectedBatch.batchType ? `• ${selectedBatch.batchType}` : ''}
                    </div>
                  </div>
                  <button onClick={() => setShowSessionsModal(false)} style={{
                    background: 'transparent', border: 'none', padding: 8, borderRadius: 8, color: `var(${isDark ? '--text-dark-secondary' : '--text-light-secondary'})`
                  }}>
                    <X />
                  </button>
                </div>
              </div>

              <div style={{ padding: 20, overflowY: 'auto' }}>
                {loadingSessions ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                    <Loader2 className="animate-spin" style={{ width: 28, height: 28, color: 'var(--accent-teal)' }} />
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {batchSessions.length === 0 ? (
                      <div style={{ padding: 24, textAlign: 'center', borderRadius: 12, border: `1px dashed var(${isDark ? '--border-dark' : '--border-light'})`, color: `var(${isDark ? '--text-dark-secondary' : '--text-light-secondary'})` }}>
                        No sessions found for this batch.
                      </div>
                    ) : (
                      batchSessions.map(session => (
                        <div key={session._id} onClick={() => handleSessionClick(session)} role="button"
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                            padding: 16, borderRadius: 12,
                            backgroundColor: `var(${isDark ? '--card-dark' : '--card-light'})`,
                            border: `1px solid var(${isDark ? '--border-dark' : '--border-light'})`,
                            cursor: 'pointer'
                          }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontWeight: 800, color: 'var(--accent-purple)', backgroundColor: 'rgba(138,43,226,0.08)'
                            }}>{session.session_number ?? '#'}</div>
                            <div>
                              <div style={{ fontWeight: 800, color: `var(${isDark ? '--text-dark-primary' : '--text-light-primary'})` }}>{session.title || 'Untitled Session'}</div>
                              <div style={{ marginTop: 6, fontSize: 13, color: `var(${isDark ? '--text-dark-secondary' : '--text-light-secondary'})`, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Clock style={{ width: 14, height: 14 }} />
                                {new Date(session.date).toDateString()}
                              </div>
                            </div>
                          </div>
                          <div style={{ color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 700 }}>Attendance</span>
                            <ChevronRight />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL 2: SESSION ATTENDANCE (MARKING) --- */}
        {showAttendanceModal && selectedSession && (
          <div style={{
            position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 70, padding: 16, backdropFilter: 'blur(6px)'
          }}>
            <div style={{
              width: '100%', maxWidth: 1100, maxHeight: '90vh', overflow: 'hidden', borderRadius: 18,
              backgroundColor: `var(${isDark ? '--bg-dark' : '--bg-light'})`,
              border: `1px solid var(${isDark ? '--border-dark' : '--border-light'})`,
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ padding: 20, borderBottom: `1px solid var(${isDark ? '--border-dark' : '--border-light'})`, backgroundColor: `var(${isDark ? '--card-dark' : '--card-light'})` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: `var(${isDark ? '--text-dark-primary' : '--text-light-primary'})` }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                        <UserCheck style={{ color: 'var(--accent-teal)' }} />
                        Mark Attendance
                      </span>
                    </h3>
                    <div style={{ marginTop: 6, color: `var(${isDark ? '--text-dark-secondary' : '--text-light-secondary'})` }}>
                      <strong style={{ color: `var(${isDark ? '--text-dark-primary' : '--text-light-primary'})` }}>{selectedSession.title}</strong> • {new Date(selectedSession.date).toDateString()}
                    </div>
                  </div>
                  <button onClick={() => setShowAttendanceModal(false)} style={{ background: 'transparent', border: 'none', color: `var(${isDark ? '--text-dark-secondary' : '--text-light-secondary'})`, padding: 8, borderRadius: 8 }}>
                    <X style={{ width: 20, height: 20 }} />
                  </button>
                </div>
              </div>

              <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
                {loadingAttendance ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                    <Loader2 className="animate-spin" style={{ width: 34, height: 34, color: 'var(--accent-teal)' }} />
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {sessionStudents.length === 0 ? (
                      <div style={{ padding: 24, textAlign: 'center', borderRadius: 12, border: `1px dashed var(${isDark ? '--border-dark' : '--border-light'})`, color: `var(${isDark ? '--text-dark-secondary' : '--text-light-secondary'})` }}>
                        No students enrolled in this batch.
                      </div>
                    ) : (
                      sessionStudents.map((student, idx) => (
                        <div key={student.student_obj_id} style={{
                          display: 'grid',
                          gridTemplateColumns: '48px 1fr 220px',
                          gap: 12,
                          alignItems: 'center',
                          padding: 14,
                          borderRadius: 12,
                          border: `1px solid var(${isDark ? '--border-dark' : '--border-light'})`,
                          backgroundColor: student.status === 'PRESENT' ? 'rgba(0,196,204,0.06)' : `var(${isDark ? '--card-dark' : '--card-light'})`
                        }}>
                          <div style={{ color: `var(${isDark ? '--text-dark-secondary' : '--text-light-secondary'})`, fontFamily: 'monospace' }}>{idx + 1}</div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: student.status === 'PRESENT' ? 'linear-gradient(135deg,var(--accent-teal),#0AA)' : `var(${isDark ? '--border-dark' : '--border-light'})`,
                              color: student.status === 'PRESENT' ? '#000' : `var(${isDark ? '--text-dark-secondary' : '--text-light-secondary'})`,
                              fontWeight: 700
                            }}>{student.name ? student.name.charAt(0).toUpperCase() : '?'}</div>

                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontWeight: 700, color: `var(${isDark ? '--text-dark-primary' : '--text-light-primary'})`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {student.name}
                              </div>
                              <div style={{ fontSize: 12, color: `var(${isDark ? '--text-dark-secondary' : '--text-light-secondary'})`, fontFamily: 'monospace' }}>
                                {student.student_number}
                              </div>
                            </div>
                          </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>

  {updatingId === student.student_obj_id ? (
    <Loader2 className="animate-spin" style={{ width: 20, height: 20 }} />
  ) : student.status === "UNMARKED" ? (
    <>
      {/* Mark Present Button */}
      <button
        onClick={() => toggleAttendance({ ...student, status: "ABSENT" })} // calling ABSENT will flip to PRESENT
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          fontWeight: 700,
          border: "1px solid var(--accent-teal)",
          background: "transparent",
          color: "var(--accent-teal)",
          cursor: "pointer"
        }}
      >
        Mark Present
      </button>

      {/* Mark Absent Button */}
      <button
        onClick={() => toggleAttendance({ ...student, status: "PRESENT" })} // calling PRESENT will flip to ABSENT
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          fontWeight: 700,
          border: "1px solid #ff6b6b",
          background: "transparent",
          color: "#ff6b6b",
          cursor: "pointer"
        }}
      >
        Mark Absent
      </button>
    </>
  ) : (
    // EXISTING PRESENT/ABSENT UI
    <button
      onClick={() => toggleAttendance(student)}
      disabled={updatingId === student.student_obj_id}
      style={{
        width: "100%",
        maxWidth: 260,
        padding: "10px 14px",
        borderRadius: 10,
        fontWeight: 700,
        cursor: "pointer",
        border: "1px solid",
        borderColor:
          student.status === "PRESENT" ? "var(--accent-teal)" : "#ff6b6b",
        background: "transparent",
        color: student.status === "PRESENT" ? "var(--accent-teal)" : "#ff6b6b"
      }}
    >
      {student.status === "PRESENT" ? "Present — Mark Absent" : "Absent — Mark Present"}
    </button>
  )}

</div>

                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL 3: STUDENT HISTORY --- */}
        {showHistoryModal && selectedStudentHistory && (
          <div style={{
            position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 80, padding: 16, backdropFilter: 'blur(6px)'
          }}>
            <div style={{
              width: '100%', maxWidth: 900, maxHeight: '85vh', overflow: 'hidden', borderRadius: 18,
              backgroundColor: `var(${isDark ? '--bg-dark' : '--bg-light'})`,
              border: `1px solid var(${isDark ? '--border-dark' : '--border-light'})`,
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ padding: 20, borderBottom: `1px solid var(${isDark ? '--border-dark' : '--border-light'})`, backgroundColor: `var(${isDark ? '--card-dark' : '--card-light'})` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: `var(${isDark ? '--text-dark-primary' : '--text-light-primary'})` }}>
                      <History style={{ marginRight: 8, verticalAlign: 'middle', color: 'var(--accent-purple)' }} />
                      Attendance History
                    </h3>
                    <div style={{ marginTop: 6, color: `var(${isDark ? '--text-dark-secondary' : '--text-light-secondary'})` }}>
                      <strong>{selectedStudentHistory.name}</strong> &nbsp; <span style={{ fontFamily: 'monospace' }}>{selectedStudentHistory.student_number}</span> &nbsp; <span style={{ opacity: 0.7 }}>{selectedStudentHistory.email}</span>
                    </div>
                  </div>
                  <button onClick={() => setShowHistoryModal(false)} style={{ background: 'transparent', border: 'none', padding: 8 }}>
                    <X />
                  </button>
                </div>
              </div>

              <div style={{ padding: 20, overflowY: 'auto' }}>
                {loadingHistory ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                    <Loader2 className="animate-spin" style={{ width: 28, height: 28, color: 'var(--accent-teal)' }} />
                  </div>
                ) : !studentHistoryData || !studentHistoryData.history || studentHistoryData.history.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', borderRadius: 12, border: `1px dashed var(${isDark ? '--border-dark' : '--border-light'})`, color: `var(${isDark ? '--text-dark-secondary' : '--text-light-secondary'})` }}>
                    No attendance records found for this student.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 16 }}>
                    {studentHistoryData.history.map((record) => (
                      <div key={record._id} style={{
                        padding: 16, borderRadius: 12, backgroundColor: `var(${isDark ? '--card-dark' : '--card-light'})`, border: `1px solid var(${isDark ? '--border-dark' : '--border-light'})`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 800, color: `var(${isDark ? '--text-dark-primary' : '--text-light-primary'})` }}>{record.session_title}</div>
                            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--accent-purple)' }}>{record.batchName} • Session #{record.session_number}</div>
                          </div>
                          <div>
                            <div style={{ padding: '6px 10px', borderRadius: 8, background: record.status === 'PRESENT' ? 'rgba(0,196,204,0.06)' : 'rgba(255,99,71,0.06)', color: record.status === 'PRESENT' ? 'var(--accent-teal)' : '#ff6b6b', fontWeight: 700 }}>
                              {record.status}
                            </div>
                          </div>
                        </div>
                        <div style={{ marginTop: 12, display: 'flex', gap: 18, color: `var(${isDark ? '--text-dark-secondary' : '--text-light-secondary'})`, fontSize: 13 }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <Calendar style={{ width: 14, height: 14, color: 'var(--accent-teal)' }} /> {record.session_date}
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <Clock style={{ width: 14, height: 14, color: 'var(--accent-purple)' }} /> Marked: {new Date(record.markedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
