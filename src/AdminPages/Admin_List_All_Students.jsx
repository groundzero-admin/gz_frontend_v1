import React, { useState, useEffect } from "react"
import { useOutletContext, useNavigate } from "react-router-dom"
import { FaUserGraduate, FaPlus, FaUserCheck, FaPencilAlt, FaTimes } from "react-icons/fa"
import { getAllStudentDetails, updateStudentPassword } from "../api.js" // Import the new function

// ================================
// Password Update Modal
// ================================
const PasswordModal = ({ isOpen, onClose, student, isDark, onUpdateSuccess }) => {
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset input when modal opens
  useEffect(() => {
    if (isOpen) setNewPassword("");
  }, [isOpen]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Trim spaces
    const cleanPassword = newPassword.trim();

    if (!cleanPassword) {
      alert("Password cannot be empty or just spaces.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateStudentPassword(student._id, cleanPassword);
      if (response.success) {
        alert("Password updated successfully!");
        onUpdateSuccess(student._id, cleanPassword); // Update local state
        onClose();
      } else {
        alert(response.message || "Failed to update password.");
      }
    } catch (error) {
      alert("An error occurred while updating the password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
    backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`,
    color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)" }}>
      <div 
        className="relative w-full max-w-md p-6 rounded-2xl border shadow-2xl" 
        style={{ 
          backgroundColor: `var(${isDark ? "--bg-dark" : "--bg-light"})`, 
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
          color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
        }}
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-lg opacity-70 hover:opacity-100"><FaTimes /></button>
        
        <h2 className="text-xl font-bold mb-6">Update Password</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-bold opacity-60 mb-1">Student Name</label>
          <p className="text-lg font-medium">{student.username}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold opacity-60 mb-1">Current Password (Text)</label>
          <div className="p-2 rounded border opacity-70 font-mono text-sm" style={{ borderColor: inputStyle.borderColor }}>
            {student.password_text || "N/A"}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">New Password</label>
            <input 
              type="text" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-[var(--accent-teal)]"
              style={inputStyle}
              placeholder="Enter new password"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 rounded-lg font-semibold border text-sm hover:opacity-80"
              style={{ borderColor: inputStyle.borderColor }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg font-semibold text-white text-sm"
              style={{ 
                background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))",
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ================================
// Student Row
// ================================
const StudentRow = ({ student, isDark, navigate, onEditPassword }) => {
  // Parsing logic
  const onlineCredit = typeof student?.credit?.online === "number" ? student.credit.online : null
  const offlineCredit = typeof student?.credit?.offline === "number" ? student.credit.offline : null
  const onlineClasses = onlineCredit !== null ? Math.floor(onlineCredit) : null
  const offlineClasses = offlineCredit !== null ? Math.floor(offlineCredit) : null

  return (
    <tr
      className="border-b transition duration-150"
      style={{
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
      }}
    >
      {/* Name */}
      <td className="p-4 flex items-center gap-4">
        <FaUserGraduate className="text-[var(--accent-purple)] flex-shrink-0" />
        <span className="font-semibold">{student.username}</span>
      </td>

      {/* Email */}
      <td
        className="p-4 text-sm"
        style={{
          color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`,
        }}
      >
        {student.email}
      </td>

      {/* Class */}
      <td className="p-4 font-medium text-[var(--accent-teal)]">
        {student.class || "-"}
      </td>

      {/* Student Number */}
      <td className="p-4 font-bold">{student.student_number}</td>

      {/* Password Column (NEW) */}
      <td className="p-4">
        <div className="flex items-center gap-3 group">
          <span className="font-mono text-sm opacity-80 select-all">
            {student.password_text || "****"}
          </span>
          <button 
            onClick={() => onEditPassword(student)}
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-[var(--accent-purple)]"
            title="Change Password"
          >
            <FaPencilAlt size={12} />
          </button>
        </div>
      </td>

      {/* Remaining Credits */}
      <td className="p-4">
       <div className="flex flex-col gap-1 text-xs font-semibold text-white">
          {onlineClasses !== null && (
            <span className="px-3 py-1 rounded-lg w-fit" style={{ backgroundColor: "var(--accent-teal)" }}>
              Online: {onlineClasses}
            </span>
          )}
          {offlineClasses !== null && (
            <span className="px-3 py-1 rounded-lg w-fit" style={{ backgroundColor: "var(--accent-purple)" }}>
              Offline: {offlineClasses}
            </span>
          )}
        </div>
      </td>

      {/* Action */}
      <td className="p-4">
        <button
          onClick={() => navigate(`/admin/dashboard/student/${student._id}`)}
          className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all duration-300 hover:opacity-90"
          style={{
            background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))",
          }}
        >
          View Profile
        </button>
      </td>
    </tr>
  )
}

// ================================
// Add Student Button
// ================================
const AddStudentButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-all duration-300 flex items-center gap-2 hover:opacity-90"
    style={{
      background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))",
    }}
  >
    <FaPlus />
    Invite Student
  </button>
)

// ================================
// Main Page
// ================================
const AdminStudentPage = () => {
  const { isDark } = useOutletContext()
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate()

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true)
      const response = await getAllStudentDetails()

      if (response.success) {
        setStudents(response.data)
      } else {
        alert(response.message)
      }

      setIsLoading(false)
    }

    fetchStudents()
  }, [])

  // Handler to open modal
  const handleEditPassword = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  }

  // Handler for successful update (update local state)
  const handleUpdateSuccess = (studentId, newPassword) => {
    setStudents(prevStudents => prevStudents.map(s => {
      if (s._id === studentId) {
        return { ...s, password_text: newPassword };
      }
      return s;
    }));
  };

  const cardStyle = {
    backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
    backdropFilter: "blur(10px)",
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Students</h1>
        <AddStudentButton onClick={() => navigate("/admin/dashboard/invitation")} />
      </div>

      {isLoading ? (
        <p className="text-lg">Loading student data...</p>
      ) : students.length === 0 ? (
        <div
          className="p-8 rounded-2xl border text-center mt-8"
          style={cardStyle}
        >
          <FaUserCheck className="text-5xl mx-auto mb-6 text-[var(--accent-teal)]" />
          <h2 className="text-2xl font-bold mb-2">
            No Students Registered
          </h2>
          <p
            style={{
              color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`,
            }}
          >
            Use the "Invite Student" button to begin onboarding.
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl border overflow-x-auto shadow-xl"
          style={cardStyle}
        >
          <table className="w-full text-left border-collapse">
            <thead
              className="text-sm uppercase"
              style={{
                color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`,
              }}
            >
              <tr className="border-b">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Class</th>
                <th className="p-4">Student No.</th>
                <th className="p-4">Password</th> {/* NEW HEADER */}
                <th className="p-4">Remaining Credits</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <StudentRow
                  key={student._id}
                  student={student}
                  isDark={isDark}
                  navigate={navigate}
                  onEditPassword={handleEditPassword} // Pass handler
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Password Modal */}
      <PasswordModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={selectedStudent}
        isDark={isDark}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  )
}

export default AdminStudentPage