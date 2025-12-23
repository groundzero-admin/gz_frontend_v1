import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FaChalkboardTeacher, FaEnvelope, FaPhone, FaPlus, FaTimes, FaUserPlus } from "react-icons/fa";

// 1. Import the new inviteTeacher function along with listAllTeachers
import { listAllTeachers, inviteTeacher } from "../api.js"; 

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

// --- Invite Teacher Modal Component ---
const InviteTeacherModal = ({ isOpen, onClose, onSubmit, isDark }) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Call the parent's submit function
    const success = await onSubmit(email);

    setIsSubmitting(false);

    if (success) {
      setEmail(""); // Clear form on success
      onClose(); // Close modal
    }
    // If failed, we keep the modal open and data preserved so user can fix it
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
        className="relative w-full max-w-lg p-8 rounded-2xl border shadow-2xl"
        style={{ backgroundColor: modalBG, color: textColor, borderColor: modalBorder }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full transition hover:opacity-80"
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
            className="p-3 rounded-lg text-sm mb-6"
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
              className="px-6 py-2 rounded-lg font-semibold transition hover:opacity-80"
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
              className="px-6 py-2 rounded-lg font-semibold text-white transition flex items-center gap-2 hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))",
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
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

// --- Individual Teacher Card Component ---
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
    
    <button 
      className="w-full mt-6 px-4 py-2 rounded-lg font-semibold transition hover:bg-opacity-80"
      style={{
        backgroundColor: `var(${isDark ? "--border-dark" : "rgba(0,0,0,0.05)"})`,
        color: `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
      }}
    >
      View Profile
    </button>
  </div>
);

// --- "Add Teacher" Card ---
const AddTeacherCard = ({ isDark, onClick }) => (
  <button 
    onClick={onClick}
    className="p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center min-h-[268px] transition-all duration-300 hover:shadow-lg hover:border-[var(--accent-teal)] cursor-pointer w-full"
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setIsLoading(true);
    const response = await listAllTeachers();
    
    if (response.success) {
      setTeachers(response.data);
    } else {
      console.error(response.message);
    }
    setIsLoading(false);
  };

  // --- 2. Implement the Handle Invite Logic ---
  const handleSendInvite = async (email) => {
    const response = await inviteTeacher(email);
    
    if (response.success) {
      alert("Invitation sent successfully!");
      // Optional: Re-fetch teachers if the list should update immediately
      // fetchTeachers(); 
      return true; // Signals success to the modal
    } else {
      alert(response.message); // Show error to user
      return false; // Signals failure
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Teachers</h1>

      {isLoading ? (
        <p>Loading teachers...</p>
      ) : teachers.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AddTeacherCard isDark={isDark} onClick={() => setIsModalOpen(true)} />
          <p className="p-6 col-span-full" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
            No teachers found. Use the card above to add one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {teachers.map(teacher => (
            <TeacherCard key={teacher._id} teacher={teacher} isDark={isDark} />
          ))}
          {/* Add Teacher Card is now the last item in the grid */}
          <AddTeacherCard isDark={isDark} onClick={() => setIsModalOpen(true)} />
        </div>
      )}

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