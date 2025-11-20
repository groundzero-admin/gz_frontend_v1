import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaCalendarWeek, FaTimes, FaUserPlus, FaUserGraduate, FaEnvelope, FaPhone } from "react-icons/fa";
// --- UPDATED IMPORT: Added getStudentsInBatch ---
import { getWeeksForBatch, createBatchWeek, linkStudentToBatch, getStudentsInBatch } from "../api.js";

// --- Helper: Day Selector (Unchanged) ---
const DaySelector = ({ selectedDays, onChange, isDark }) => {
  const days = [
    { label: 'M', value: 1, full: 'Monday' },
    { label: 'T', value: 2, full: 'Tuesday' },
    { label: 'W', value: 3, full: 'Wednesday' },
    { label: 'T', value: 4, full: 'Thursday' },
    { label: 'F', value: 5, full: 'Friday' },
    { label: 'S', value: 6, full: 'Saturday' },
    { label: 'S', value: 7, full: 'Sunday' },
  ];

  const toggleDay = (value) => {
    if (selectedDays.includes(value)) {
      onChange(selectedDays.filter(d => d !== value));
    } else {
      onChange([...selectedDays, value].sort());
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Class Days</label>
      <div className="flex gap-2">
        {days.map((day) => {
          const isSelected = selectedDays.includes(day.value);
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              title={day.full}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${isSelected 
                  ? "bg-[var(--accent-teal)] text-white shadow-md scale-110" 
                  : `border opacity-70 hover:opacity-100`
                }
              `}
              style={{
                borderColor: isSelected ? 'transparent' : `var(${isDark ? "--border-dark" : "--border-light"})`,
                color: isSelected ? 'white' : `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`,
                backgroundColor: isSelected ? undefined : 'transparent'
              }}
            >
              {day.label}
            </button>
          );
        })}
      </div>
      {selectedDays.length === 0 && <p className="text-xs text-red-400 mt-1">Select at least one day</p>}
    </div>
  );
};

// --- Helper: Time Picker (Unchanged) ---
const TimePicker = ({ label, value, onChange, isDark }) => {
  const parseTime = (val) => {
    if (!val) return { h: "12", m: "00", p: "PM" };
    const [timePart, periodPart] = val.split(' ');
    const [h, m] = timePart.split(':');
    return { h, m, p: periodPart || "PM" };
  };

  const [timeState, setTimeState] = useState(parseTime(value));

  useEffect(() => {
    onChange(`${timeState.h}:${timeState.m} ${timeState.p}`);
  }, [timeState]);

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

// --- Add Student Modal (Unchanged) ---
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
      <div 
        className="relative w-full max-w-md p-6 rounded-2xl border"
        style={{
          backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
          color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
        }}
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-lg opacity-70 hover:opacity-100"><FaTimes /></button>
        
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <FaUserPlus /> Add Student to Batch
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
           {!batchStringId && (
            <div>
              <label className="block text-sm font-medium mb-1">Batch ID</label>
              <input type="text" value={batchIdInput} onChange={(e) => setBatchIdInput(e.target.value)} className="w-full px-3 py-2 rounded-lg border" style={inputStyle} required placeholder="e.g. SP-A-C-01" />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">Student Number</label>
            <input 
              type="text" 
              value={studentNumber} 
              onChange={(e) => setStudentNumber(e.target.value.toUpperCase())} 
              className="w-full px-3 py-2 rounded-lg border" 
              style={inputStyle} 
              required 
              placeholder="e.g. GZST001" 
            />
            <p className="text-xs mt-1 opacity-60">Enter the unique student ID (auto-capitalized).</p>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-semibold border text-sm" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg font-semibold text-white text-sm" style={{ background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))", opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? "Adding..." : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Create Week Modal (Unchanged) ---
const CreateWeekModal = ({ isOpen, onClose, onSubmit, isDark, batchStringId }) => {
  const [formData, setFormData] = useState({
    week_number: '',
    title: '',
    description: '',
    class_days: [],
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    batchIdInput: batchStringId || '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (batchStringId) {
      setFormData(prev => ({...prev, batchIdInput: batchStringId}));
    }
  }, [batchStringId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.class_days.length === 0) {
      alert("Please select class days.");
      return;
    }
    if (!formData.batchIdInput) {
      alert("Batch ID is missing. Please enter it manually.");
      return;
    }
    setIsSubmitting(true);
    const payload = {
      batchId: formData.batchIdInput,
      week_number: Number(formData.week_number),
      title: formData.title,
      description: formData.description,
      class_days: formData.class_days,
      startTime: formData.startTime,
      endTime: formData.endTime
    };
    const success = await onSubmit(payload);
    if (success) {
      setFormData(prev => ({ 
        ...prev, 
        week_number: String(Number(prev.week_number) + 1), 
        title: '', description: '', class_days: [], 
        startTime: '10:00 AM', endTime: '11:00 AM' 
      }));
      onClose();
    }
    setIsSubmitting(false);
  };

  const inputStyle = {
    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
    backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
    color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
  };

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
        <h2 className="text-xl font-bold mb-6">Add New Week</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!batchStringId && (
            <div>
              <label className="block text-sm font-medium mb-1">Batch ID</label>
              <input type="text" id="batchIdInput" value={formData.batchIdInput} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border" style={inputStyle} required placeholder="e.g. SP-A-C-01" />
            </div>
          )}
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">Week #</label>
              <input type="number" id="week_number" value={formData.week_number} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border" style={inputStyle} required placeholder="1" />
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium mb-1">Week Title</label>
              <input type="text" id="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border" style={inputStyle} required placeholder="e.g. Intro to Python" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea id="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border" style={inputStyle} rows="3" placeholder="Topics covered..."></textarea>
          </div>
          <DaySelector isDark={isDark} selectedDays={formData.class_days} onChange={(days) => setFormData(prev => ({ ...prev, class_days: days }))} />
          <div className="grid grid-cols-2 gap-4">
            <TimePicker label="Start Time" isDark={isDark} value={formData.startTime} onChange={(val) => setFormData(prev => ({...prev, startTime: val}))} />
            <TimePicker label="End Time" isDark={isDark} value={formData.endTime} onChange={(val) => setFormData(prev => ({...prev, endTime: val}))} />
          </div>
          <div className="flex justify-end gap-4 mt-6 pt-4 border-t" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg font-semibold border text-sm" style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-lg font-semibold text-white text-sm" style={{ background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))", opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? "Saving..." : "Add Week"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Week Card (Unchanged) ---
const WeekCard = ({ week, isDark }) => {
  const dayMap = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun' };
  const daysString = week.class_days.map(d => dayMap[d]).join(', ');

  return (
    <div 
      className="p-5 rounded-xl border flex items-start gap-4 transition-all hover:shadow-md h-full"
      style={{
        backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      }}
    >
      <div 
        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
        style={{ backgroundColor: `var(${isDark ? "--bg-dark" : "rgba(0,0,0,0.05)"})`, color: "var(--accent-teal)" }}
      >
        {week.week_number}
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-bold">{week.title}</h3>
        <p className="text-sm mb-3 opacity-80">{week.description}</p>
        <div className="flex flex-wrap gap-4 text-xs font-medium opacity-70">
          <div className="flex items-center gap-1">
            <FaCalendarWeek /> {daysString}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- NEW: Student Card for this page ---
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
      <p className="text-xs opacity-60 truncate">Student number : {student.student_number}</p>

    </div>
  </div>
);

// --- Main Page ---
const AdminBatchWeekPage = () => {
  const { isDark } = useOutletContext();
  const { batchId } = useParams(); // MongoDB _id
  const navigate = useNavigate();
  const location = useLocation();
  
  const batchStringId = location.state?.batchStringId;

  const [weeks, setWeeks] = useState([]);
  const [students, setStudents] = useState([]); // State for students
  const [isLoading, setIsLoading] = useState(true);
  const [isWeekModalOpen, setIsWeekModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  // --- UPDATED FETCH: Fetch both weeks and students ---
  const fetchData = async () => {
    setIsLoading(true);
    
    // Run both requests in parallel
    const [weeksRes, studentsRes] = await Promise.all([
      getWeeksForBatch(batchId),
      getStudentsInBatch(batchId)
    ]);

    if (weeksRes.success) {
      setWeeks(weeksRes.data);
    } else {
      alert(`Error fetching weeks: ${weeksRes.message}`);
    }

    if (studentsRes.success) {
      setStudents(studentsRes.data);
    } else {
      // It's okay if there are no students, but log error if it's a failure
      console.error(studentsRes.message);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (batchId) fetchData();
  }, [batchId]);

  const handleCreateWeek = async (formData) => {
    const response = await createBatchWeek(formData);
    alert(response.message);
    if (response.success) {
      fetchData(); // Reload data
      return true;
    }
    return false;
  };

  const handleAddStudent = async (bId, studentNum) => {
    const response = await linkStudentToBatch(bId, studentNum);
    alert(response.message);
    if (response.success) {
      fetchData(); // Reload data to show new student
      return true;
    }
    return false;
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
            <h1 className="text-3xl font-bold">Batch Schedule</h1>
            {batchStringId ? (
              <h2 className="text-2xl font-extrabold mt-1" style={{ color: "var(--accent-teal)" }}>
                For Batch: {batchStringId}
              </h2>
            ) : (
               <p className="text-sm opacity-60">Manage weeks</p>
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
            onClick={() => setIsWeekModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white shadow-lg transition hover:scale-105"
            style={{ background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))" }}
          >
            <FaPlus /> Add Week
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-lg opacity-70">Loading batch data...</p>
      ) : (
        <div className="space-y-10">
          
          {/* --- WEEKS SECTION --- */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {weeks.length > 0 ? (
                weeks.map(week => (
                  <WeekCard key={week.week_number} week={week} isDark={isDark} />
                ))
              ) : (
                <div 
                  className="col-span-full p-10 rounded-2xl border text-center"
                  style={{
                    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
                    backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`
                  }}
                >
                  <h3 className="text-xl font-bold mb-2">No Weeks Added</h3>
                  <p className="opacity-60">Start by adding Week 1 to this batch.</p>
                </div>
              )}
            </div>
          </section>

          {/* --- NEW: STUDENTS SECTION --- */}
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

      {/* Modal for Creating Week */}
      <CreateWeekModal 
        isOpen={isWeekModalOpen}
        onClose={() => setIsWeekModalOpen(false)}
        onSubmit={handleCreateWeek}
        isDark={isDark}
        batchStringId={batchStringId}
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

export default AdminBatchWeekPage;