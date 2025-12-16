import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaPlus, 
  FaCalendarAlt, 
  FaClock, 
  FaTimes, 
  FaUserPlus, 
  FaUserGraduate, 
  FaMapMarkerAlt, 
  FaVideo,
  FaPhone,
  FaEdit
} from "react-icons/fa";
// Import the new session functions including the update function
import { 
  getSessionsForBatch, 
  createSession, 
  linkStudentToBatch, 
  getStudentsInBatch, 
  updateSessionDetails 
} from "../api.js";

// --- Helper: Time Picker ---
const TimePicker = ({ label, value, onChange, isDark }) => {
  const parseTime = (val) => {
    if (!val) return { h: "10", m: "00", p: "AM" };
    const [timePart, periodPart] = val.split(' ');
    const [h, m] = timePart.split(':');
    return { h, m, p: periodPart || "AM" };
  };

  const [timeState, setTimeState] = useState(parseTime(value));

  useEffect(() => {
    onChange(`${timeState.h}:${timeState.m} ${timeState.p}`);
  }, [timeState]);

  // Update local state if the external value changes (for editing mode)
  useEffect(() => {
    setTimeState(parseTime(value));
  }, [value]);

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0')); 

  const update = (key, val) => setTimeState(prev => ({ ...prev, [key]: val }));

  const selectStyle = {
    backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
    color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <select 
          value={timeState.h} onChange={(e) => update('h', e.target.value)} 
          className="px-2 py-2 rounded border text-sm" style={selectStyle}
        >
          {hours.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <span className="font-bold">:</span>
        <select 
          value={timeState.m} onChange={(e) => update('m', e.target.value)} 
          className="px-2 py-2 rounded border text-sm" style={selectStyle}
        >
          {minutes.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select 
          value={timeState.p} onChange={(e) => update('p', e.target.value)} 
          className="px-2 py-2 rounded border text-sm" style={selectStyle}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
};

// --- Helper: Smart Calendar (Updated with MinDate) ---
const SmartCalendar = ({ label, value, onChange, isDark, minDate }) => {
  const today = new Date();
  const initialDate = value ? new Date(value) : (minDate ? new Date(minDate) : today);
  const [viewDate, setViewDate] = useState(initialDate);
  
  // Sync view when external value changes (for edit mode)
  useEffect(() => {
    if(value) setViewDate(new Date(value));
  }, [value]);

  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']; 
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const currentYear = today.getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleDateClick = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const offset = newDate.getTimezoneOffset(); 
    const adjustedDate = new Date(newDate.getTime() - (offset*60*1000)); 
    onChange(adjustedDate.toISOString().split('T')[0]);
  };

  const isSelectable = (day) => {
    if (!day) return false;
    
    // Create date object for the specific day in the grid
    const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    checkDate.setHours(0,0,0,0);

    // Check against minDate (Batch Start Date)
    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0,0,0,0);
      if (checkDate < min) return false;
    }
    
    return true;
  };

  const isSelected = (day) => {
    if (!value) return false;
    const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const valueDate = new Date(value);
    return checkDate.toDateString() === valueDate.toDateString();
  };

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  const blanks = Array(firstDay).fill(null);
  const totalSlots = [...blanks, ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="p-3 rounded-lg border max-w-[280px]" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`, backgroundColor: `var(${isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)"})` }}>
        <div className="flex gap-2 mb-2">
          <select value={viewDate.getMonth()} onChange={(e) => setViewDate(new Date(viewDate.getFullYear(), parseInt(e.target.value), 1))} className="flex-1 px-1 py-1 rounded border bg-transparent text-xs font-medium" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`, color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }}>
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={viewDate.getFullYear()} onChange={(e) => setViewDate(new Date(parseInt(e.target.value), viewDate.getMonth(), 1))} className="w-20 px-1 py-1 rounded border bg-transparent text-xs font-medium" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`, color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-7 mb-1 text-center">
          {days.map(d => <span key={d} className="text-[10px] font-bold opacity-60 uppercase">{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1 place-items-center">
          {totalSlots.map((day, index) => {
            if (!day) return <div key={`blank-${index}`} className="h-7 w-7" />;
            const selectable = isSelectable(day);
            const selected = isSelected(day);
            return (
              <button 
                key={day} 
                type="button" 
                disabled={!selectable}
                onClick={() => handleDateClick(day)} 
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs transition 
                  ${selectable ? 'hover:bg-[var(--accent-purple)] hover:text-white cursor-pointer' : 'opacity-20 cursor-not-allowed'} 
                  ${selected ? 'bg-[var(--accent-teal)] text-white font-bold shadow-sm scale-110' : ''}`} 
                style={{ color: !selectable ? `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})` : undefined }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Add Student Modal ---
const AddStudentModal = ({ isOpen, onClose, onSubmit, isDark, batchStringId }) => {
  const [studentNumber, setStudentNumber] = useState("");
  const [batchIdInput, setBatchIdInput] = useState(batchStringId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (batchStringId) setBatchIdInput(batchStringId);
  }, [batchStringId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await onSubmit(batchIdInput, studentNumber);
    if (success) {
      setStudentNumber(""); 
      onClose();
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  const inputStyle = {
    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
    backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
    color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)" }}>
      <div className="relative w-full max-w-md p-6 rounded-2xl border" style={{ backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`, borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`, color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})` }}>
        <button onClick={onClose} className="absolute top-5 right-5 text-lg opacity-70 hover:opacity-100"><FaTimes /></button>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><FaUserPlus /> Add Student</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
           {!batchStringId && (
            <div>
              <label className="block text-sm font-medium mb-1">Batch ID</label>
              <input type="text" value={batchIdInput} onChange={(e) => setBatchIdInput(e.target.value)} className="w-full px-3 py-2 rounded-lg border" style={inputStyle} required placeholder="e.g. SP-A-C-01" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Student Number</label>
            <input type="text" value={studentNumber} onChange={(e) => setStudentNumber(e.target.value.toUpperCase())} className="w-full px-3 py-2 rounded-lg border" style={inputStyle} required placeholder="e.g. GZST001" />
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-semibold border text-sm" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg font-semibold text-white text-sm" style={{ background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))", opacity: isSubmitting ? 0.7 : 1 }}>{isSubmitting ? "Adding..." : "Add Student"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Session Modal (Handles Create AND Edit) ---
const SessionModal = ({ isOpen, onClose, onSubmit, isDark, batchStringId, editingSession, batchType, minDate }) => {
  const [formData, setFormData] = useState({
    session_number: '',
    title: '',
    description: '',
    date: '',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    meetingLinkOrLocation: '',
    batchIdInput: batchStringId || '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (editingSession) {
      setFormData({
        session_number: editingSession.session_number || '',
        title: editingSession.title || '',
        description: editingSession.description || '',
        date: editingSession.date ? new Date(editingSession.date).toISOString().split('T')[0] : '',
        startTime: editingSession.startTime || '10:00 AM',
        endTime: editingSession.endTime || '11:00 AM',
        meetingLinkOrLocation: editingSession.meetingLinkOrLocation || '',
        batchIdInput: batchStringId || ''
      });
    } else {
      // Reset for creation if modal opens without editingSession
      setFormData(prev => ({
        ...prev,
        title: '', description: '', date: '', meetingLinkOrLocation: '' 
      }));
    }
  }, [editingSession, isOpen, batchStringId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date) {
      alert("Please select a Date.");
      return;
    }
    if (!formData.batchIdInput) {
      alert("Batch ID is missing.");
      return;
    }

    setIsSubmitting(true);
    
    const payload = {
      batchId: formData.batchIdInput,
      session_number: Number(formData.session_number),
      title: formData.title,
      description: formData.description,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      meetingLinkOrLocation: formData.meetingLinkOrLocation // Optional
    };

    const success = await onSubmit(payload, editingSession ? true : false); 
    
    if (success) {
      if (!editingSession) {
        setFormData(prev => ({ 
          ...prev, 
          session_number: String(Number(prev.session_number) + 1), 
          title: '', description: '', date: '', meetingLinkOrLocation: '' 
        }));
      }
      onClose();
    }
    setIsSubmitting(false);
  };

  const inputStyle = {
    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
    backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
    color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
  };

  // Logic for Dynamic Label
  const isOffline = (batchType || '').toUpperCase() === 'OFFLINE';
  const locationLabel = isOffline ? "Class Location" : "Meeting Link";
  const locationPlaceholder = isOffline ? "e.g. Room 304, Main Building" : "e.g. Google Meet or Zoom Link";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)" }}>
      <div 
        className="relative w-full max-w-lg p-6 rounded-2xl border max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
          color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
        }}
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-lg opacity-70 hover:opacity-100"><FaTimes /></button>
        <h2 className="text-xl font-bold mb-6">
          {editingSession ? "Edit Session" : "Create New Session"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!batchStringId && (
            <div>
              <label className="block text-sm font-medium mb-1">Batch ID</label>
              <input type="text" id="batchIdInput" value={formData.batchIdInput} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border" style={inputStyle} required placeholder="e.g. SP-A-C-01" />
            </div>
          )}

          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">Session #</label>
              <input 
                type="number" 
                id="session_number" 
                value={formData.session_number} 
                onChange={handleChange} 
                className="w-full px-3 py-2 rounded-lg border" 
                style={inputStyle} 
                required 
                placeholder="1"
                disabled={!!editingSession}
              />
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input type="text" id="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border" style={inputStyle} required placeholder="e.g. Intro to Logic" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea id="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border" style={inputStyle} rows="2" placeholder="Topics..."></textarea>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <SmartCalendar 
               label="Date" isDark={isDark} 
               value={formData.date} 
               onChange={(val) => setFormData(prev => ({...prev, date: val}))} 
               minDate={minDate} // Passed from batch Start Date
            />
            <div className="space-y-4">
              <TimePicker label="Start Time" isDark={isDark} value={formData.startTime} onChange={(val) => setFormData(prev => ({...prev, startTime: val}))} />
              <TimePicker label="End Time" isDark={isDark} value={formData.endTime} onChange={(val) => setFormData(prev => ({...prev, endTime: val}))} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {locationLabel} <span className="opacity-50 font-normal">(Optional)</span>
            </label>
            <input 
              type="text" 
              id="meetingLinkOrLocation" 
              value={formData.meetingLinkOrLocation} 
              onChange={handleChange} 
              className="w-full px-3 py-2 rounded-lg border" 
              style={inputStyle} 
              placeholder={locationPlaceholder}
            />
          </div>

          <div className="flex justify-end gap-4 mt-6 pt-4 border-t" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg font-semibold border text-sm" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-lg font-semibold text-white text-sm" style={{ background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))", opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? "Saving..." : (editingSession ? "Update Session" : "Create Session")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Session Card (Updated with OnClick and Hover) ---

const SessionCard = ({ session, isDark, onClick, batchType }) => {
  const isOnline = batchType?.toUpperCase() === "ONLINE";

      const openGmeet = (e) => {
        e.stopPropagation();

        const link = session.meetingLinkOrLocation?.trim();

        if (!link) {
          alert("No meeting link provided.");
          return;
        }

        // Check if it's a valid URL
        if (!link.startsWith("http://") && !link.startsWith("https://")) {
          alert("Invalid meeting link. Please enter a valid URL (e.g., https://meet.google.com/...).");
          return;
        }

        window.open(link, "_blank");
      };

      
  return (
    <div
      onClick={onClick}
      className="p-5 rounded-xl border flex items-start gap-4 transition-all hover:shadow-lg cursor-pointer h-full relative group"
      style={{
        backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      }}
    >
      {/* Hover Edit Icon */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-xs font-bold px-2 py-1 rounded bg-black/10 dark:bg-white/10 flex items-center gap-1">
        <FaEdit /> Edit
      </div>

      {/* SESSION NUMBER */}
      <div
        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
        style={{
          backgroundColor: `var(${isDark ? "--bg-dark" : "rgba(0,0,0,0.05)"})`,
          color: "var(--accent-teal)",
        }}
      >
        {session.session_number}
      </div>

      <div className="flex-grow">
        <h3 className="text-lg font-bold">{session.title}</h3>
        <p className="text-sm mb-3 opacity-80 line-clamp-2">{session.description || "No description"}</p>

        <div className="flex flex-col gap-2 text-xs font-medium opacity-70">
          <div className="flex items-center gap-2">
            <FaCalendarAlt /> {new Date(session.date).toLocaleDateString()}
          </div>

          <div className="flex items-center gap-2">
            <FaClock /> {session.startTime} - {session.endTime}
          </div>

          {/* ONLINE → SHOW GMEET BUTTON */}
          {isOnline && session.meetingLinkOrLocation && (
            <button
              onClick={openGmeet}
              className="mt-2 px-3 py-1 text-white text-xs font-semibold rounded-md"
              style={{ backgroundColor: "var(--accent-purple)" }}
            >
              Open GMeet
            </button>
          )}

          {/* OFFLINE → SHOW MAP + LOCATION */}
          {!isOnline && session.meetingLinkOrLocation && (
            <div className="flex items-center gap-2 text-[var(--accent-purple)]">
              <FaMapMarkerAlt /> {session.meetingLinkOrLocation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};





// --- Student Card (Unchanged) ---
const BatchStudentCard = ({ student, isDark }) => (
  <div 
    className="p-4 rounded-xl border flex items-center gap-4 transition-all hover:shadow-sm"
    style={{
      backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
      borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
    }}
  >
    <div 
      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
      style={{ background: "linear-gradient(135deg, var(--accent-purple), var(--accent-teal))" }}
    >
      {student.name.charAt(0).toUpperCase()}
    </div>
    <div className="min-w-0">
      <h4 className="font-bold text-sm truncate">{student.name}</h4>
      <p className="text-xs opacity-60 truncate">{student.email}</p>
      <p className="text-xs opacity-60 flex items-center gap-1 mt-1">
        <FaPhone className="text-[10px]" /> {student.mobile || "N/A"}
      </p>
      <p className="text-xs opacity-60 truncate">ID: {student.student_number}</p>
    </div>
  </div>
);

// --- Main Page ---
const AdminBatchSessionPage = () => {
  const { isDark } = useOutletContext();
  const { batchId } = useParams(); // MongoDB _id
  const navigate = useNavigate();
  const location = useLocation();
  
  // Destructure location state with defaults
  const { batchStringId, batchType, startDate } = location.state || {};
  
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null); 
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    
    // Fetch Sessions and Students in parallel
    const [sessionsRes, studentsRes] = await Promise.all([
      getSessionsForBatch(batchId),
      getStudentsInBatch(batchId)
    ]);

    if (sessionsRes.success) {
      setSessions(sessionsRes.data);
    } else {
      alert(`Error fetching sessions: ${sessionsRes.message}`);
    }

    if (studentsRes.success) {
      setStudents(studentsRes.data);
    } else {
      console.error(studentsRes.message);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (batchId) fetchData();
  }, [batchId]);

  // Handle both Create and Update logic
  const handleSessionSubmit = async (formData, isUpdate) => {
    let response;
    
    if (isUpdate) {
      if (!editingSession?._id) {
        alert("Error: Missing session ID for update.");
        return false;
      }
      
      const updatePayload = {
        session_obj_id: editingSession._id, 
        ...formData
      };
      
      response = await updateSessionDetails(updatePayload);
    } else {
      response = await createSession(formData);
    }

    alert(response.message);
    if (response.success) {
      fetchData();
      return true;
    }
    return false;
  };

  const handleAddStudent = async (bId, studentNum) => {
    const response = await linkStudentToBatch(bId, studentNum);
    alert(response.message);
    if (response.success) {
      fetchData();
      return true;
    }
    return false;
  };

  const openCreateModal = () => {
    setEditingSession(null); 
    setIsSessionModalOpen(true);
  };

  const openEditModal = (session) => {
    setEditingSession(session); 
    setIsSessionModalOpen(true);
  };

  return (
    <div className="pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/admin/dashboard/batches")}
            className="p-3 rounded-full transition"
            style={{ backgroundColor: `var(${isDark ? "--card-dark" : "--border-light"})` }}
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Batch Sessions</h1>
            {batchStringId ? (
              <h2 className="text-2xl font-extrabold mt-1" style={{ color: "var(--accent-teal)" }}>
                {batchStringId}
              </h2>
            ) : (
               <p className="text-sm opacity-60">Manage sessions</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setIsStudentModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white shadow-lg transition hover:scale-105"
            style={{ backgroundColor: `var(${isDark ? "--border-dark" : "gray"})`, border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <FaUserPlus /> Add Student
          </button>

          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white shadow-lg transition hover:scale-105"
            style={{ background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))" }}
          >
            <FaPlus /> Add Session
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-lg opacity-70">Loading batch data...</p>
      ) : (
        <div className="space-y-10">
          
          {/* --- SESSIONS SECTION --- */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaCalendarAlt className="text-[var(--accent-purple)]" /> Scheduled Sessions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sessions.length > 0 ? (
                sessions.map(session => (
                  <SessionCard 
                    key={session._id || session.session_number} 
                    session={session} 
                    isDark={isDark} 
                    onClick={() => openEditModal(session)}
                     batchType={batchType}
                  />
                ))
              ) : (
                <div 
                  className="col-span-full p-10 rounded-2xl border text-center"
                  style={{
                    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
                    backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`
                  }}
                >
                  <h3 className="text-xl font-bold mb-2">No Sessions Created</h3>
                  <p className="opacity-60">Start by adding Session 1 to this batch.</p>
                </div>
              )}
            </div>
          </section>

          {/* --- STUDENTS SECTION --- */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b pb-4" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
              <FaUserGraduate className="text-2xl text-[var(--accent-purple)]" />
              <h2 className="text-2xl font-bold">Enrolled Students</h2>
              <span className="px-2 py-1 rounded-md text-xs font-bold" style={{ backgroundColor: `var(${isDark ? "--bg-dark" : "--border-light"})` }}>
                {students.length}
              </span>
            </div>

            {students.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {students.map(student => (
                  <BatchStudentCard key={student._id} student={student} isDark={isDark} />
                ))}
              </div>
            ) : (
              <p className="opacity-50 italic">No students have been added to this batch yet.</p>
            )}
          </section>

        </div>
      )}

      {/* Unified Modal for Creating / Editing Session */}
      <SessionModal 
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        onSubmit={handleSessionSubmit}
        isDark={isDark}
        batchStringId={batchStringId}
        editingSession={editingSession}
        batchType={batchType} // Pass for dynamic labels
        minDate={startDate}   // Pass for date validation
      />

      {/* Modal for Adding Student */}
      <AddStudentModal 
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSubmit={handleAddStudent}
        isDark={isDark}
        batchStringId={batchStringId}
      />
    </div>
  );
};

export default AdminBatchSessionPage;