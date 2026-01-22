import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaUserGraduate, 
  FaExternalLinkAlt, 
  FaChalkboardTeacher,
   // Added for empty state
} from 'react-icons/fa';
import { getBatchStudentsBoardLinks } from '../api.js'; 

// --- Lightweight Background (Pure CSS) ---
const SpaceBackground = ({ isDark }) => {
  const bgStyle = isDark ? {
    backgroundColor: '#02040a',
    backgroundImage: `radial-gradient(at 0% 0%, rgba(139, 92, 246, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(56, 189, 248, 0.15) 0px, transparent 50%)`
  } : {
    backgroundColor: '#ffffff',
    backgroundImage: `radial-gradient(at 0% 0%, rgba(167, 139, 250, 0.2) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(14, 165, 233, 0.2) 0px, transparent 50%)`
  };
  return <div className="fixed inset-0 pointer-events-none -z-10" style={{ ...bgStyle, backgroundAttachment: 'fixed', backgroundSize: 'cover' }} />;
};

// --- Main Page Component ---
const AdminAllBoardsForABatch = () => {
  const { batchId } = useParams(); 
  const navigate = useNavigate();
  const context = useOutletContext();
  const isDark = context?.isDark ?? true;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!batchId) return;
      setLoading(true);
      const res = await getBatchStudentsBoardLinks(batchId);
      if (res.success) {
        setStudents(res.data);
      } else {
        alert("Error fetching students: " + res.message);
      }
      setLoading(false);
    };
    fetchData();
  }, [batchId]);

  return (
    <div className="relative min-h-screen p-6 md:p-10">
      <SpaceBackground isDark={isDark} />
      
      {/* --- Top Navigation --- */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className={`p-3 rounded-full transition-all group ${isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-white hover:bg-gray-100 text-slate-700 shadow-sm"}`}
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-slate-800"}`}>
              <FaChalkboardTeacher className="text-cyan-400" /> Collaborative Boards
            </h1>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>
              Manage student boards for Batch ID: <span className="font-mono opacity-70">{batchId}</span>
            </p>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className={`h-32 rounded-3xl animate-pulse ${isDark ? "bg-white/5" : "bg-gray-200"}`} />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className={`text-center py-20 rounded-3xl border border-dashed flex flex-col items-center justify-center gap-4 ${isDark ? "border-white/10 text-gray-500" : "border-gray-300 text-gray-400"}`}>
            <FaUserGraduate size={40} className="opacity-20" />
            <p className="font-bold text-lg">No students found in this batch.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {students.map((student) => (
              <div
                key={student.student_obj_id}
                className={`relative overflow-hidden rounded-3xl p-5 border shadow-lg flex flex-col transition-transform duration-200 hover:-translate-y-1
                  ${isDark 
                    ? "bg-[#13111C]/80 border-white/10 hover:border-cyan-500/30" 
                    : "bg-white border-white/60 shadow-blue-500/5 hover:border-blue-300"
                  }
                `}
              >
                {/* Decorative Gradient */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl opacity-10 rounded-bl-full -mr-4 -mt-4 pointer-events-none
                   ${student.board_link ? "from-green-400 to-emerald-600" : "from-gray-400 to-gray-600"}
                `} />

                {/* Student Info */}
                <div className="flex items-start gap-4 mb-4 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0
                    ${isDark 
                      ? "bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20" 
                      : "bg-gradient-to-br from-blue-100 to-cyan-50 text-blue-600"
                    }
                  `}>
                    {student.student_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className={`font-bold text-base truncate ${isDark ? "text-white" : "text-slate-800"}`}>
                      {student.student_name}
                    </h3>
                    <p className={`text-xs truncate ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                      {student.student_email}
                    </p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono border
                      ${isDark ? "bg-white/5 border-white/5 text-gray-400" : "bg-gray-100 border-gray-200 text-gray-500"}
                    `}>
                      {student.student_number}
                    </span>
                  </div>
                </div>

                {/* Status & Action */}
                <div className="mt-auto pt-4 border-t border-dashed border-gray-500/20 flex flex-col gap-2">
                   
                   {/* Status Indicator */}
                   <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${student.board_link ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                      <span className={`text-xs font-bold ${student.board_link ? "text-green-500" : "text-gray-400"}`}>
                        {student.board_link ? "Active Board" : "No Board Assigned"}
                      </span>
                   </div>

                   {/* Main Action Button (Open in New Tab) */}
                   {student.board_link ? (
                     <a 
                       href={student.board_link}
                       target="_blank"
                       rel="noreferrer"
                       className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md
                         ${isDark 
                           ? "bg-cyan-500 hover:bg-cyan-400 text-white shadow-cyan-500/20" 
                           : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                         }
                       `}
                     >
                       <FaExternalLinkAlt /> Open Board
                     </a>
                   ) : (
                     <button 
                       disabled
                       className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed
                         ${isDark ? "bg-white/5 text-gray-500" : "bg-gray-100 text-gray-400"}
                       `}
                     >
                       <FaExternalLinkAlt /> Empty Link
                     </button>
                   )}
                   
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAllBoardsForABatch;