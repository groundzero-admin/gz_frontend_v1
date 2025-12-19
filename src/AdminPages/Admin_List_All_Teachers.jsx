import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FaChalkboardTeacher, FaEnvelope, FaPhone, FaPlus, FaTimes, FaUserPlus } from "react-icons/fa";
// 1. Import sendInvite (assuming api.js is in the same directory)
import { listAllTeachers  } from "../api.js"; 

// --- Reusable Input Component for Modal ---
const ModalInput = ({ id, label, icon, isDark, ...props }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium mb-2">
      {label}
    </label>
    <div className="relative">
      <span 
        className="absolute left-4 top-1/2 -translate-y-1/2"
        style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
      >
        {icon}
      </span>
      <input
        id={id}
        className="w-full pl-12 pr-4 py-3 rounded-lg border bg-transparent transition"
        style={{
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
          color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
        }}
        {...props}
      />
    </div>
  </div>
);

// --- 2. New Invite Teacher Modal Component ---
const InviteTeacherModal = ({ isOpen, onClose, onSubmit, isDark }) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Call the parent's submit function, passing only the email
    const success = await onSubmit(email);

    if (success) {
      setEmail(""); // Clear form
      setIsSubmitting(false);
      onClose(); // Close modal
    } else {
      // If it failed, stop loading so user can try again
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Modal styles
  const modalBG = isDark ? "var(--bg-dark)" : "var(--bg-light)";
  const textColor = isDark ? "var(--text-dark-primary)" : "var(--text-light-primary)";
  const secondaryText = isDark ? "var(--text-dark-secondary)" : "var(--text-light-secondary)";
  const modalBorder = isDark ? "var(--border-dark)" : "var(--border-light)";

  return (
    <div 
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(5px)" }}
    >
      <div 
        className="relative w-full max-w-lg p-8 rounded-2xl border"
        style={{ backgroundColor: modalBG, color: textColor, borderColor: modalBorder }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full transition"
          style={{ color: secondaryText, backgroundColor: `var(${isDark ? "--card-dark" : "rgba(0,0,0,0.05)"})`}}
        >
          <FaTimes />
        </button>

        <h2 className="text-2xl font-bold mb-6">Invite New Teacher</h2>
        
        <form onSubmit={handleSubmit}>
          <ModalInput
            id="email"
            label="Teacher Email Address"
            icon={<FaEnvelope />}
            type="email"
            placeholder="teacher@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isDark={isDark}
            required
          />
          <div 
            className="p-3 rounded-lg text-sm"
            style={{
              backgroundColor: `var(${isDark ? "--bg-dark" : "rgba(0,0,0,0.03)"})`,
              color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`
            }}
          >
            Role: <strong>Teacher</strong> (This will be set automatically)
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-semibold"
              style={{
                backgroundColor: `var(${isDark ? "--border-dark" : "rgba(0,0,0,0.05)"})`,
                color: textColor
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg font-semibold text-white transition flex items-center gap-2"
              style={{
                background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))",
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              <FaUserPlus />
              {isSubmitting ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Individual Teacher Card Component (Unchanged) ---
const TeacherCard = ({ teacher, isDark }) => (
  <div 
    className="p-6 rounded-2xl border flex flex-col transition-all duration-300 hover:shadow-lg"
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
        <FaChalkboardTeacher className="text-3xl text-[var(--accent-teal)]" />
      </span>
      
      {/* Teacher Info */}
      <h3 className="text-xl font-bold mb-2">{teacher.name}</h3>
      <p 
        className="flex items-center gap-3 mb-2 text-sm" 
        style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
      >
        <FaEnvelope />
        {teacher.email}
      </p>
      <p 
        className="flex items-center gap-3 text-sm" 
        style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
      >
        <FaPhone />
        {teacher.mobile}
      </p>
    </div>
    
    {/* Action Button */}
    <button 
      className="w-full mt-6 px-4 py-2 rounded-lg font-semibold transition"
      style={{
        backgroundColor: `var(${isDark ? "--border-dark" : "rgba(0,0,0,0.05)"})`,
        color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
      }}
    >
      View Profile
    </button>
  </div>
);

// --- 3. "Add Teacher" Card (Updated with onClick) ---
const AddTeacherCard = ({ isDark, onClick }) => (
  <button 
    onClick={onClick} // Added onClick prop
    className="p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center min-h-[268px] transition-all duration-300 hover:shadow-lg"
    style={{
      borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`
    }}
  >
    <FaPlus className="text-4xl mb-4" />
    <span className="text-lg font-semibold">Add New Teacher</span>
  </button>
);

// --- Main Page Component ---
const AdminTeacherPage = () => {
  const { isDark } = useOutletContext(); 
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 4. Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoading(true);
      const response = await listAllTeachers();
      
      if (response.success) {
        setTeachers(response.data);
      } else {
        alert(response.message);
      }
      setIsLoading(false);
    };

    fetchTeachers();
  }, []); // Runs once on page load

  // 5. Add submit handler for the modal
  const handleSendInvite = async (email) => {
    // Call the API with email and "teacher" role
    // const response = await sendInvite(email, "teacher");
    
    // alert(response.message); // Show success or error message
    
    // if (response.success) {
    //   // You could re-fetch teachers here if you had an
    //   // "Invited" status, but for now, just return success.
    //   return true;
    // }
    return false; // Tell modal submission failed
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Teachers</h1>

      {/* Loading State */}
      {isLoading ? (
        <p>Loading teachers...</p>
      
      // Empty State
      ) : teachers.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AddTeacherCard isDark={isDark} onClick={() => setIsModalOpen(true)} />
          <p className="p-6" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
            No teachers found. Use the '+' card to add one.
          </p>
        </div>

      // Data State
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {teachers.map(teacher => (
            <TeacherCard key={teacher._id} teacher={teacher} isDark={isDark} />
          ))}
          <AddTeacherCard isDark={isDark} onClick={() => setIsModalOpen(true)} />
        </div>
      )}

      {/* 6. Render the modal */}
      <InviteTeacherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSendInvite}
        isDark={isDark}
      />
    </div>
  );
};

export default AdminTeacherPage;