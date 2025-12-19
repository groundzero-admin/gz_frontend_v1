////////////////// whole page is useless dummy redeign it pls 







import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FaEnvelope, FaUsers, FaChevronDown, FaChild, FaUserFriends } from 'react-icons/fa';
// import { sendInvite } from '../api.js';

// --- Reusable Input Component for this form ---
const FormInput = ({ id, label, icon, placeholder, value, onChange, type = "text", isDark }) => {
  const inputStyle = {
    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
    backgroundColor: `var(${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)"})`
  };

  return (
    <>
      <label htmlFor={id} className="block text-sm font-medium mb-2">
        {label}
      </label>
      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
          {icon}
        </span>
        <input
          type={type}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full pl-12 pr-4 py-3 rounded-lg border bg-transparent"
          style={inputStyle}
          required={type !== "text"} // Only email and role are truly "required"
        />
      </div>
    </>
  );
};


const AdminInvitationsPage = () => {
  const { isDark } = useOutletContext(); // Get theme from parent
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(''); // Empty string for placeholder
  const [parentEmails, setParentEmails] = useState('');
  const [childEmails, setChildEmails] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) {
      alert("Please select a role.");
      return;
    }
    
    setIsLoading(true);

    // Split comma-separated emails into arrays
    const parentEmailsArr = parentEmails.split(',').map(e => e.trim()).filter(Boolean);
    const childEmailsArr = childEmails.split(',').map(e => e.trim()).filter(Boolean);

    // const response = await sendInvite(email, role, parentEmailsArr, childEmailsArr);
    
    // // All backend responses (400, 409, 200, 500) have a 'message'
    // alert(response.message); 

    // if (response.success) {
    //   // Clear form on success
    //   setEmail('');
    //   setRole('');
    //   setParentEmails('');
    //   setChildEmails('');
    // }
    setIsLoading(false);
  };

  const cardStyle = {
    backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
    backdropFilter: "blur(10px)"
  };

  const inputStyle = {
    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
    backgroundColor: `var(${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)"})`
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Invitations</h1>

      {/* Main Form Card */}
      <div className="max-w-lg mx-auto p-8 rounded-2xl border" style={cardStyle}>
        <h2 className="text-2xl font-bold mb-2">Invite New User</h2>
        <p style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})` }} className="mb-6">
          Enter the email and select a role to send an invitation.
        </p>

        <form onSubmit={handleSubmit}>
          
          <FormInput
            id="email"
            label="Email address"
            icon={<FaEnvelope />}
            placeholder="Enter user's email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            isDark={isDark}
          />

          {/* Assign Role */}
          <label htmlFor="role" className="block text-sm font-medium mb-2">Assign Role</label>
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
              <FaUsers />
            </span>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full pl-12 pr-10 py-3 rounded-lg border bg-transparent appearance-none"
              style={{
                ...inputStyle,
                color: role === "" 
                  ? `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})` 
                  : `var(${isDark ? "--text-dark-primary" : "--text-light-primary"})`
              }}
              required
            >
              <option value="" disabled>Select a role</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
              <FaChevronDown />
            </span>
          </div>

          {/* === DYNAMIC FIELDS === */}

          {role === 'student' && (
            <FormInput
              id="parentEmails"
              label="Parent Emails (Optional)"
              icon={<FaUserFriends />}
              placeholder="parent1@mail.com, parent2@mail.com"
              value={parentEmails}
              onChange={(e) => setParentEmails(e.target.value)}
              isDark={isDark}
            />
          )}

          {role === 'parent' && (
            <FormInput
              id="childEmails"
              label="Child Emails (Optional)"
              icon={<FaChild />}
              placeholder="child1@mail.com, child2@mail.com"
              value={childEmails}
              onChange={(e) => setChildEmails(e.target.value)}
              isDark={isDark}
            />
          )}

          {/* === END DYNAMIC FIELDS === */}


          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-8 py-3 rounded-xl font-bold text-lg text-white transition-all duration-300 disabled:opacity-70 mt-4"
            style={{
              background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))",
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? "Sending..." : "Send Invite"}
          </button>
        </form>
      </div>

      {/* Style for the select options to look good in dark mode */}
      <style>{`
        select option {
          background-color: var(${isDark ? "--bg-dark" : "--bg-light"});
          color: var(${isDark ? "--text-dark-primary" : "--text-light-primary"});
        }
      `}</style>
    </div>
  );
};

export default AdminInvitationsPage;