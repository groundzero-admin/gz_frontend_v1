import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaEnvelope, FaBook, FaPlus, FaSpinner, FaUserCheck } from "react-icons/fa";
import { getAllStudentDetails } from "../api.js"; // Assuming api.js is in the parent directory

// --- Individual Student Row Component ---
// --- UPDATED: Now accepts 'navigate' prop ---
const StudentRow = ({ student, isDark, navigate }) => (
  <tr 
    className="border-b transition duration-150"
    style={{
      borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
      // Remove hover opacity since the button is the main action
    }}
  >
    <td className="p-4 flex items-center gap-4">
      <FaUserGraduate className="text-[var(--accent-purple)] flex-shrink-0" />
      <span className="font-semibold">{student.username}</span>
    </td>
    <td className="p-4 text-sm" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
      {student.email}
    </td>
    <td className="p-4 font-medium text-[var(--accent-teal)]">
      {student.class}
    </td>
    <td className="p-4">
      {/* --- UPDATED BUTTON --- */}
      <button 
        onClick={() => navigate(`/admin/dashboard/student/${student._id}`)}
        className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all duration-300 hover:opacity-90"
        style={{
          background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))",
        }}
      >
        View Profile
      </button>
      {/* --- END UPDATE --- */}
    </td>
  </tr>
);

// --- "Add Student" Card Placeholder ---
const AddStudentButton = ({ isDark }) => (
  <button 
    onClick={() => alert("ill add this feature soon ")}
    className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-all duration-300 flex items-center gap-2 hover:opacity-90"
    style={{
      background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))",
    }}
  >
    <FaPlus />
    Invite Student
  </button>
);


// --- Main Page Component ---
const AdminStudentPage = () => {
  const { isDark } = useOutletContext();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); // <-- Initialize navigate

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      const response = await getAllStudentDetails();
      
      if (response.success) {
        setStudents(response.data);
      } else {
        alert(response.message);
      }
      setIsLoading(false);
    };

    fetchStudents();
  }, []); // Runs once on page load

  const cardStyle = {
    backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
    backdropFilter: "blur(10px)"
  };

  return (
    <div>
      {/* Header and Action Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Students</h1>
        <AddStudentButton isDark={isDark} />
      </div>

      {/* Loading State */}
      {isLoading ? (
        <p className="text-lg">Loading student data...</p>
      
      ) : students.length === 0 ? (
        
        // Empty State
        <div 
          className="p-8 rounded-2xl border text-center mt-8" 
          style={cardStyle}
        >
          <FaUserCheck className="text-5xl mx-auto mb-6 text-[var(--accent-teal)]" />
          <h2 className="text-2xl font-bold mb-2">No Students Registered</h2>
          <p style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
            Use the "Invite Student" button to begin onboarding.
          </p>
        </div>

      ) : (
        
        // Data Table
        <div 
          className="rounded-2xl border overflow-x-auto shadow-xl" 
          style={cardStyle}
        >
          <table className="w-full text-left border-collapse">
            <thead 
              className="text-sm uppercase" 
              style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
            >
              <tr 
                style={{ borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`}}
                className="border-b"
              >
                <th className="p-4 w-1/3">Name</th>
                <th className="p-4 w-1/3">Email</th>
                <th className="p-4 w-auto">Class</th>
                <th className="p-4 w-auto">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* --- UPDATED: Pass navigate to each row --- */}
              {students.map(student => (
                <StudentRow 
                  key={student._id} 
                  student={student} 
                  isDark={isDark} 
                  navigate={navigate} // <-- Pass navigate down
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminStudentPage;