import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { FaBook, FaUserGraduate, FaCalendarAlt, FaQuestionCircle } from 'react-icons/fa';

// --- Reusable Quick Action Card ---
const QuickActionCard = ({ to, icon, title, description, isDark }) => (
  <Link
    to={to}
    className="p-6 rounded-2xl border flex items-center gap-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    style={{
      backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
      borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
      backdropFilter: "blur(10px)"
    }}
  >
    <span 
      className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full"
      style={{ 
        backgroundColor: `var(${isDark ? "--bg-dark" : "rgba(0,0,0,0.03)"})`,
      }}
    >
      {icon}
    </span>
    <div>
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <p style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
        {description}
      </p>
    </div>
  </Link>
);

// --- Welcome SVG Illustration ---
const WelcomeSVG = ({ isDark }) => (
  <svg viewBox="0 0 200 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="teacher-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--accent-teal)" />
        <stop offset="100%" stopColor="var(--accent-purple)" />
      </linearGradient>
    </defs>
    
    {/* Chalkboard */}
    <rect 
      x="20" y="30" 
      width="160" height="120" 
      rx="10" 
      fill={`var(${isDark ? "--card-dark" : "--bg-light"})`} 
      stroke="url(#teacher-grad)" 
      strokeWidth="6" 
    />
    <line 
      x1="30" y1="140" x2="70" y2="140" 
      stroke={`var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`} 
      strokeWidth="4"
    />
    <path 
      d="M 50,110 Q 70,90 90,110 T 130,110"
      fill="none"
      stroke={`var(${isDark ? "white" : "var(--text-light-primary)"})`} 
      strokeWidth="5"
    />
  </svg>
);


const TeacherWelcome = () => {
  const { isDark, userData } = useOutletContext();

  return (
    <div className="flex flex-col gap-8">
      {/* --- Main Welcome Card --- */}
      <div 
        className="p-8 rounded-2xl border flex flex-col md:flex-row items-center justify-between overflow-hidden"
        style={{
          backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
          borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        }}
      >
        <div className="z-10">
          <h1 className="text-4xl font-bold mb-3">
            Hello, {userData.username}!
          </h1>
          <p className="text-lg mb-8" style={{ color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`}}>
            Welcome to your dashboard. Manage your students and courses.
          </p>
          <div className="flex items-center gap-4">
            <Link 
              to="/teacher/dashboard/course"
              className="px-6 py-3 rounded-xl font-bold text-lg text-white"
              style={{
                background: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))"
              }}
            >
              View My Courses
            </Link>
            <Link 
              to="/teacher/dashboard/doubts"
              className="px-6 py-3 rounded-xl font-bold text-lg"
              style={{
                backgroundColor: `var(${isDark ? "--border-dark" : "rgba(0,0,0,0.05)"})`,
              }}
            >
              Check Doubts
            </Link>
          </div>
        </div>
        <div className="w-48 h-48 mt-8 md:mt-0 z-10">
          <WelcomeSVG isDark={isDark} />
        </div>
      </div>

      {/* --- Quick Action Cards --- */}
      <h2 className="text-2xl font-bold">Quick Links</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <QuickActionCard 
          to="/teacher/dashboard/course" 
          icon={<FaBook className="text-3xl text-[var(--accent-purple)]" />} 
          title="My Courses"
          description="Manage worksheets and content for your courses."
          isDark={isDark}
        />
        <QuickActionCard 
          to="/teacher/dashboard/mystudents" 
          icon={<FaUserGraduate className="text-3xl text-[var(--accent-teal)]" />} 
          title="My Students"
          description="View progress and details for your students."
          isDark={isDark}
        />
        <QuickActionCard 
          to="/teacher/dashboard/schedules" 
          icon={<FaCalendarAlt className="text-3xl text-orange-400" />} 
          title="Class Schedules"
          description="View and manage your upcoming classes."
          isDark={isDark}
        />
        <QuickActionCard 
          to="/teacher/dashboard/doubts" 
          icon={<FaQuestionCircle className="text-3xl text-blue-400" />} 
          title="Doubt Solver"
          description="Review and answer questions from your students."
          isDark={isDark}
        />
      </div>
    </div>
  );
};

export default TeacherWelcome;