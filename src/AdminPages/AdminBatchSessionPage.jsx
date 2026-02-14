import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
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
  FaEdit,
  FaLayerGroup,
  FaChalkboardTeacher,
  FaExternalLinkAlt,
  FaCopy,
  FaCheck,
  FaTrash,
  FaFileImport
} from "react-icons/fa";

// Import API functions
import {
  getSessionsForBatch,
  createSession,
  linkStudentToBatch,
  getStudentsInBatch,
  updateSessionDetails,
  unlinkStudentFromBatch,
  listAllBatchTemplates,
  importTemplateIntoBatch,
  deleteBatchSession
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

// --- Updated Helper: Smart Calendar ---
const SmartCalendar = ({ label, value, onChange, isDark, minDate }) => {
  const today = new Date();

  // LOGIC: If value exists (Edit), use that. 
  // If not (Create), check if minDate (Batch Start) is in the future. If so, start there. 
  // Otherwise start at Today.
  const getInitialDate = () => {
    if (value) return new Date(value);
    const min = minDate ? new Date(minDate) : null;
    if (min && min > today) return min;
    return today;
  };

  const [viewDate, setViewDate] = useState(getInitialDate());

  useEffect(() => {
    if (value) setViewDate(new Date(value));
  }, [value]);

  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // FIX: Dynamic Year Generation
  // Ensure the year dropdown includes the Batch Start Year and the Current Session Year
  const currentYear = today.getFullYear();
  const valueYear = value ? new Date(value).getFullYear() : currentYear;
  const minDateYear = minDate ? new Date(minDate).getFullYear() : currentYear;

  // Start the list from the earliest relevant year
  const startYear = Math.min(currentYear, valueYear, minDateYear);
  // Show 10 years starting from the calculated start year
  const years = Array.from({ length: 10 }, (_, i) => startYear + i);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleDateClick = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Adjust for timezone offset to ensure string is local date
    const offset = newDate.getTimezoneOffset();
    const adjustedDate = new Date(newDate.getTime() - (offset * 60 * 1000));
    onChange(adjustedDate.toISOString().split('T')[0]);
  };

  const isSelectable = (day) => {
    if (!day) return false;
    if (minDate) {
      const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0); // Reset time part for accurate comparison
      // Users can only select dates AFTER or ON the batch start date
      return selectedDate >= min;
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

  // FIX: Dropdown Styles for Dark Mode Visibility
  const dropdownStyle = {
    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
    // FIX: Force White Background and Black Text for visibility
    backgroundColor: "#ffffff",
    color: "#000000"
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="p-3 rounded-lg border max-w-[280px]" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`, backgroundColor: `var(${isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)"})` }}>
        <div className="flex gap-2 mb-2">
          {/* Month Select */}
          <select
            value={viewDate.getMonth()}
            onChange={(e) => setViewDate(new Date(viewDate.getFullYear(), parseInt(e.target.value), 1))}
            className="flex-1 px-1 py-1 rounded border text-xs font-medium cursor-pointer"
            style={dropdownStyle}
          >
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>

          {/* Year Select */}
          <select
            value={viewDate.getFullYear()}
            onChange={(e) => setViewDate(new Date(parseInt(e.target.value), viewDate.getMonth(), 1))}
            className="w-20 px-1 py-1 rounded border text-xs font-medium cursor-pointer"
            style={dropdownStyle}
          >
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
const AddStudentModal = ({ isOpen, onClose, onSubmit, isDark }) => {
  const [studentNumber, setStudentNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await onSubmit(studentNumber);
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

// --- Updated Session Modal with Full Import (Date & Time included) ---
const SessionModal = ({ isOpen, onClose, onSubmit, isDark, editingSession, batchDetails, existingSessions = [] }) => {
  const [formData, setFormData] = useState({
    session_number: '',
    title: '',
    description: '',
    date: '',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    meetingLinkOrLocation: '',
    googleClassroomLink: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Import Feature State
  const [showImportInput, setShowImportInput] = useState(false);
  const [importSessionNum, setImportSessionNum] = useState("");

  const isOnline = (batchDetails?.batchType || '').toUpperCase() === 'ONLINE';

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
        googleClassroomLink: editingSession.googleClassroomLink || ''
      });
    } else {
      // Create Mode Default
      const maxSessionNum = existingSessions.reduce((max, s) => Math.max(max, Number(s.session_number || 0)), 0);
      setFormData(prev => ({
        ...prev,
        session_number: String(maxSessionNum + 1),
        title: '', description: '', date: '', meetingLinkOrLocation: '', googleClassroomLink: ''
      }));
    }
    setShowImportInput(false);
    setImportSessionNum("");
  }, [editingSession, isOpen, existingSessions]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // --- Logic: Import From Old Session ---
  const handleImport = () => {
    const targetNum = Number(importSessionNum);
    if (!targetNum) return;

    const sourceSession = existingSessions.find(s => Number(s.session_number) === targetNum);

    if (sourceSession) {
      setFormData(prev => ({
        ...prev,
        // Clone Content
        title: sourceSession.title || "",
        description: sourceSession.description || "",

        // --- UPDATED: Clone Date and Time ---
        date: sourceSession.date ? new Date(sourceSession.date).toISOString().split('T')[0] : "",
        startTime: sourceSession.startTime || "10:00 AM",
        endTime: sourceSession.endTime || "11:00 AM",

        // Clone Links
        meetingLinkOrLocation: sourceSession.meetingLinkOrLocation || "",
        googleClassroomLink: sourceSession.googleClassroomLink || "",

        // Logic: Create Mode = Next #, Edit Mode = Same #
        session_number: editingSession ? prev.session_number : String(sourceSession.session_number)
      }));

      setShowImportInput(false);
      setImportSessionNum("");
    } else {
      alert(`Session ${targetNum} not found in this batch.`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date) {
      alert("Please select a Date.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      session_number: Number(formData.session_number),
      title: formData.title,
      description: formData.description,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      meetingLinkOrLocation: formData.meetingLinkOrLocation,
      googleClassroomLink: formData.googleClassroomLink
    };

    const success = await onSubmit(payload, editingSession ? true : false);

    if (success) {
      if (!editingSession) {
        setFormData(prev => ({ ...prev, title: '', description: '' }));
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

  const locationLabel = isOnline ? "Google Meet / Meeting Link" : "Class Location";
  const locationPlaceholder = isOnline ? "https://meet.google.com/..." : "e.g. Room 304";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)" }}>
      <div
        className="relative w-full max-w-lg p-6 rounded-2xl border max-h-[90vh] overflow-y-auto custom-scrollbar"
        style={{
          backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
          color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
        }}
      >
        {/* Header Actions */}
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold">
            {editingSession ? "Edit Session" : "Create New Session"}
          </h2>

          <div className="flex items-center gap-2">
            {/* Import Button */}
            <button
              type="button"
              onClick={() => setShowImportInput(!showImportInput)}
              className="px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 transition hover:bg-blue-500 hover:text-white hover:border-blue-500"
              style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}
              title="Import from another session"
            >
              <FaFileImport /> Import from prev session
            </button>

            <button onClick={onClose} className="p-2 text-lg opacity-70 hover:opacity-100"><FaTimes /></button>
          </div>
        </div>

        {/* --- IMPORT INPUT AREA (Visible only when Import clicked) --- */}
        {showImportInput && (
          <div className="mb-6 p-4 rounded-xl border border-dashed border-blue-500/50 bg-blue-500/10 animate-fade-in">
            <label className="block text-xs font-bold text-blue-600 mb-2 uppercase">Import from Old Session</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={importSessionNum}
                onChange={(e) => setImportSessionNum(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleImport()}
                className="flex-1 px-3 py-2 text-sm rounded border"
                style={inputStyle}
                placeholder="Enter Session Number (e.g. 3)"
                autoFocus
              />
              <button
                type="button"
                onClick={handleImport}
                className="px-4 py-2 text-xs rounded bg-blue-600 text-white font-bold hover:bg-blue-700 whitespace-nowrap"
              >
                Clone & Fill
              </button>
            </div>
            <p className="text-[10px] mt-2 opacity-60">
              Clones Date, Time, Title & Links. Sets Session # to <span className="font-bold">Next (+1)</span>.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

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
              onChange={(val) => setFormData(prev => ({ ...prev, date: val }))}
              minDate={batchDetails?.startDate}
            />
            <div className="space-y-4">
              <TimePicker label="Start Time" isDark={isDark} value={formData.startTime} onChange={(val) => setFormData(prev => ({ ...prev, startTime: val }))} />
              <TimePicker label="End Time" isDark={isDark} value={formData.endTime} onChange={(val) => setFormData(prev => ({ ...prev, endTime: val }))} />
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

          {/* Google Classroom Link - Hidden for now */}
          {false && isOnline && (
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <FaChalkboardTeacher /> Google Classroom Link <span className="opacity-50 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                id="googleClassroomLink"
                value={formData.googleClassroomLink}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border"
                style={inputStyle}
                placeholder="https://classroom.google.com/..."
              />
            </div>
          )}

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





// --- Helper: Link Action Button ---
const LinkActionButton = ({ url, label, icon: Icon, colorClass, isDark }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpen = (e) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  if (!url) return null;

  return (
    <div
      className="flex items-center justify-between p-2 rounded-md text-xs mt-2"
      style={{ backgroundColor: `var(${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"})` }}
    >
      <div className="flex items-center gap-2 overflow-hidden mr-2">
        <Icon className={`${colorClass} flex-shrink-0`} />
        <span className="truncate opacity-80">{label}</span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={handleCopy}
          className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition"
          title="Copy Link"
        >
          {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
        </button>
        <button
          onClick={handleOpen}
          className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition"
          title="Open Link"
        >
          <FaExternalLinkAlt />
        </button>
      </div>
    </div>
  );
};

// --- SessionCard ---
const SessionCard = ({ session, isDark, onClick, batchType, onDelete }) => {
  const isOnline = (batchType || '').toUpperCase() === "ONLINE";
  const navigate = useNavigate();

  return (
    <div
      onDoubleClick={onClick}
      className="p-5 rounded-xl border flex items-start gap-4 transition-all hover:shadow-lg cursor-pointer h-full relative group"
      style={{
        backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      }}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex items-center gap-2">
        <span className="text-xs font-bold px-2 py-1 rounded bg-black/10 dark:bg-white/10 flex items-center gap-1">
          <FaEdit /> Edit
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(session); }}
          className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          title="Delete session"
        >
          <FaTrash size={12} />
        </button>
      </div>

      <div className="absolute bottom-3 right-3 flex gap-2 z-10">
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/admin/dashboard/batch-session/${session._id}/sections`); }}
          className="px-4 py-2 rounded-lg text-xs font-bold bg-black text-white hover:bg-gray-800 transition flex items-center gap-1 shadow-md z-20"
        >
          <FaLayerGroup /> Content
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/admin/dashboard/batch-session/${session._id}/review`); }}
          className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1 shadow-md z-20"
        >
          <FaCheck /> Review
        </button>
      </div>

      <div
        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
        style={{
          backgroundColor: `var(${isDark ? "--bg-dark" : "rgba(0,0,0,0.05)"})`,
          color: "var(--accent-teal)",
        }}
      >
        {session.session_number}
      </div>

      <div className="flex-grow min-w-0">
        <h3 className="text-lg font-bold truncate pr-6">{session.title}</h3>
        <p className="text-sm mb-3 opacity-80 line-clamp-2">{session.description || "No description"}</p>

        <div className="flex flex-col gap-1 text-xs font-medium opacity-70">
          <div className="flex items-center gap-2">
            <FaCalendarAlt /> {new Date(session.date).toLocaleDateString()}
          </div>

          <div className="flex items-center gap-2 mb-1">
            <FaClock /> {session.startTime} - {session.endTime}
          </div>
        </div>

        {isOnline && (
          <div className="mt-2 space-y-1">
            {session.meetingLinkOrLocation && (
              <LinkActionButton
                url={session.meetingLinkOrLocation}
                label="Meeting Link"
                icon={FaVideo}
                colorClass="text-purple-500"
                isDark={isDark}
              />
            )}

            {/* Google Classroom Link - Hidden for now */}
            {false && session.googleClassroomLink && (
              <LinkActionButton
                url={session.googleClassroomLink}
                label="Classroom"
                icon={FaChalkboardTeacher}
                colorClass="text-green-500"
                isDark={isDark}
              />
            )}
          </div>
        )}

        {!isOnline && session.meetingLinkOrLocation && (
          <div className="flex items-center gap-2 text-[var(--accent-purple)] mt-2 text-xs font-medium">
            <FaMapMarkerAlt /> {session.meetingLinkOrLocation}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Updated Student Card with Delete ---
const BatchStudentCard = ({ student, isDark, onDelete }) => (
  <div
    className="p-4 rounded-xl border flex items-center gap-4 transition-all hover:shadow-sm relative group"
    style={{
      backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
      borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
    }}
  >
    {/* Delete Button (Visible on Hover) */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete(student);
      }}
      className="absolute top-2 right-2 p-1.5 rounded-full text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/20"
      title="Unlink Student"
    >
      <FaTrash size={12} />
    </button>

    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
      style={{ background: "linear-gradient(135deg, var(--accent-purple), var(--accent-teal))" }}
    >
      {student.name.charAt(0).toUpperCase()}
    </div>
    <div className="min-w-0">
      <h4 className="font-bold text-sm truncate pr-6">{student.name}</h4>
      <p className="text-xs opacity-60 truncate">{student.email}</p>
      <p className="text-xs opacity-60 flex items-center gap-1 mt-1">
        <FaPhone className="text-[10px]" /> {student.mobile || "N/A"}
      </p>
      <p className="text-xs opacity-60 truncate font-mono">ID: {student.student_number}</p>
    </div>
  </div>
);

// --- Main Page ---
const AdminBatchSessionPage = () => {
  const { isDark } = useOutletContext();
  const { batchId } = useParams();
  const navigate = useNavigate();

  const [batchDetails, setBatchDetails] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  // Template import state
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const sessionsRes = await getSessionsForBatch(batchId);

      if (sessionsRes.success && sessionsRes.data) {
        setBatchDetails(sessionsRes.data.batch);
        setSessions(sessionsRes.data.sessions || []);
      } else {
        alert(`Error fetching sessions: ${sessionsRes.message}`);
      }

      const studentsRes = await getStudentsInBatch(batchId);
      if (studentsRes.success) {
        setStudents(studentsRes.data);
      } else {
        console.error("Error fetching students:", studentsRes.message);
      }
    } catch (error) {
      console.error("Fetch Data Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (batchId) fetchData();
  }, [batchId]);

  const handleSessionSubmit = async (formData, isUpdate) => {
    let response;

    if (isUpdate) {
      if (!editingSession?._id) {
        alert("Error: Missing session ID for update.");
        return false;
      }

      const updatePayload = {
        session_obj_id: editingSession._id,
        title: formData.title,
        description: formData.description,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        meetingLinkOrLocation: formData.meetingLinkOrLocation,
        googleClassroomLink: formData.googleClassroomLink
      };

      response = await updateSessionDetails(updatePayload);
    } else {
      const createPayload = {
        batch_obj_id: batchId,
        ...formData
      };
      response = await createSession(createPayload);
    }

    alert(response.message);
    if (response.success) {
      fetchData();
      return true;
    }
    return false;
  };

  const handleAddStudent = async (studentNum) => {
    const payload = {
      batch_obj_id: batchId,
      student_number: studentNum
    };
    const response = await linkStudentToBatch(payload.batch_obj_id, payload.student_number);
    alert(response.message);
    if (response.success) {
      fetchData();
      return true;
    }
    return false;
  };

  const handleUnlinkStudent = async (student) => {
    const confirmMsg = `This will remove student ${student.name} ${student.student_number} from the batch ${batchDetails?.batchName}. Are you sure?`;

    if (window.confirm(confirmMsg)) {
      const response = await unlinkStudentFromBatch(batchId, student.student_number);

      if (response.success) {
        alert("Student removed successfully.");
        fetchData();
      } else {
        alert(response.message || "Failed to remove student.");
      }
    }
  };

  const openCreateModal = () => {
    setEditingSession(null);
    setIsSessionModalOpen(true);
  };

  const openEditModal = (session) => {
    setEditingSession(session);
    setIsSessionModalOpen(true);
  };

  const handleDeleteSession = async (session) => {
    const confirmation = window.prompt(`To confirm deletion of session "${session.title}", please type "DELETE" below:\n\nThis cannot be undone.`);
    if (confirmation !== "DELETE") {
      if (confirmation) alert("Deletion cancelled. You must type DELETE exactly.");
      return;
    }

    const res = await deleteBatchSession(session._id);
    alert(res.message || "Session deleted.");
    if (res.success) {
      fetchData();
    }
  };


  // --- Template Import ---
  const handleOpenTemplateDropdown = async () => {
    if (showTemplateDropdown) {
      setShowTemplateDropdown(false);
      return;
    }
    const res = await listAllBatchTemplates();
    if (res.success) {
      const allTemplates = res.data?.templates || [];
      // Only show templates matching this batch's type
      const filtered = allTemplates.filter(t => t.templateType === batchDetails?.batchType);
      setTemplates(filtered);
    } else {
      alert("Failed to load templates: " + res.message);
      return;
    }
    setShowTemplateDropdown(true);
  };

  const handleImportTemplate = async (template) => {
    if (!window.confirm(`Import all sessions from template "${template.templateName}" into this batch?`)) return;
    setIsImporting(true);
    const res = await importTemplateIntoBatch(template._id, batchId);
    alert(res.message);
    if (res.success) {
      fetchData();
    }
    setIsImporting(false);
    setShowTemplateDropdown(false);
  };

  return (
    <div className="pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/dashboard/batches")}
            className="p-3 rounded-full transition hover:bg-opacity-80"
            style={{ backgroundColor: `var(${isDark ? "--card-dark" : "--border-light"})` }}
          >
            <FaArrowLeft />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Batch Details</h1>
              {batchDetails?.batchType && (
                <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${batchDetails.batchType === "OFFLINE" ? "border-orange-500 text-orange-500" : "border-blue-500 text-blue-500"
                  }`}>
                  {batchDetails.batchType}
                </span>
              )}
            </div>

            {batchDetails ? (
              <div className="flex flex-col gap-1 mt-1">
                <h2 className="text-2xl font-extrabold" style={{ color: "var(--accent-teal)" }}>
                  {batchDetails.batchName} <span className="text-lg opacity-60 font-normal">| Level: {batchDetails.level}</span>
                </h2>

                <p className="text-sm opacity-70 mt-1 flex items-center gap-2">
                  <FaCalendarAlt size={12} />
                  Batch Start Date:{" "}
                  <strong>
                    {new Date(batchDetails.startDate).toLocaleDateString()}
                  </strong>
                </p>

                {batchDetails.batchType === "OFFLINE" && (
                  <p className="text-sm opacity-70 flex items-center gap-1">
                    <FaMapMarkerAlt size={12} /> {batchDetails.classLocation} ({batchDetails.cityCode})
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm opacity-60">Loading details...</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {/* UPDATED ADD STUDENT BUTTON STYLE */}
          <button
            onClick={() => setIsStudentModalOpen(true)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold shadow-lg transition hover:scale-105 ${isDark ? 'text-white' : 'text-black'}`}
            style={{ backgroundColor: `var(${isDark ? "--border-dark" : "rgba(0,0,0,0.1)"})`, border: "1px solid rgba(100,100,100,0.2)" }}
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

          {/* Import from Template */}
          <div className="relative">
            <button
              onClick={handleOpenTemplateDropdown}
              disabled={isImporting}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold shadow-lg transition hover:scale-105 ${isDark ? 'text-white' : 'text-black'}`}
              style={{ backgroundColor: `var(${isDark ? "--border-dark" : "rgba(0,0,0,0.1)"})`, border: "1px solid rgba(100,100,100,0.2)" }}
            >
              <FaFileImport /> {isImporting ? "Importing..." : "Import from Template"}
            </button>

            {showTemplateDropdown && (
              <div
                className="absolute right-0 top-full mt-2 w-72 rounded-xl border shadow-2xl z-50 overflow-hidden"
                style={{
                  backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
                  borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
                }}
              >
                <div className="p-3 border-b font-bold text-sm" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
                  Select a Template
                </div>
                {templates.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    {templates.map((t) => (
                      <button
                        key={t._id}
                        onClick={() => handleImportTemplate(t)}
                        className="w-full text-left px-4 py-3 text-sm transition hover:bg-black/5 dark:hover:bg-white/5 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold">{t.templateName}</p>
                          <p className="text-xs opacity-60">{t.sessionCount} sessions</p>
                        </div>
                        <FaFileImport className="opacity-40" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm opacity-60">
                    No templates found. Create one first.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 opacity-60">
          <div className="animate-spin text-4xl mb-2 inline-block"><FaClock /></div>
          <p>Loading batch ecosystem...</p>
        </div>
      ) : (
        <div className="space-y-10">

          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaLayerGroup className="text-[var(--accent-purple)]" />
              Curriculum Sessions
              <span className="text-sm opacity-50 font-normal ml-2">({sessions.length})</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sessions.length > 0 ? (
                sessions.map(session => (
                  <SessionCard
                    key={session._id || session.session_number}
                    session={session}
                    isDark={isDark}
                    onClick={() => openEditModal(session)}
                    batchType={batchDetails?.batchType}
                    onDelete={handleDeleteSession}
                  />
                ))
              ) : (
                <div
                  className="col-span-full p-10 rounded-2xl border text-center border-dashed"
                  style={{
                    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
                    backgroundColor: `var(${isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)"})`
                  }}
                >
                  <FaCalendarAlt className="mx-auto text-4xl mb-3 opacity-30" />
                  <h3 className="text-xl font-bold mb-1">No Sessions Yet</h3>
                  <p className="opacity-60 text-sm">Create the first session to get started.</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6 border-b pb-4" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
              <FaUserGraduate className="text-2xl text-[var(--accent-teal)]" />
              <h2 className="text-2xl font-bold">Enrolled Students</h2>
              <span className="px-2 py-1 rounded-md text-xs font-bold" style={{ backgroundColor: `var(${isDark ? "--bg-dark" : "--border-light"})` }}>
                {students.length}
              </span>
            </div>

            {students.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {students.map(student => (
                  <BatchStudentCard
                    key={student._id}
                    student={student}
                    isDark={isDark}
                    onDelete={handleUnlinkStudent}
                  />
                ))}
              </div>
            ) : (
              <p className="opacity-50 italic pl-1">No students have been linked to this batch yet.</p>
            )}
          </section>

        </div>
      )}

      <SessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        onSubmit={handleSessionSubmit}
        isDark={isDark}
        batchDetails={batchDetails}
        editingSession={editingSession}

        existingSessions={sessions}

      />

      <AddStudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSubmit={handleAddStudent}
        isDark={isDark}
      />
    </div>
  );
};

export default AdminBatchSessionPage;