import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { FaRegHandPeace } from 'react-icons/fa';

// A clean SVG illustration for the welcome page
const WelcomeSVG = ({ isDark }) => (
  <svg
    viewBox="0 0 200 200"
    width="100%"
    height="100%"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="welcome-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--accent-teal)" />
        <stop offset="100%" stopColor="var(--accent-purple)" />
      </linearGradient>
    </defs>
    
    {/* Pulsing background glow */}
    <circle 
      cx="100" 
      cy="100" 
      r="80" 
      fill="url(#welcome-grad)" 
      opacity="0.1"
    >
      <animate 
        attributeName="r" 
        values="80; 90; 80" 
        dur="4s" 
        repeatCount="indefinite" 
      />
      <animate 
        attributeName="opacity" 
        values="0.1; 0.2; 0.1" 
        dur="4s" 
        repeatCount="indefinite" 
      />
    </circle>
    
    {/* Main shape */}
    <circle cx="100" cy="100" r="70" fill={isDark ? "var(--card-dark)" : "var(--bg-light)"} />
    <circle cx="100" cy="100" r="70" stroke="url(#welcome-grad)" strokeWidth="4" />
    
    {/* Icon */}
    <foreignObject x="60" y="60" width="80" height="80">
       <FaRegHandPeace 
         size="80" 
         color={isDark ? "var(--text-dark-primary)" : "var(--text-light-primary)"} 
       />
    </foreignObject>
  </svg>
);


const AdminDashboard = () => {
  // Get userData and isDark from the parent AdminLayout
  const { isDark, userData } = useOutletContext();
  const username = userData?.username || "Admin"; // Fallback if data is missing

  return (
    <div className="flex flex-col items-center justify-center -mt-10 md:mt-0">
      <div 
        className="w-full max-w-4xl p-8 md:p-12 rounded-2xl border text-center"
        style={{
          backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
          backdropFilter: "blur(10px)"
        }}
      >
        {/* SVG Illustration */}
        <div className="w-48 h-48 mx-auto mb-6">
          <WelcomeSVG isDark={isDark} />
        </div>
        
        {/* Welcome Text */}
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-purple)] bg-clip-text text-transparent">
            GroundZero
          </span>
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          Hello, {username}!
        </h2>
        
        <p 
          className="text-lg max-w-lg mx-auto mb-8"
          style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}
        >
          You are in the admin control panel. You can manage all pending requests,
          user invitations, courses, and platform users right from the sidebar.
        </p>
        
        {/* Call to Action Button */}
        <Link 
          to="/admin/dashboard/request"
          className="px-8 py-3 rounded-xl font-bold text-lg text-white inline-block transition-transform hover:scale-105"
          style={{
            background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))"
          }}
        >
          View Pending Requests
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;