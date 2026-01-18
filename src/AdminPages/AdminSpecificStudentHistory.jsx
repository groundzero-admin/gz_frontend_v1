import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaCheckCircle, FaTimesCircle, FaFileAlt, FaPlus, FaMinus, FaSave,
  FaWifi, FaBan, FaUser, FaEnvelope, FaIdBadge, FaLayerGroup, FaPhone, 
  FaUserFriends, FaUserTie, FaLink, FaEdit, FaTrash, FaExternalLinkAlt, 
  FaHistory, FaTasks, FaSpinner, FaChalkboard // <--- Added FaChalkboard
} from "react-icons/fa";

// Import API functions
import { 
  getStudentFullHistory, 
  updateStudentCreditWallet,
  getStudentAssignments,
  createAssignmentLink,
  updateAssignmentLink,
  deleteAssignmentLink,
  getStudentBoardLink,    // <--- NEW
  upsertStudentBoardLink  // <--- NEW
} from "../api.js"; 

// --- Helper: History Row (unchanged) ---
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
        <p className="truncate" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
          {item.response || "No response (Bad Prompt)"}
        </p>
      </div>
      <div className="w-2/12 px-4 text-xs" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
        {new Date(item.createdAt).toLocaleString()}
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-96 p-4 hidden group-hover:block z-20 rounded-lg shadow-xl"
           style={{ backgroundColor: `var(${isDark ? "--bg-dark" : "white"})`, borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`, borderWidth: "1px" }}>
        <h4 className="font-bold mb-1">Full Prompt:</h4>
        <p className="text-sm mb-3 whitespace-pre-wrap">{item.prompt}</p>
        <h4 className="font-bold mb-1">Full Response:</h4>
        <p className="text-sm whitespace-pre-wrap" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>{item.response || "No response"}</p>
      </div>
    </div>
  );
};

// --- Helper: Assignment Management Component (unchanged from previous) ---
const AssignmentManager = ({ studentId, isDark }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "", link: "" });

  const fetchAssignments = async () => {
    setLoading(true);
    const res = await getStudentAssignments(studentId);
    if (res.success) setAssignments(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchAssignments(); }, [studentId]);

  const handleInputChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const handleReset = () => {
    setFormData({ title: "", description: "", link: "" });
    setIsEditing(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.title || !formData.link || !formData.description) return alert("All fields required");
    setIsSubmitting(true);
    try {
      let res;
      if (isEditing) {
        res = await updateAssignmentLink({ assignment_id: editId, student_obj_id: studentId, assignment_title: formData.title, assignment_description: formData.description, link: formData.link });
      } else {
        res = await createAssignmentLink({ student_obj_id: studentId, assignment_title: formData.title, assignment_description: formData.description, link: formData.link });
      }
      if (res.success) { alert(res.message); handleReset(); fetchAssignments(); } 
      else { alert(res.message); }
    } catch (error) { console.error(error); alert("Error"); } 
    finally { setIsSubmitting(false); }
  };

  const handleEditClick = (item) => {
    setIsEditing(true);
    setEditId(item._id);
    setFormData({ title: item.assignment_title, description: item.assignment_description, link: item.link });
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleDeleteClick = async (assignmentId) => {
    if(!window.confirm("Delete this assignment?")) return;
    const res = await deleteAssignmentLink({ assignment_id: assignmentId, student_obj_id: studentId });
    if (res.success) fetchAssignments(); else alert(res.message);
  };

  const inputStyle = `w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 ${isDark ? 'bg-black/20 border-gray-700 text-white' : 'bg-white border-gray-200'}`;

  return (
    <div className="space-y-8">
      <div className={`p-6 rounded-2xl border shadow-sm ${isDark ? 'bg-white/5 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          {isEditing ? <FaEdit className="text-yellow-500" /> : <FaPlus className="text-green-500" />}
          {isEditing ? "Edit Assignment" : "Add New Assignment"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="title" placeholder="Assignment Title" value={formData.title} onChange={handleInputChange} className={inputStyle} required />
            <input name="link" placeholder="Link URL" value={formData.link} onChange={handleInputChange} className={inputStyle} required />
          </div>
          <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} className={inputStyle} required rows="2" />
          <div className="flex gap-3 mt-2">
            <button type="submit" disabled={isSubmitting} className={`px-6 py-2 rounded-lg font-bold text-white flex items-center justify-center min-w-[140px] ${isSubmitting ? 'opacity-70' : ''} ${isEditing ? 'bg-yellow-600' : 'bg-green-600'}`}>
              {isSubmitting ? <><FaSpinner className="animate-spin mr-2" /> Processing...</> : (isEditing ? "Update" : "Add")}
            </button>
            {isEditing && <button type="button" onClick={handleReset} disabled={isSubmitting} className="px-6 py-2 rounded-lg font-bold bg-gray-500 text-white">Cancel</button>}
          </div>
        </form>
      </div>
      <div className="space-y-4">
        {loading ? <div className="flex justify-center py-10 opacity-50"><FaSpinner className="animate-spin text-3xl" /></div> : assignments.length === 0 ? <p className="opacity-50 text-center py-10">No assignments found.</p> : assignments.map((item) => (
            <div key={item._id} className={`p-5 rounded-xl border flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group ${isDark ? 'bg-[#1a1a1a] border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1"><h4 className="font-bold text-lg">{item.assignment_title}</h4><a href={item.link} target="_blank" rel="noreferrer" className="text-blue-500"><FaExternalLinkAlt /></a></div>
                <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.assignment_description}</p>
                <div className="flex items-center gap-4 text-xs opacity-50 font-mono"><span>ID: {item._id}</span><span>{new Date(item.createdAt).toLocaleDateString()}</span></div>
              </div>
              <div className="flex gap-3"><button onClick={() => handleEditClick(item)} className="p-2 rounded-lg bg-blue-100 text-blue-600"><FaEdit /></button><button onClick={() => handleDeleteClick(item._id)} className="p-2 rounded-lg bg-red-100 text-red-600"><FaTrash /></button></div>
            </div>
          ))}
      </div>
    </div>
  );
};

// --- NEW Helper: Collaborative Board Manager ---
const BoardLinkManager = ({ studentId, isDark }) => {
  const [boardLink, setBoardLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch link on mount
  useEffect(() => {
    const fetchLink = async () => {
      setLoading(true);
      const res = await getStudentBoardLink(studentId);
      if (res.success && res.data) {
        setBoardLink(res.data.board_link || "");
      }
      setLoading(false);
    };
    fetchLink();
  }, [studentId]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!boardLink) return alert("Please enter a valid link");

    setIsSaving(true);
    const res = await upsertStudentBoardLink(studentId, boardLink);
    
    if (res.success) {
      alert(res.message);
    } else {
      alert("Error: " + res.message);
    }
    setIsSaving(false);
  };

  const inputStyle = `w-full p-4 rounded-xl border text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-black/20 border-gray-700 text-white' : 'bg-white border-gray-200'}`;

  if (loading) return <div className="flex justify-center py-10 opacity-50"><FaSpinner className="animate-spin text-3xl" /></div>;

  return (
    <div className={`p-8 rounded-2xl border shadow-lg ${isDark ? 'bg-[#1a1a1a] border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
           <FaChalkboard className="text-2xl" />
        </div>
        <div>
           <h3 className="text-xl font-bold">Collaborative Board</h3>
           <p className="text-sm opacity-60">Manage the Miro/Whiteboard link for this student.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <label className="text-sm font-bold uppercase tracking-wider opacity-70">Board Link URL</label>
        <div className="flex gap-4">
          <input 
            type="url"
            value={boardLink}
            onChange={(e) => setBoardLink(e.target.value)}
            placeholder="https://miro.com/..."
            className={inputStyle}
          />
        </div>
        
        <div className="flex items-center gap-4 mt-2">
            <button 
              type="submit" 
              disabled={isSaving}
              className={`px-8 py-3 rounded-xl font-bold text-white transition-all flex items-center gap-2
                ${isSaving ? 'opacity-70 cursor-wait bg-gray-500' : 'bg-purple-600 hover:bg-purple-700 hover:scale-105'}`
              }
            >
              {isSaving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> Save / Update Link</>}
            </button>

            {boardLink && (
              <a 
                href={boardLink} 
                target="_blank" 
                rel="noreferrer"
                className={`px-6 py-3 rounded-xl font-bold border transition-all flex items-center gap-2
                  ${isDark ? 'border-gray-600 hover:bg-white/10' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}
              >
                <FaExternalLinkAlt /> Open Board
              </a>
            )}
        </div>
      </form>
    </div>
  );
};

// --- Helper: Detail Item & Credit Card (unchanged) ---
const DetailItem = ({ icon: Icon, label, value, isDark }) => (
  <div className="flex items-start gap-3 p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5">
    <div className="mt-1 opacity-50"><Icon /></div>
    <div className="overflow-hidden">
      <p className="text-xs uppercase tracking-wider opacity-60 mb-0.5">{label}</p>
      <p className="font-medium text-base truncate" title={value} style={{ color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`}}>{value || "N/A"}</p>
    </div>
  </div>
);
const CreditControlCard = ({ title, value, type, onAdjust, icon: Icon, isDark }) => (
    <div className="flex flex-col p-5 rounded-2xl border shadow-lg flex-1" style={{ backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`, borderColor: `var(${isDark ? "--border-dark" : "--border-light"})` }}>
      <div className="flex items-center gap-3 mb-4"><div className={`p-3 rounded-full ${type === 'online' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}><Icon className="text-xl" /></div><h3 className="font-bold text-lg">{title}</h3></div>
      <div className="flex items-center justify-between mt-auto"><span className="text-sm opacity-70">Remaining:</span><div className="flex items-center gap-3 bg-opacity-10 rounded-lg p-1" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}><button onClick={() => onAdjust(type, -1)} disabled={value <= 0} className={`p-2 rounded-md transition-colors ${value <= 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-red-100 hover:text-red-600'}`}><FaMinus size={12} /></button><span className="font-mono text-xl font-bold w-20 text-center">{value}</span><button onClick={() => onAdjust(type, 1)} className="p-2 rounded-md transition-colors hover:bg-green-100 hover:text-green-600"><FaPlus size={12} /></button></div></div>
    </div>
);

// --- Main Page Component ---
const StudentPromptHistory = () => {
  const { isDark } = useOutletContext();
  const { studentId } = useParams();
  const navigate = useNavigate();
  
  const [chats, setChats] = useState([]);
  const [studentDetails, setStudentDetails] = useState(null);
  const [parentDetails, setParentDetails] = useState(null);
  const [credits, setCredits] = useState({ online: 0, offline: 0 });
  const [initialCredits, setInitialCredits] = useState({ online: 0, offline: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- TAB STATE (Updated) ---
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'assignments' | 'board'

  useEffect(() => {
    if (!studentId) { setIsLoading(false); return; }
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
      } else { alert(response.message); }
      setIsLoading(false);
    };
    fetchHistory();
  }, [studentId]);

  const handleCreditAdjust = (type, direction) => {
    const step = 1500;
    const change = step * direction;
    setCredits(prev => {
      const newValue = prev[type] + change;
      return { ...prev, [type]: newValue < 0 ? 0 : newValue };
    });
  };

  const handleUpdateCredits = async () => {
    if (!studentDetails?.student_number) return alert("Missing student info");
    if (!window.confirm(`Update credits?\nOnline: ${initialCredits.online} → ${credits.online}\nOffline: ${initialCredits.offline} → ${credits.offline}`)) return;
    setIsSaving(true);
    const response = await updateStudentCreditWallet(studentId, studentDetails.student_number, credits.online, credits.offline);
    if (response.success) { alert(response.message); setInitialCredits(credits); } 
    else { alert("Error: " + response.message); }
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
    <div className="pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate("/admin/dashboard/student")} className="p-3 rounded-full transition" style={{ backgroundColor: `var(${isDark ? "--card-dark" : "--border-light"})`}}><FaArrowLeft /></button>
        <h1 className="text-3xl font-bold">Student Profile</h1>
      </div>

      {isLoading ? <p>Loading data...</p> : (
        <div className="flex flex-col gap-8">
          {/* 1. Student Details */}
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
              {!hasParent ? <DetailItem icon={FaUserFriends} label="Parent Status" value={parentDetails || "Not Linked"} isDark={isDark} /> : <><DetailItem icon={FaUserTie} label="Parent Name" value={parentDetails.name} isDark={isDark} /><DetailItem icon={FaEnvelope} label="Parent Email" value={parentDetails.email} isDark={isDark} /><DetailItem icon={FaPhone} label="Parent Mobile" value={parentDetails.mobile} isDark={isDark} /></>}
            </div>
          </div>

          {/* 2. Credits Control */}
          <div className="flex flex-col md:flex-row gap-6">
            <CreditControlCard title="Online Credits" value={credits.online} type="online" onAdjust={handleCreditAdjust} icon={FaWifi} isDark={isDark} />
            <CreditControlCard title="Offline Credits" value={credits.offline} type="offline" onAdjust={handleCreditAdjust} icon={FaBan} isDark={isDark} />
            <div className="flex items-end">
              <button onClick={handleUpdateCredits} disabled={!hasChanges || isSaving} className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold shadow-lg transition-all min-w-[200px] justify-center ${!hasChanges ? 'opacity-60 cursor-not-allowed bg-sky-300 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'}`}>
                {isSaving ? <><FaSpinner className="animate-spin" /> Updating...</> : <><FaSave /> Update Credits</>}
              </button> 
            </div>
          </div>

          <hr style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`, opacity: 0.3 }} />

          {/* 3. Toggle Control */}
          <div className="flex justify-center mb-4">
             <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-black/20 border-gray-700' : 'bg-gray-100 border-gray-300'}`}>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-md' : 'opacity-60 hover:opacity-100'}`}
                >
                  <FaHistory /> Prompt History
                </button>
                <button 
                  onClick={() => setActiveTab('assignments')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'assignments' ? 'bg-blue-600 text-white shadow-md' : 'opacity-60 hover:opacity-100'}`}
                >
                  <FaTasks /> Assignments
                </button>
                {/* --- NEW TAB BUTTON --- */}
                <button 
                  onClick={() => setActiveTab('board')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'board' ? 'bg-purple-600 text-white shadow-md' : 'opacity-60 hover:opacity-100'}`}
                >
                  <FaChalkboard /> Collaborative Board
                </button>
             </div>
          </div>

          {/* 4. Tab Content */}
          {activeTab === 'history' && (
             chats.length === 0 ? (
              <div className="p-8 rounded-2xl border text-center" style={cardStyle}>
                <FaFileAlt className="text-5xl mx-auto mb-6 text-[var(--accent-teal)]" />
                <h2 className="text-2xl font-bold mb-2">No History Found</h2>
                <p style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>This student has not submitted any prompts to the AI.</p>
              </div>
            ) : (
              <div className="rounded-2xl border overflow-hidden shadow-xl" style={cardStyle}>
                <div className="flex items-center p-4 text-sm uppercase" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`, borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`, borderBottomWidth: "1px" }}>
                  <div className="w-1/12 text-center">Status</div><div className="w-4/12 px-4">Prompt</div><div className="w-5/12 px-4">Response</div><div className="w-2/12 px-4">Time</div>
                </div>
                <div>{chats.map((item, index) => <HistoryRow key={item._id || index} item={item} isDark={isDark} />)}</div>
              </div>
            )
          )}
          
          {activeTab === 'assignments' && (
            <AssignmentManager studentId={studentId} isDark={isDark} />
          )}

          {/* --- NEW TAB CONTENT --- */}
          {activeTab === 'board' && (
            <BoardLinkManager studentId={studentId} isDark={isDark} />
          )}

        </div>
      )}
    </div>
  );
};

export default StudentPromptHistory;