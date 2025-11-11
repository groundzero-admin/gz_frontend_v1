import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaEnvelope, FaBirthdayCake } from "react-icons/fa";
// Assuming api.js is in the parent directory
import { listMyStudents } from "../api.js"; 

// --- Individual Student Card Component ---
const StudentCard = ({ student, isDark, onClick }) => (
  <button 
    onClick={onClick}
    className="p-6 rounded-2xl border text-left flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    style={{
      backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
      borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      backdropFilter: "blur(10px)"
    }}
  >
    <div className="flex-grow">
      {/* Avatar Placeholder */}
      <span 
        className="flex items-center justify-center w-16 h-16 rounded-full mb-4"
        style={{ backgroundColor: `var(${isDark ? "--bg-dark" : "rgba(0,0,0,0.03)"})`}}
      >
        <FaUserGraduate className="text-3xl text-[var(--accent-purple)]" />
      </span>
      
      {/* Student Info */}
      <h3 className="text-xl font-bold mb-2">{student.name}</h3>
      <p 
        className="flex items-center gap-3 mb-2 text-sm" 
        style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
      >
        <FaEnvelope />
        {student.email}
      </p>
      <p 
        className="flex items-center gap-3 text-sm" 
        style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
      >
        <FaBirthdayCake />
        Age: {student.age}
      </p>
    </div>
    
    {/* Action Button */}
    <div 
      className="w-full mt-6 px-4 py-2 rounded-lg font-semibold text-center transition"
      style={{
        backgroundColor: `var(${isDark ? "--border-dark" : "rgba(0,0,0,0.05)"})`,
        color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
      }}
    >
      View Performance 
    </div>
  </button>
);

// --- Main Page Component ---
const TeacherStudentsPage = () => {
  const { isDark } = useOutletContext();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      const response = await listMyStudents();
      
      if (response.success) {
        setStudents(response.data);
      } else {
        // Auth errors are handled by TeacherLayout
        alert(response.message);
      }
      setIsLoading(false);
    };

    fetchStudents();
  }, []); // Runs once on page load

  const handleStudentClick = (studentId) => {
    // Navigate to the specific student profile page
    navigate(`/teacher/dashboard/students/${studentId}`);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Students</h1>

      {isLoading ? (
        <p>Loading students...</p>
      ) : students.length === 0 ? (
        // Empty State
        <div 
          className="p-8 rounded-2xl border text-center"
          style={{
            backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
            borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
          }}
        >
          <FaUserGraduate className="text-5xl mx-auto mb-6 text-[var(--accent-teal)]" />
          <h2 className="text-2xl font-bold mb-2">No Students Found</h2>
          <p style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
            No students are currently enrolled in your courses.
          </p>
        </div>
      ) : (
        // Data State
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {students.map(student => (
            <StudentCard 
              key={student._id} 
              student={student} 
              isDark={isDark} 
              onClick={() => handleStudentClick(student._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherStudentsPage;